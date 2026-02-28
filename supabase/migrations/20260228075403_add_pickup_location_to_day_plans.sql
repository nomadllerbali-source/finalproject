/*
  # Add Pickup Location to Day Plans

  1. Changes
    - Add `pickup_location` TEXT column to `day_plans` table
    - This stores the selected pickup location for each day's plan (especially for Nusa Penida tours)
    
  2. Notes
    - Column is nullable to maintain backward compatibility
    - Works in conjunction with the pickup_locations field in sightseeings table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_plans' AND column_name = 'pickup_location'
  ) THEN
    ALTER TABLE day_plans ADD COLUMN pickup_location TEXT DEFAULT NULL;
  END IF;
END $$;
