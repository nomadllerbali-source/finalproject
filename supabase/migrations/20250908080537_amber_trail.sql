-- Fix infinite recursion in profiles table RLS policies
-- This migration removes the problematic policies and creates simpler ones

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;

-- Create simple, non-recursive policies
-- Users can read their own profile using auth.uid() directly
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile using auth.uid() directly
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles - use auth metadata instead of profiles table lookup
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT USING (
    (auth.jwt() ->> 'role') = 'admin' OR 
    auth.uid() = id
  );

-- Admins can update any profile - use auth metadata instead of profiles table lookup
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    (auth.jwt() ->> 'role') = 'admin' OR 
    auth.uid() = id
  );

-- Admins can insert profiles - use auth metadata instead of profiles table lookup
CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Allow authenticated users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);