/*
  # Auto-create sales_persons entry when sales profile is created

  1. Changes
    - Create trigger function to automatically insert into sales_persons when a sales profile is created
    - Create trigger on profiles table for INSERT operations
    - Migrate existing sales profiles to sales_persons table

  2. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
    - Only creates entries for profiles with role='sales'

  3. Notes
    - Automatically syncs profiles to sales_persons table
    - Backfills existing sales profiles
*/

-- Create function to auto-create sales_persons entry
CREATE OR REPLACE FUNCTION auto_create_sales_person()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create sales_persons entry if role is 'sales'
  IF NEW.role = 'sales' THEN
    INSERT INTO public.sales_persons (
      id,
      email,
      full_name,
      password_hash,
      company_name,
      is_active,
      created_by
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.full_name,
      'auth-based',
      NEW.company_name,
      true,
      NEW.id
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_sales_profile_created ON public.profiles;
CREATE TRIGGER on_sales_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_sales_person();

-- Backfill existing sales profiles into sales_persons table
INSERT INTO public.sales_persons (
  id,
  email,
  full_name,
  password_hash,
  company_name,
  is_active,
  created_by
)
SELECT 
  id,
  email,
  full_name,
  'auth-based',
  company_name,
  true,
  id
FROM public.profiles
WHERE role = 'sales'
ON CONFLICT (id) DO NOTHING;