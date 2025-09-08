/*
  # Create Admin User in Supabase Auth

  1. New User Setup
    - Creates admin user with email admin@nomadller.com
    - Sets up proper authentication in auth.users table
    - Creates corresponding profile in profiles table
    - Sets admin role and permissions

  2. Security
    - Proper password hashing using Supabase auth
    - Admin role assignment
    - Profile creation with admin privileges
*/

-- Create the admin user in auth.users table
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
  '3dc9f507-60e5-4640-8259-dc0d2479e267',
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

-- Create the admin profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  company_name,
  created_at,
  updated_at
) VALUES (
  '3dc9f507-60e5-4640-8259-dc0d2479e267',
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

-- Create identity record for the admin user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '3dc9f507-60e5-4640-8259-dc0d2479e267',
  '3dc9f507-60e5-4640-8259-dc0d2479e267',
  '{"sub": "3dc9f507-60e5-4640-8259-dc0d2479e267", "email": "admin@nomadller.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (provider, id) DO NOTHING;