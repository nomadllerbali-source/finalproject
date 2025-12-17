/*
  # Update Vehicle Cost Structure

  1. Changes
    - Update vehicle_costs JSONB structure in sightseeings table
    - Replace old vehicle types (miniBus, bus32, bus39) with new ones (elfGiga, bus)
    - Update passenger capacity ranges:
      - Avanza: 1-6 pax (was 2-6)
      - Hiace: 6-14 pax (was 6-12)
      - ELF Giga: 14-20 pax (new, replaces Mini Bus)
      - Bus: 20-45 pax (new, replaces Bus 32 and Bus 39)
    
  2. Notes
    - Migrates existing data to new structure
    - Sets default values for new vehicle types based on old data
*/

-- Update existing vehicle_costs JSONB to new structure
UPDATE public.sightseeings 
SET vehicle_costs = jsonb_build_object(
  'avanza', COALESCE((vehicle_costs->>'avanza')::numeric, 0),
  'hiace', COALESCE((vehicle_costs->>'hiace')::numeric, 0),
  'elfGiga', COALESCE((vehicle_costs->>'miniBus')::numeric, 0),
  'bus', COALESCE(
    GREATEST(
      COALESCE((vehicle_costs->>'bus32')::numeric, 0),
      COALESCE((vehicle_costs->>'bus39')::numeric, 0)
    ), 
    0
  )
)
WHERE vehicle_costs IS NOT NULL;