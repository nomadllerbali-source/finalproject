/*
  # Recreate Agent Registrations RLS Policies
  
  1. Changes
    - Drop all existing policies
    - Recreate policies with proper permissions
    - Allow public (anon and authenticated) to INSERT
    - Only admins can SELECT, UPDATE, DELETE
  
  2. Security
    - RLS enabled
    - Public registration allowed
    - Admin-only management
*/

-- Drop all existing policies
DROP POLICY IF EXISTS agent_registrations_insert_policy ON agent_registrations;
DROP POLICY IF EXISTS agent_registrations_select_policy ON agent_registrations;
DROP POLICY IF EXISTS agent_registrations_update_policy ON agent_registrations;
DROP POLICY IF EXISTS agent_registrations_delete_policy ON agent_registrations;

-- Create INSERT policy for both anon and authenticated users
CREATE POLICY "Anyone can register as agent"
  ON agent_registrations
  FOR INSERT
  WITH CHECK (true);

-- Create SELECT policy for admins only
CREATE POLICY "Admins can view registrations"
  ON agent_registrations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Create UPDATE policy for admins only
CREATE POLICY "Admins can update registrations"
  ON agent_registrations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Create DELETE policy for admins only
CREATE POLICY "Admins can delete registrations"
  ON agent_registrations
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );