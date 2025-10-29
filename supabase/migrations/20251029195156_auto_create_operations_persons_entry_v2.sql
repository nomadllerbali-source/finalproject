/*
  # Auto-create operations_persons entry when operations profile is created

  1. Changes
    - Create trigger function to automatically insert into operations_persons when an operations profile is created
    - Create trigger on profiles table for INSERT operations
    - Migrate existing operations profiles to operations_persons table

  2. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
    - Only creates entries for profiles with role='operations'

  3. Notes
    - Automatically syncs profiles to operations_persons table
    - Backfills existing operations profiles
*/

-- Create function to auto-create operations_persons entry
CREATE OR REPLACE FUNCTION auto_create_operations_person()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create operations_persons entry if role is 'operations'
  IF NEW.role = 'operations' THEN
    INSERT INTO public.operations_persons (
      id,
      email,
      full_name,
      password_hash,
      phone_number,
      company_name,
      is_active,
      created_by
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.full_name,
      'auth-based',
      NULL,
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
DROP TRIGGER IF EXISTS on_operations_profile_created ON public.profiles;
CREATE TRIGGER on_operations_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_operations_person();

-- Backfill existing operations profiles into operations_persons table
INSERT INTO public.operations_persons (
  id,
  email,
  full_name,
  password_hash,
  phone_number,
  company_name,
  is_active,
  created_by
)
SELECT 
  id,
  email,
  full_name,
  'auth-based',
  NULL,
  company_name,
  true,
  id
FROM public.profiles
WHERE role = 'operations'
ON CONFLICT (id) DO NOTHING;