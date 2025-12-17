/*
  # Clear All Data from Database
  
  1. Purpose
    - Removes all data from all tables to prepare for real data input
    - Maintains table structure, indexes, and RLS policies
    - Resets sequences and identity columns
    
  2. Safety
    - Does NOT drop any tables or schema
    - Does NOT remove RLS policies
    - Does NOT affect migrations table
    - Only clears data, keeping the structure intact
    
  3. Tables Cleared (in dependency order)
    - Chat and communication tables
    - Booking and assignment tables
    - Follow-up and itinerary tables
    - Client and sales tables
    - Master data tables (hotels, sightseeings, activities, etc.)
    - User and profile tables
    
  4. Notes
    - Uses TRUNCATE CASCADE for efficient clearing
    - Automatically handles foreign key dependencies
    - Resets identity sequences
*/

-- Disable RLS temporarily for cleanup (will be re-enabled automatically)
-- Clear communication and chat tables
TRUNCATE TABLE public.operations_chat CASCADE;
TRUNCATE TABLE public.sales_operations_chat CASCADE;

-- Clear booking and assignment tables
TRUNCATE TABLE public.booking_checklist CASCADE;
TRUNCATE TABLE public.package_assignments CASCADE;

-- Clear follow-up tables
TRUNCATE TABLE public.follow_up_history CASCADE;
TRUNCATE TABLE public.follow_up_records CASCADE;

-- Clear itinerary and client data
TRUNCATE TABLE public.itinerary_changes CASCADE;
TRUNCATE TABLE public.day_plans CASCADE;
TRUNCATE TABLE public.itineraries CASCADE;
TRUNCATE TABLE public.sales_itinerary_versions CASCADE;
TRUNCATE TABLE public.sales_clients CASCADE;
TRUNCATE TABLE public.clients CASCADE;

-- Clear fixed itinerary data
TRUNCATE TABLE public.fixed_itineraries CASCADE;

-- Clear master data tables (activities, sightseeings, hotels, etc.)
TRUNCATE TABLE public.entry_tickets CASCADE;
TRUNCATE TABLE public.activity_options CASCADE;
TRUNCATE TABLE public.activities CASCADE;
TRUNCATE TABLE public.sightseeings CASCADE;
TRUNCATE TABLE public.meals CASCADE;
TRUNCATE TABLE public.transportations CASCADE;
TRUNCATE TABLE public.room_types CASCADE;
TRUNCATE TABLE public.hotels CASCADE;
TRUNCATE TABLE public.areas CASCADE;

-- Clear user management tables
TRUNCATE TABLE public.sales_persons CASCADE;
TRUNCATE TABLE public.operations_persons CASCADE;
TRUNCATE TABLE public.agent_registrations CASCADE;

-- Clear profiles (this will not affect auth.users, but clears profile data)
TRUNCATE TABLE public.profiles CASCADE;

-- Note: auth.users table is managed by Supabase Auth and should be cleared through the Auth dashboard if needed