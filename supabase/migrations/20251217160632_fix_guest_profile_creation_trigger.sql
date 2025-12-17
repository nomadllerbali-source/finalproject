/*
  # Fix Guest Profile Creation Trigger
  
  1. Changes Made
    - Update the handle_new_user() function to respect the role from user metadata
    - Default to 'guest' role instead of 'agent' for new signups
    - Properly extract phone number from metadata
    
  2. Security
    - Function runs with SECURITY DEFINER to create profiles
    - Maintains existing RLS policies
*/

-- Drop and recreate the function with proper role handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'guest'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
