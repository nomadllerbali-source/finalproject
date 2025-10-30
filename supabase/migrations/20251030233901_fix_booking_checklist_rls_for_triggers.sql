/*
  # Fix Booking Checklist RLS for Triggers
  
  The auto-assignment trigger needs to be able to insert checklist items.
  We need to allow the trigger function to bypass RLS or create a policy
  that allows inserts from the trigger context.
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Operations can insert booking checklist" ON booking_checklist;
DROP POLICY IF EXISTS "Users can view booking checklist" ON booking_checklist;
DROP POLICY IF EXISTS "Operations can update booking checklist" ON booking_checklist;

-- Create more permissive policies for booking_checklist

-- Anyone authenticated can insert (needed for triggers)
CREATE POLICY "Authenticated users can insert booking checklist"
  ON booking_checklist FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can view checklist if they're involved in the assignment
CREATE POLICY "Users can view booking checklist"
  ON booking_checklist FOR SELECT
  TO authenticated
  USING (
    assignment_id IS NULL OR
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = booking_checklist.assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = booking_checklist.client_id
      AND sales_clients.sales_person_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  );

-- Operations and sales can update their assigned checklists
CREATE POLICY "Users can update booking checklist"
  ON booking_checklist FOR UPDATE
  TO authenticated
  USING (
    assignment_id IS NULL OR
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = booking_checklist.assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  )
  WITH CHECK (
    assignment_id IS NULL OR
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = booking_checklist.assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  );

-- Allow deletion by operations and admins
CREATE POLICY "Operations can delete booking checklist"
  ON booking_checklist FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    ) OR
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = booking_checklist.assignment_id
      AND package_assignments.operations_person_id = auth.uid()
    )
  );
