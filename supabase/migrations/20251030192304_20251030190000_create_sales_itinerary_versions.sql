/*
  # Create Sales Itinerary Versions Table

  ## Purpose
  This migration creates a comprehensive itinerary versioning system for the sales portal.
  It allows tracking of all itinerary changes over time with complete history.

  ## Changes

  1. New Tables
    - `sales_itinerary_versions` - Stores complete history of all itinerary versions per client
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to sales_clients)
      - `version_number` (integer) - Auto-incrementing version number per client
      - `itinerary_data` (jsonb) - Complete itinerary data including day plans
      - `total_cost` (numeric) - Total cost for this version
      - `change_description` (text) - Description of what changed in this version
      - `associated_follow_up_status` (text) - Follow-up status at time of creation
      - `created_at` (timestamptz) - When this version was created
      - `created_by` (uuid, foreign key to auth.users) - Who created this version

  2. Constraints
    - Unique constraint on (client_id, version_number)
    - Check constraint ensuring version_number > 0

  3. Indexes
    - Index on client_id for efficient querying
    - Index on (client_id, version_number) for version lookups
    - Index on created_at for chronological queries

  4. Security
    - Enable RLS on sales_itinerary_versions
    - Sales persons can view versions for their own clients
    - Operations can view versions for assigned clients
    - Admins can view all versions

  5. Functions
    - Trigger function to auto-increment version numbers per client
*/

-- Create sales_itinerary_versions table
CREATE TABLE IF NOT EXISTS sales_itinerary_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES sales_clients(id) ON DELETE CASCADE,
  version_number integer NOT NULL CHECK (version_number > 0),
  itinerary_data jsonb NOT NULL,
  total_cost numeric(10, 2) NOT NULL DEFAULT 0,
  change_description text NOT NULL DEFAULT 'Initial itinerary',
  associated_follow_up_status text NOT NULL DEFAULT 'itinerary-created',
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id),
  UNIQUE(client_id, version_number)
);

-- Enable RLS
ALTER TABLE sales_itinerary_versions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_itinerary_versions_client
  ON sales_itinerary_versions(client_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_versions_client_version
  ON sales_itinerary_versions(client_id, version_number DESC);

CREATE INDEX IF NOT EXISTS idx_itinerary_versions_created
  ON sales_itinerary_versions(created_at DESC);

-- RLS Policies

-- Sales persons can view versions for their own clients
CREATE POLICY "Sales persons can view own client versions"
  ON sales_itinerary_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND sales_clients.sales_person_id = auth.uid()
    )
  );

-- Operations can view versions for assigned clients
CREATE POLICY "Operations can view assigned client versions"
  ON sales_itinerary_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND sales_clients.assigned_operation_person_id = auth.uid()
    )
  );

-- Admins can view all versions
CREATE POLICY "Admins can view all versions"
  ON sales_itinerary_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Sales persons can insert versions for their own clients
CREATE POLICY "Sales persons can insert own client versions"
  ON sales_itinerary_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND sales_clients.sales_person_id = auth.uid()
    )
  );

-- Admins can insert versions for any client
CREATE POLICY "Admins can insert all versions"
  ON sales_itinerary_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to get next version number for a client
CREATE OR REPLACE FUNCTION get_next_version_number(p_client_id uuid)
RETURNS integer AS $$
DECLARE
  v_next_version integer;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_next_version
  FROM sales_itinerary_versions
  WHERE client_id = p_client_id;

  RETURN v_next_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_next_version_number(uuid) TO authenticated;
