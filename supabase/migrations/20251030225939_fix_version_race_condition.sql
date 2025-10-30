/*
  # Fix Version Number Race Condition

  ## Purpose
  This migration fixes the race condition in creating itinerary versions by creating
  an atomic function that gets the next version number and inserts the record in a
  single transaction.

  ## Changes

  1. Creates a new function `create_itinerary_version_atomic` that:
     - Locks the client record to prevent concurrent version creation
     - Gets the next version number
     - Inserts the new version
     - All in a single atomic transaction

  2. This prevents the duplicate key error that occurs when multiple requests
     try to create versions simultaneously

  ## Important Notes
  - The function uses SECURITY DEFINER to bypass RLS for the insert operation
  - RLS policies are still enforced for selecting versions
  - The function validates that the user has permission to create versions for the client
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_itinerary_version_atomic;

-- Create atomic version creation function
CREATE OR REPLACE FUNCTION create_itinerary_version_atomic(
  p_client_id uuid,
  p_itinerary_data jsonb,
  p_total_cost numeric,
  p_change_description text,
  p_associated_follow_up_status text,
  p_created_by uuid
)
RETURNS sales_itinerary_versions AS $$
DECLARE
  v_next_version integer;
  v_new_version sales_itinerary_versions;
  v_is_sales_person boolean;
  v_is_admin boolean;
BEGIN
  -- Check if user is the sales person for this client or an admin
  SELECT
    EXISTS(SELECT 1 FROM sales_clients WHERE id = p_client_id AND sales_person_id = p_created_by),
    EXISTS(SELECT 1 FROM profiles WHERE id = p_created_by AND role = 'admin')
  INTO v_is_sales_person, v_is_admin;

  -- Verify user has permission
  IF NOT (v_is_sales_person OR v_is_admin) THEN
    RAISE EXCEPTION 'User does not have permission to create versions for this client';
  END IF;

  -- Lock the client row to prevent concurrent version creation
  -- This ensures only one version creation can happen at a time per client
  PERFORM id FROM sales_clients WHERE id = p_client_id FOR UPDATE;

  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_version
  FROM sales_itinerary_versions
  WHERE client_id = p_client_id;

  -- Insert the new version
  INSERT INTO sales_itinerary_versions (
    client_id,
    version_number,
    itinerary_data,
    total_cost,
    change_description,
    associated_follow_up_status,
    created_by
  ) VALUES (
    p_client_id,
    v_next_version,
    p_itinerary_data,
    p_total_cost,
    p_change_description,
    p_associated_follow_up_status,
    p_created_by
  )
  RETURNING * INTO v_new_version;

  RETURN v_new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_itinerary_version_atomic(uuid, jsonb, numeric, text, text, uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION create_itinerary_version_atomic IS 'Atomically creates a new itinerary version with proper locking to prevent race conditions';
