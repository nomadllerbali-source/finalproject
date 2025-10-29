/*
  # Complete Travel Agency Management System - Database Schema
  
  ## Overview
  This migration creates a complete database schema for a travel agency management system
  with multi-role authentication, itinerary building, and comprehensive travel inventory management.
  
  ## Tables Created
  
  ### 1. User Management
  - **profiles**: User profiles with role-based access (admin, agent, sales)
    - id (uuid, primary key, references auth.users)
    - email (text, unique, not null)
    - full_name (text)
    - role (text, default 'agent')
    - company_name (text)
    - company_logo (text)
    - phone_number (text)
    - address (text)
    - created_at, updated_at (timestamptz)
  
  - **agent_registrations**: Agent registration requests
    - id (uuid, primary key)
    - company_name, company_logo, address (text)
    - email (text, unique)
    - phone_no (text)
    - username (text, unique)
    - status (text, default 'pending')
    - approved_by (uuid, references profiles)
    - approved_at (timestamptz)
    - created_at, updated_at (timestamptz)
  
  ### 2. Travel Inventory
  - **transportations**: Vehicle types and daily costs
    - id, type, vehicle_name, cost_per_day
  
  - **hotels**: Hotel information
    - id, name, place, star_category
  
  - **room_types**: Hotel room types with seasonal pricing
    - id, hotel_id (fk), name
    - peak_season_price, season_price, off_season_price
  
  - **sightseeings**: Sightseeing locations with vehicle costs
    - id, name, description, transportation_mode
    - vehicle_costs (jsonb)
  
  - **activities**: Activity types
    - id, name, location
  
  - **activity_options**: Activity pricing options
    - id, activity_id (fk), name, cost, cost_for_how_many
  
  - **entry_tickets**: Entry ticket pricing
    - id, name, cost, sightseeing_id (fk)
  
  - **meals**: Meal options and pricing
    - id, type (breakfast/lunch/dinner), place, cost
  
  ### 3. Client & Itinerary Management
  - **clients**: Client information and travel details
    - id, name, whatsapp, country_code
    - travel_dates (start, end, is_flexible, flexible_month)
    - number_of_pax (adults, children)
    - number_of_days, transportation_mode
    - follow_up_status (status, updated_at, remarks)
    - next_follow_up_date, next_follow_up_time
    - created_by (uuid, references profiles)
  
  - **itineraries**: Complete travel itineraries
    - id, client_id (fk)
    - total_base_cost, profit_margin, final_price
    - exchange_rate, version
    - last_updated, updated_by (uuid, fk)
  
  - **day_plans**: Day-by-day itinerary plans
    - id, itinerary_id (fk), day
    - sightseeing_ids (text[])
    - hotel_place, hotel_id, room_type_id
    - activities_data (jsonb)
    - entry_ticket_ids (text[])
    - meal_ids (text[])
  
  - **itinerary_changes**: Change tracking for itineraries
    - id, itinerary_id (fk), version
    - change_type, description
    - timestamp, updated_by (uuid, fk)
    - previous_data, new_data (jsonb)
  
  - **fixed_itineraries**: Pre-defined itinerary templates
    - id, name, number_of_days, transportation_mode
    - base_cost, inclusions, exclusions
    - day_plans_data (jsonb)
    - created_by (uuid, fk)
  
  - **follow_up_records**: Client follow-up tracking
    - id, client_id (fk), status, remarks
    - next_follow_up_date, next_follow_up_time
    - updated_by (uuid, fk)
  
  ## Security Features
  - Row Level Security (RLS) enabled on ALL tables
  - Role-based access control (admin, agent, sales)
  - Admins have full access to all data
  - Agents and Sales can only see their own client data
  - Inventory is readable by all authenticated users
  - Only admins can modify inventory
  
  ## Functions & Triggers
  - Auto-create profile on user signup
  - Auto-update timestamps on record changes
  - Proper foreign key relationships with cascading deletes
*/

-- ============================================================================
-- 1. USER MANAGEMENT TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'agent'::text NOT NULL,
  company_name text,
  company_logo text,
  phone_number text,
  address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create agent_registrations table
CREATE TABLE IF NOT EXISTS public.agent_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_logo text,
  address text NOT NULL,
  email text UNIQUE NOT NULL,
  phone_no text NOT NULL,
  username text UNIQUE NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz
);

ALTER TABLE public.agent_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register as agent"
  ON public.agent_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all agent registrations"
  ON public.agent_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update agent registrations"
  ON public.agent_registrations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete agent registrations"
  ON public.agent_registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 2. TRAVEL INVENTORY TABLES
-- ============================================================================

-- Transportations table
CREATE TABLE IF NOT EXISTS public.transportations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  vehicle_name text NOT NULL,
  cost_per_day numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.transportations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read transportations"
  ON public.transportations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert transportations"
  ON public.transportations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update transportations"
  ON public.transportations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete transportations"
  ON public.transportations FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  place text NOT NULL,
  star_category text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read hotels"
  ON public.hotels FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert hotels"
  ON public.hotels FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update hotels"
  ON public.hotels FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete hotels"
  ON public.hotels FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Room types table
CREATE TABLE IF NOT EXISTS public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  peak_season_price numeric NOT NULL DEFAULT 0,
  season_price numeric NOT NULL DEFAULT 0,
  off_season_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read room types"
  ON public.room_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert room types"
  ON public.room_types FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update room types"
  ON public.room_types FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete room types"
  ON public.room_types FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Sightseeings table
CREATE TABLE IF NOT EXISTS public.sightseeings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  transportation_mode text NOT NULL,
  vehicle_costs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.sightseeings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read sightseeings"
  ON public.sightseeings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert sightseeings"
  ON public.sightseeings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update sightseeings"
  ON public.sightseeings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete sightseeings"
  ON public.sightseeings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read activities"
  ON public.activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert activities"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update activities"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete activities"
  ON public.activities FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Activity options table
CREATE TABLE IF NOT EXISTS public.activity_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  cost_for_how_many integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.activity_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read activity options"
  ON public.activity_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert activity options"
  ON public.activity_options FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update activity options"
  ON public.activity_options FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete activity options"
  ON public.activity_options FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Entry tickets table
CREATE TABLE IF NOT EXISTS public.entry_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  sightseeing_id uuid REFERENCES public.sightseeings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.entry_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read entry tickets"
  ON public.entry_tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert entry tickets"
  ON public.entry_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update entry tickets"
  ON public.entry_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete entry tickets"
  ON public.entry_tickets FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner')),
  place text NOT NULL,
  cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read meals"
  ON public.meals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert meals"
  ON public.meals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update meals"
  ON public.meals FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete meals"
  ON public.meals FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 3. CLIENT & ITINERARY MANAGEMENT TABLES
-- ============================================================================

-- Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  country_code text NOT NULL,
  travel_dates_start_date date,
  travel_dates_end_date date,
  travel_dates_is_flexible boolean DEFAULT false NOT NULL,
  travel_dates_flexible_month text,
  number_of_pax_adults integer NOT NULL DEFAULT 0,
  number_of_pax_children integer NOT NULL DEFAULT 0,
  number_of_days integer NOT NULL DEFAULT 0,
  transportation_mode text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  follow_up_status_status text,
  follow_up_status_updated_at timestamptz,
  follow_up_status_remarks text,
  next_follow_up_date date,
  next_follow_up_time text
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own clients"
  ON public.clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clients"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update any client"
  ON public.clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete any client"
  ON public.clients FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Itineraries table
CREATE TABLE IF NOT EXISTS public.itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  total_base_cost numeric NOT NULL DEFAULT 0,
  profit_margin numeric NOT NULL DEFAULT 0,
  final_price numeric NOT NULL DEFAULT 0,
  exchange_rate numeric NOT NULL DEFAULT 83,
  version integer NOT NULL DEFAULT 1,
  last_updated timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all itineraries"
  ON public.itineraries FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own clients itineraries"
  ON public.itineraries FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can insert itineraries for their clients"
  ON public.itineraries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can update their own clients itineraries"
  ON public.itineraries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Admins can manage all itineraries"
  ON public.itineraries FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Day plans table
CREATE TABLE IF NOT EXISTS public.day_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  sightseeing_ids text[] DEFAULT ARRAY[]::text[],
  hotel_place text,
  hotel_id text,
  room_type_id text,
  activities_data jsonb DEFAULT '[]'::jsonb,
  entry_ticket_ids text[] DEFAULT ARRAY[]::text[],
  meal_ids text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.day_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all day plans"
  ON public.day_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own clients day plans"
  ON public.day_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert day plans for their clients itineraries"
  ON public.day_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their own clients day plans"
  ON public.day_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own clients day plans"
  ON public.day_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all day plans"
  ON public.day_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Itinerary changes table
CREATE TABLE IF NOT EXISTS public.itinerary_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  version integer NOT NULL,
  change_type text NOT NULL,
  description text NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES public.profiles(id) NOT NULL,
  previous_data jsonb,
  new_data jsonb
);

ALTER TABLE public.itinerary_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all itinerary changes"
  ON public.itinerary_changes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own clients itinerary changes"
  ON public.itinerary_changes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert itinerary changes for their clients"
  ON public.itinerary_changes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all itinerary changes"
  ON public.itinerary_changes FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Fixed itineraries table
CREATE TABLE IF NOT EXISTS public.fixed_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number_of_days integer NOT NULL DEFAULT 0,
  transportation_mode text NOT NULL,
  base_cost numeric NOT NULL DEFAULT 0,
  inclusions text NOT NULL DEFAULT '',
  exclusions text NOT NULL DEFAULT '',
  day_plans_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL
);

ALTER TABLE public.fixed_itineraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read fixed itineraries"
  ON public.fixed_itineraries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert fixed itineraries"
  ON public.fixed_itineraries FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update fixed itineraries"
  ON public.fixed_itineraries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete fixed itineraries"
  ON public.fixed_itineraries FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Follow up records table
CREATE TABLE IF NOT EXISTS public.follow_up_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL,
  remarks text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  next_follow_up_date date,
  next_follow_up_time text,
  updated_by uuid REFERENCES public.profiles(id) NOT NULL
);

ALTER TABLE public.follow_up_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all follow up records"
  ON public.follow_up_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can view their own clients follow up records"
  ON public.follow_up_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can insert follow up records for their clients"
  ON public.follow_up_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Users can update their own clients follow up records"
  ON public.follow_up_records FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

CREATE POLICY "Admins can manage all follow up records"
  ON public.follow_up_records FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'agent'),
    COALESCE(new.raw_user_meta_data->>'company_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_registrations_updated_at ON public.agent_registrations;
CREATE TRIGGER update_agent_registrations_updated_at
  BEFORE UPDATE ON public.agent_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fixed_itineraries_updated_at ON public.fixed_itineraries;
CREATE TRIGGER update_fixed_itineraries_updated_at
  BEFORE UPDATE ON public.fixed_itineraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
