/*
  # Add Auto-Create Profile Trigger
  
  This migration adds a trigger that automatically creates a profile entry
  when a new user signs up through Supabase Auth.
  
  1. Creates a function to handle new user creation
  2. Adds a trigger on auth.users insert
  3. Automatically creates profiles for existing users
*/

-- Create function to auto-create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'agent',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users that don't have profiles yet
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'agent',
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Update specific users to admin/agent roles based on email
UPDATE public.profiles
SET role = 'admin',
    full_name = 'System Administrator',
    company_name = 'Nomadller Solutions',
    updated_at = NOW()
WHERE email = 'admin@nomadller.com';

UPDATE public.profiles
SET role = 'agent',
    full_name = 'Demo Agent',
    company_name = 'Demo Travel Agency',
    updated_at = NOW()
WHERE email = 'agent@nomadller.com';
