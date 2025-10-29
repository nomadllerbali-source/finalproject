/*
  # Fix Profile Auto-Creation Trigger to Support All Roles

  1. Changes
    - Update handle_new_user() function to read role from user metadata
    - Defaults to 'agent' if no role is specified
    - Supports admin, agent, and sales roles

  2. Notes
    - When creating users via auth.signUp with role in metadata, the trigger will use that role
    - This fixes the issue where sales persons were getting 'agent' role
*/

-- Drop and recreate the function with role support from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_name = EXCLUDED.company_name,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;