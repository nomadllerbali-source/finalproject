/*
  # Add suspension functionality to sales persons

  1. Changes
    - Add is_active column to sales_persons table (default true)
    - New sales persons are active by default
    - Add index for performance when filtering active sales persons

  2. Security
    - Maintains existing RLS policies
*/

-- Add is_active column to sales_persons
ALTER TABLE sales_persons 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;

-- Add index for filtering active sales persons
CREATE INDEX IF NOT EXISTS idx_sales_persons_is_active 
ON sales_persons(is_active);

-- Update trigger to set is_active=true for new sales persons
CREATE OR REPLACE FUNCTION auto_create_sales_person()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create sales_persons entry if role is 'sales'
  IF NEW.role = 'sales' THEN
    INSERT INTO public.sales_persons (
      id,
      name,
      email,
      phone,
      created_by,
      is_active
    ) VALUES (
      NEW.id,
      NEW.full_name,
      NEW.email,
      NULL,
      NEW.id,
      true
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
