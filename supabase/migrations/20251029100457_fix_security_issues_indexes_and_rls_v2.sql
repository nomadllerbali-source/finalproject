/*
  # Fix Security and Performance Issues

  1. Add Indexes for Foreign Keys
    - Add indexes for all unindexed foreign keys to improve query performance
    - Covers activity_options, agent_registrations, clients, day_plans, entry_tickets
    - Covers fixed_itineraries, follow_up_records, itineraries, itinerary_changes, room_types, sales_persons

  2. Fix RLS Policies
    - Update all sales_persons RLS policies to use (select auth.uid()) for better performance
    - Combine multiple permissive SELECT policies into a single policy

  3. Fix Function Security
    - Update update_sales_persons_updated_at function with secure search_path
*/

-- =============================================================================
-- PART 1: Add indexes for all unindexed foreign keys
-- =============================================================================

-- activity_options table
CREATE INDEX IF NOT EXISTS idx_activity_options_activity_id 
  ON activity_options(activity_id);

-- agent_registrations table
CREATE INDEX IF NOT EXISTS idx_agent_registrations_approved_by 
  ON agent_registrations(approved_by);

-- clients table
CREATE INDEX IF NOT EXISTS idx_clients_created_by 
  ON clients(created_by);

-- day_plans table
CREATE INDEX IF NOT EXISTS idx_day_plans_itinerary_id 
  ON day_plans(itinerary_id);

-- entry_tickets table
CREATE INDEX IF NOT EXISTS idx_entry_tickets_sightseeing_id 
  ON entry_tickets(sightseeing_id);

-- fixed_itineraries table
CREATE INDEX IF NOT EXISTS idx_fixed_itineraries_created_by 
  ON fixed_itineraries(created_by);

-- follow_up_records table
CREATE INDEX IF NOT EXISTS idx_follow_up_records_client_id 
  ON follow_up_records(client_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_records_updated_by 
  ON follow_up_records(updated_by);

-- itineraries table
CREATE INDEX IF NOT EXISTS idx_itineraries_client_id 
  ON itineraries(client_id);

CREATE INDEX IF NOT EXISTS idx_itineraries_updated_by 
  ON itineraries(updated_by);

-- itinerary_changes table
CREATE INDEX IF NOT EXISTS idx_itinerary_changes_itinerary_id 
  ON itinerary_changes(itinerary_id);

CREATE INDEX IF NOT EXISTS idx_itinerary_changes_updated_by 
  ON itinerary_changes(updated_by);

-- room_types table
CREATE INDEX IF NOT EXISTS idx_room_types_hotel_id 
  ON room_types(hotel_id);

-- sales_persons table
CREATE INDEX IF NOT EXISTS idx_sales_persons_created_by 
  ON sales_persons(created_by);

-- =============================================================================
-- PART 2: Fix RLS Policies - Drop and recreate with optimized auth checks
-- =============================================================================

-- Drop existing sales_persons policies
DROP POLICY IF EXISTS "Admins can read all sales persons" ON sales_persons;
DROP POLICY IF EXISTS "Sales persons can read own data" ON sales_persons;
DROP POLICY IF EXISTS "Admins can insert sales persons" ON sales_persons;
DROP POLICY IF EXISTS "Admins can update sales persons" ON sales_persons;
DROP POLICY IF EXISTS "Admins can delete sales persons" ON sales_persons;

-- Create optimized combined SELECT policy
CREATE POLICY "Sales persons access control"
  ON sales_persons FOR SELECT
  TO authenticated
  USING (
    -- Allow admins to see all sales persons
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
    OR
    -- Allow sales persons to see their own data
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.email = sales_persons.email
    )
  );

-- Optimized INSERT policy
CREATE POLICY "Admins can insert sales persons"
  ON sales_persons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Optimized UPDATE policy
CREATE POLICY "Admins can update sales persons"
  ON sales_persons FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Optimized DELETE policy
CREATE POLICY "Admins can delete sales persons"
  ON sales_persons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- =============================================================================
-- PART 3: Fix function security with immutable search_path
-- =============================================================================

-- Drop the trigger first
DROP TRIGGER IF EXISTS update_sales_persons_timestamp ON sales_persons;

-- Drop and recreate the function with secure search_path
DROP FUNCTION IF EXISTS update_sales_persons_updated_at();

CREATE OR REPLACE FUNCTION update_sales_persons_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_sales_persons_timestamp
  BEFORE UPDATE ON sales_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_persons_updated_at();