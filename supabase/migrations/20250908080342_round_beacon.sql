/*
  # Create Admin User

  1. New User Account
    - Creates admin user with email: admin@nomadller.com
    - Sets up profile with admin role
    - Enables immediate login access

  2. Security
    - User created in auth.users table
    - Profile created in public.profiles table
    - Admin role assigned for full system access
*/

-- Insert admin user into auth.users table
-- Note: In production, you should use Supabase Dashboard or Auth API
-- This is for development/demo purposes only
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nomadller.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System Administrator", "role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Get the user ID we just created
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@nomadller.com';

  -- Insert corresponding profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    company_name,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'admin@nomadller.com',
    'System Administrator',
    'admin',
    'Nomadller Solutions',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_name = EXCLUDED.company_name,
    updated_at = NOW();
END $$;