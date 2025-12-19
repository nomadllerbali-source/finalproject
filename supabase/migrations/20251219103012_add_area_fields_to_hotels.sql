/*
  # Add Area Fields to Hotels Table

  1. Changes
    - Add `area_id` (uuid, foreign key to areas table)
    - Add `area_name` (text) for denormalized area name

  2. Notes
    - Area fields are optional to maintain backward compatibility
    - Foreign key constraint added to ensure data integrity
*/

-- Add area fields to hotels table
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS area_id uuid REFERENCES public.areas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS area_name text;

-- Add index for area_id to improve query performance
CREATE INDEX IF NOT EXISTS idx_hotels_area_id ON public.hotels(area_id);
