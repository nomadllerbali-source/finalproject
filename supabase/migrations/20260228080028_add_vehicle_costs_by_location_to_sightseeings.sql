/*
  # Add Vehicle Costs By Location to Sightseeings

  1. Changes
    - Add `vehicle_costs_by_location` JSONB column to `sightseeings` table
    - This stores an array of location-based vehicle costs
    - Each entry contains a location name and vehicle costs for that location
    
  2. Structure
    - Array of objects: [{ location: string, costs: { vehicleName: cost } }]
    - Example: [{ location: "Kuta", costs: { "Sedan": 500000, "SUV": 750000 } }]
    
  3. Notes
    - Column is nullable to maintain backward compatibility
    - This allows different vehicle costs for different pickup locations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sightseeings' AND column_name = 'vehicle_costs_by_location'
  ) THEN
    ALTER TABLE sightseeings ADD COLUMN vehicle_costs_by_location JSONB DEFAULT NULL;
  END IF;
END $$;
