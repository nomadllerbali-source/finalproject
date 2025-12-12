/*
  # Add Occupancy Range to Transportations Table

  1. Changes
    - Add `min_occupancy` column to transportations table (integer, default 1)
    - Add `max_occupancy` column to transportations table (integer, default 1)
    
  2. Purpose
    - Track passenger capacity range for each vehicle type
    - Examples:
      - Avanza: 1-6 pax
      - Hiace: 6-12 pax
      - Bus: 20-39 pax
    
  3. Notes
    - Default values set to 1 for existing records
    - Both fields are required (NOT NULL)
    - Validation ensures max_occupancy >= min_occupancy
*/

-- Add occupancy range columns to transportations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportations' AND column_name = 'min_occupancy'
  ) THEN
    ALTER TABLE public.transportations ADD COLUMN min_occupancy integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportations' AND column_name = 'max_occupancy'
  ) THEN
    ALTER TABLE public.transportations ADD COLUMN max_occupancy integer NOT NULL DEFAULT 1;
  END IF;
END $$;

-- Add check constraint to ensure max_occupancy is greater than or equal to min_occupancy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_occupancy_range'
  ) THEN
    ALTER TABLE public.transportations
    ADD CONSTRAINT check_occupancy_range
    CHECK (max_occupancy >= min_occupancy);
  END IF;
END $$;

-- Add check constraint to ensure positive occupancy values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_min_occupancy_positive'
  ) THEN
    ALTER TABLE public.transportations
    ADD CONSTRAINT check_min_occupancy_positive
    CHECK (min_occupancy > 0);
  END IF;
END $$;