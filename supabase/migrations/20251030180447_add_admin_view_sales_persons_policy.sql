/*
  # Add admin policy to view all sales persons

  1. Changes
    - Add RLS policy allowing admins to view all sales_persons
    - This enables the admin dashboard to list all sales team members

  2. Security
    - Only users with role='admin' in profiles table can view all sales persons
*/

-- Add policy for admins to view all sales persons
CREATE POLICY "Admins can view all sales persons"
  ON sales_persons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
