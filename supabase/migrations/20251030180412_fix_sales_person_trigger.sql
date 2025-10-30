/*
  # Fix sales_persons trigger

  1. Changes
    - Update auto_create_sales_person() trigger to match actual table schema
    - sales_persons table has: id, name, email, phone, created_by, created_at, updated_at
    - Remove references to non-existent columns (password_hash, full_name, company_name, is_active)

  2. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
*/

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_sales_profile_created ON public.profiles;
DROP FUNCTION IF EXISTS auto_create_sales_person();

-- Create updated function to auto-create sales_persons entry
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
      created_by
    ) VALUES (
      NEW.id,
      NEW.full_name,
      NEW.email,
      NULL,
      NEW.id
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
CREATE TRIGGER on_sales_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_sales_person();

-- Backfill existing sales profiles into sales_persons table
INSERT INTO public.sales_persons (
  id,
  name,
  email,
  phone,
  created_by
)
SELECT 
  id,
  full_name,
  email,
  NULL,
  id
FROM public.profiles
WHERE role = 'sales'
ON CONFLICT (id) DO NOTHING;
