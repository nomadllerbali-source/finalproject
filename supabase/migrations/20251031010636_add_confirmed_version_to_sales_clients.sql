/*
  # Add Confirmed Version Tracking to Sales Clients

  1. Changes
    - Add `confirmed_version_id` column to `sales_clients` table
    - This stores which itinerary version was confirmed when the booking was finalized
    - Links to `sales_itinerary_versions` table
    - Nullable because only set when status reaches 'advance-paid-confirmed'

  2. Security
    - No RLS changes needed as sales_clients already has proper policies
*/

-- Add confirmed version tracking to sales_clients
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_clients' AND column_name = 'confirmed_version_id'
  ) THEN
    ALTER TABLE sales_clients 
    ADD COLUMN confirmed_version_id uuid REFERENCES sales_itinerary_versions(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_sales_clients_confirmed_version 
    ON sales_clients(confirmed_version_id);
  END IF;
END $$;
