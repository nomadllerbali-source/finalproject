/*
  # Create Admin User in Supabase Auth

  1. New User Creation
    - Creates admin user in auth.users table
    - Sets up email/password authentication
    - Creates corresponding profile record
    - Sets up proper identity for email auth

  2. Security
    - Admin role assigned in profiles table
    - Proper authentication setup
    - Email confirmation disabled for admin
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
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nomadller.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Admin User", "role": "admin"}',
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
  -- Get the admin user ID
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@nomadller.com';

  -- Create identity record for email authentication
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    admin_user_id,
    format('{"sub": "%s", "email": "%s"}', admin_user_id, 'admin@nomadller.com')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  -- Create profile record
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
    'Admin User',
    'admin',
    'Nomadller Solutions',
    NOW(),
    NOW()
  );
END $$;