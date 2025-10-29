/*
  # Fix Security and Performance Issues

  1. RLS Policy Performance Optimization
    - Update profiles table RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row, improving query performance at scale

  2. Remove Unused Indexes
    - Drop indexes that are not being used to reduce database maintenance overhead
    - Unused indexes can slow down write operations without providing query benefits

  3. Changes Made
    - Optimized RLS policies on profiles table
    - Removed unused indexes on multiple tables
*/

-- ============================================================================
-- 1. OPTIMIZE RLS POLICIES ON PROFILES TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate policies with optimized auth function calls
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================================================

-- Drop unused indexes to improve write performance
DROP INDEX IF EXISTS public.idx_activity_options_activity_id;
DROP INDEX IF EXISTS public.idx_agent_registrations_approved_by;
DROP INDEX IF EXISTS public.idx_clients_created_by;
DROP INDEX IF EXISTS public.idx_day_plans_itinerary_id;
DROP INDEX IF EXISTS public.idx_entry_tickets_sightseeing_id;
DROP INDEX IF EXISTS public.idx_fixed_itineraries_created_by;
DROP INDEX IF EXISTS public.idx_follow_up_records_client_id;
DROP INDEX IF EXISTS public.idx_follow_up_records_updated_by;
DROP INDEX IF EXISTS public.idx_itineraries_client_id;
DROP INDEX IF EXISTS public.idx_itineraries_updated_by;
DROP INDEX IF EXISTS public.idx_itinerary_changes_itinerary_id;
DROP INDEX IF EXISTS public.idx_itinerary_changes_updated_by;
DROP INDEX IF EXISTS public.idx_room_types_hotel_id;
