/*
  # Add Display Name to Sightseeings

  1. Changes
    - Add `display_name` column to `sightseeings` table
      - This field will be shown as a bold heading in the final itinerary
      - The existing `description` field will show below it as details
    
  2. Notes
    - The `display_name` is the prominent title shown to clients
    - The `name` field remains for internal identification
    - Default value set to empty string for backward compatibility
*/

-- Add display_name column to sightseeings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sightseeings' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.sightseeings 
    ADD COLUMN display_name text DEFAULT '';
  END IF;
END $$;

-- Update existing records to use the name field as display_name if empty
UPDATE public.sightseeings 
SET display_name = name 
WHERE display_name = '' OR display_name IS NULL;