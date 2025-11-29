/*
  # Add Area Fields to Data Tables

  ## Changes Made
  
  1. **Transportations Table**
     - Added `area_id` (uuid, nullable) - Foreign key to areas table
     - Added `area_name` (text, nullable) - Denormalized area name for quick access
  
  2. **Sightseeings Table**
     - Added `area_id` (uuid, nullable) - Foreign key to areas table
     - Added `area_name` (text, nullable) - Denormalized area name for quick access
  
  3. **Activities Table**
     - Added `area_id` (uuid, nullable) - Foreign key to areas table
     - Added `area_name` (text, nullable) - Denormalized area name for quick access
  
  4. **Meals Table**
     - Added `area_id` (uuid, nullable) - Foreign key to areas table
     - Added `area_name` (text, nullable) - Denormalized area name for quick access

  5. **Day Plans Table**
     - Added `area_id` (uuid, nullable) - Area selected for the day
     - Added `area_name` (text, nullable) - Denormalized area name

  ## Notes
  - All fields are nullable to support existing data
  - Foreign keys reference the areas table
  - Area names are denormalized for performance
*/

-- Add area fields to transportations table
ALTER TABLE transportations 
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area_name text;

-- Add area fields to sightseeings table
ALTER TABLE sightseeings 
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area_name text;

-- Add area fields to activities table
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area_name text;

-- Add area fields to meals table
ALTER TABLE meals 
  ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS area_name text;

-- Add area fields to day_plans table
ALTER TABLE day_plans 
  ADD COLUMN IF NOT EXISTS area_id uuid,
  ADD COLUMN IF NOT EXISTS area_name text;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transportations_area_id ON transportations(area_id);
CREATE INDEX IF NOT EXISTS idx_sightseeings_area_id ON sightseeings(area_id);
CREATE INDEX IF NOT EXISTS idx_activities_area_id ON activities(area_id);
CREATE INDEX IF NOT EXISTS idx_meals_area_id ON meals(area_id);
CREATE INDEX IF NOT EXISTS idx_day_plans_area_id ON day_plans(area_id);
