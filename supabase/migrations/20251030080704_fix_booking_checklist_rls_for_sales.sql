/*
  # Fix booking_checklist RLS policies to allow sales users

  1. Changes
    - Update INSERT policy to allow sales users to create booking checklists for their own clients
    
  2. Security
    - Sales users can only insert booking checklist items for clients they own
    - Operations and admin users retain full access
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Operations can insert booking checklist" ON booking_checklist;

-- Create new insert policy that allows sales users to create checklists for their clients
CREATE POLICY "Sales and operations can insert booking checklist"
  ON booking_checklist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Sales user can insert for their own clients
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = booking_checklist.client_id
      AND sales_clients.sales_person_id = auth.uid()
    )
    OR
    -- Operations and admin can insert for any client
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('operations', 'admin')
    )
  );
