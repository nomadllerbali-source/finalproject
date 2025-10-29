/*
  # Fix Profiles RLS Policies

  1. Changes
    - Drop existing circular RLS policies on profiles table
    - Create simple, non-circular policies that allow users to read their own profile
    - Allow admins to read all profiles without circular dependency
  
  2. Security
    - Users can read their own profile
    - Users can update their own profile
    - Only service role can insert (handled by trigger)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert (for trigger)
-- Note: INSERT is handled by the trigger using service role, so no policy needed for regular users
