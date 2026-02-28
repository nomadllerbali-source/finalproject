/*
  # Add Pickup Locations to Sightseeings

  1. Changes
    - Add `pickup_locations` JSONB column to `sightseeings` table to store array of pickup location strings
    - This allows each sightseeing spot (especially Nusa Penida tours) to have multiple pickup location options
    
  2. Notes
    - Column is nullable to maintain backward compatibility
    - Uses JSONB for flexibility to store array of strings
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sightseeings' AND column_name = 'pickup_locations'
  ) THEN
    ALTER TABLE sightseeings ADD COLUMN pickup_locations JSONB DEFAULT NULL;
  END IF;
END $$;
