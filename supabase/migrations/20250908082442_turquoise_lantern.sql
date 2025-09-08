/*
  # Update existing admin user profile

  1. Updates
    - Updates the existing admin user's profile with correct role and details
    - Ensures the profile exists in the profiles table
    - Sets proper admin permissions

  2. Security
    - Maintains existing RLS policies
    - Ensures admin has proper access rights
*/

-- First, let's get the user ID for admin@nomadller.com
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@nomadller.com';
    
    -- If user exists, update or insert profile
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update the profile
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
            now(),
            now()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            company_name = EXCLUDED.company_name,
            updated_at = now();
            
        RAISE NOTICE 'Admin profile updated successfully for user ID: %', admin_user_id;
    ELSE
        RAISE EXCEPTION 'Admin user not found in auth.users table';
    END IF;
END $$;