/*
  # Add Entry Ticket IDs to Sightseeings

  1. Changes
    - Add `entry_ticket_ids` column to `sightseeings` table
      - Stores array of entry ticket IDs associated with cab-mode sightseeing spots
      - Only applicable for cab transportation mode
      - Allows bundling entry tickets with sightseeing tours

  2. Notes
    - This column will be populated only for sightseeing spots with transportation_mode = 'cab'
    - Self-drive modes (car/scooter) will have empty arrays or NULL
    - Entry tickets must be from the same area as the sightseeing spot
*/

-- Add entry_ticket_ids column to sightseeings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sightseeings' AND column_name = 'entry_ticket_ids'
  ) THEN
    ALTER TABLE sightseeings ADD COLUMN entry_ticket_ids text[] DEFAULT '{}';
  END IF;
END $$;
