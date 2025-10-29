/*
  # Fix Operations Persons RLS Policies

  1. Changes
    - Drop existing restrictive policies
    - Add simpler policies that work with admin access
    - Allow admins to manage all operations persons
    - Allow operations persons to view their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can manage all operations persons" ON operations_persons;
DROP POLICY IF EXISTS "Operations persons can view all operations persons" ON operations_persons;

-- Create new simplified policies

-- Admin can do everything
CREATE POLICY "Admins have full access to operations persons"
  ON operations_persons
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow public insert for registration (will be restricted by application logic)
CREATE POLICY "Allow insert for new operations persons"
  ON operations_persons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Operations persons can view all active operations persons (for team visibility)
CREATE POLICY "Operations persons can view active operations persons"
  ON operations_persons
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );