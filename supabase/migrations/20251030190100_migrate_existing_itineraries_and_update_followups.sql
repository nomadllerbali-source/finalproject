/*
  # Migrate Existing Itineraries and Update Follow-up History

  ## Purpose
  This migration:
  1. Migrates all existing itinerary data from sales_clients to sales_itinerary_versions as version 1
  2. Adds itinerary_version_number field to follow_up_history table
  3. Updates existing follow-up records to reference the appropriate version

  ## Changes

  1. Migrate Existing Data
    - Create version 1 for all sales_clients that have itinerary_data
    - Use the client's sales_person_id as created_by
    - Set change_description to "Initial itinerary"
    - Use current_follow_up_status as associated_follow_up_status

  2. Update follow_up_history Table
    - Add itinerary_version_number field (integer, nullable)
    - Add index on (client_id, itinerary_version_number)

  3. Data Integrity
    - Ensure all migrated versions are properly linked
    - Update existing follow-up history to reference version 1 where applicable
*/

-- Add itinerary_version_number to follow_up_history table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_up_history' AND column_name = 'itinerary_version_number'
  ) THEN
    ALTER TABLE follow_up_history ADD COLUMN itinerary_version_number integer;
  END IF;
END $$;

-- Create index for follow_up_history version lookups
CREATE INDEX IF NOT EXISTS idx_follow_up_history_version
  ON follow_up_history(client_id, itinerary_version_number);

-- Migrate existing itinerary data to sales_itinerary_versions
-- This creates version 1 for all clients that have itinerary_data
INSERT INTO sales_itinerary_versions (
  client_id,
  version_number,
  itinerary_data,
  total_cost,
  change_description,
  associated_follow_up_status,
  created_at,
  created_by
)
SELECT
  sc.id AS client_id,
  1 AS version_number,
  sc.itinerary_data,
  sc.total_cost,
  'Initial itinerary' AS change_description,
  sc.current_follow_up_status AS associated_follow_up_status,
  sc.created_at,
  sc.sales_person_id AS created_by
FROM sales_clients sc
WHERE sc.itinerary_data IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM sales_itinerary_versions siv
    WHERE siv.client_id = sc.id AND siv.version_number = 1
  );

-- Update existing follow_up_history records to reference version 1
-- This links historical follow-ups to the initial itinerary version
UPDATE follow_up_history fh
SET itinerary_version_number = 1
WHERE fh.itinerary_version_number IS NULL
  AND EXISTS (
    SELECT 1 FROM sales_itinerary_versions siv
    WHERE siv.client_id = fh.client_id AND siv.version_number = 1
  );

-- Add comment to explain the schema
COMMENT ON COLUMN follow_up_history.itinerary_version_number IS 'References the itinerary version that was active during this follow-up';
COMMENT ON TABLE sales_itinerary_versions IS 'Stores complete version history of all client itineraries';
