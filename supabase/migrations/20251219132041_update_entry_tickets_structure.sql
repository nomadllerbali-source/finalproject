/*
  # Update Entry Tickets Structure

  1. Changes
    - Remove `sightseeing_id` column (no longer needed)
    - Replace single `cost` column with `adult_cost` and `child_cost`
    - Add `area_id` and `area_name` fields for area association
    - Update existing data to migrate cost to adult_cost and child_cost

  2. Migration Steps
    - Add new columns (adult_cost, child_cost, area_id, area_name)
    - Copy existing cost data to adult_cost and child_cost
    - Remove old sightseeing_id column
    - Remove old cost column
*/

-- Add new columns
DO $$
BEGIN
  -- Add adult_cost column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'adult_cost'
  ) THEN
    ALTER TABLE entry_tickets ADD COLUMN adult_cost INTEGER DEFAULT 0;
  END IF;

  -- Add child_cost column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'child_cost'
  ) THEN
    ALTER TABLE entry_tickets ADD COLUMN child_cost INTEGER DEFAULT 0;
  END IF;

  -- Add area_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'area_id'
  ) THEN
    ALTER TABLE entry_tickets ADD COLUMN area_id UUID REFERENCES areas(id) ON DELETE SET NULL;
  END IF;

  -- Add area_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'area_name'
  ) THEN
    ALTER TABLE entry_tickets ADD COLUMN area_name TEXT;
  END IF;
END $$;

-- Migrate existing data: copy cost to both adult_cost and child_cost
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'cost'
  ) THEN
    UPDATE entry_tickets
    SET adult_cost = cost, child_cost = cost
    WHERE adult_cost = 0 AND child_cost = 0;
  END IF;
END $$;

-- Drop old columns
DO $$
BEGIN
  -- Drop sightseeing_id if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'sightseeing_id'
  ) THEN
    ALTER TABLE entry_tickets DROP COLUMN sightseeing_id;
  END IF;

  -- Drop cost column if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entry_tickets' AND column_name = 'cost'
  ) THEN
    ALTER TABLE entry_tickets DROP COLUMN cost;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_entry_tickets_area_id ON entry_tickets(area_id);
