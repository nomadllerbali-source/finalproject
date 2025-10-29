/*
  # Update Profile Creation Trigger for Operations Role

  1. Changes
    - Update the handle_new_user trigger function to support 'operations' role
    - Ensure operations persons get proper profiles created

  2. Notes
    - This allows operations persons to login through Supabase auth
    - Profile is automatically created with operations role
*/

-- Drop existing function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with operations support
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent'),
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();