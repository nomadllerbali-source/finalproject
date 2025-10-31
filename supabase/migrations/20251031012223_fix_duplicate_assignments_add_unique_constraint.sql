/*
  # Fix Duplicate Assignments and Add Unique Constraint

  1. Changes
    - Delete duplicate package_assignments (keeping only the most recent one per client)
    - Add unique constraint on sales_client_id to prevent future duplicates
    - This ensures one client can only have one active assignment

  2. Security
    - No RLS changes needed
*/

-- Delete duplicate assignments, keeping only the most recent one for each client
DELETE FROM package_assignments a
USING package_assignments b
WHERE a.sales_client_id = b.sales_client_id
  AND a.created_at < b.created_at;

-- Add unique constraint to prevent future duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'package_assignments_sales_client_id_key'
  ) THEN
    ALTER TABLE package_assignments
    ADD CONSTRAINT package_assignments_sales_client_id_key UNIQUE (sales_client_id);
  END IF;
END $$;
