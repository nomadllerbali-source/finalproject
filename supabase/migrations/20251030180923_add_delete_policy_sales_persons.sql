/*
  # Add DELETE policy for sales_persons

  1. Changes
    - Add RLS policy allowing admins to delete sales persons
    - Enables admin to remove sales team members

  2. Security
    - Only users with role='admin' in profiles table can delete sales persons
*/

-- Add policy for admins to delete sales persons
CREATE POLICY "Admins can delete sales persons"
  ON sales_persons FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
