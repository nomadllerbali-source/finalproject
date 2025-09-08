/*
  # Complete Supabase Schema Setup

  1. New Tables
    - `profiles` - User profiles with roles and company info
    - `agent_registrations` - Agent registration requests
    - `clients` - Client information and travel details
    - `transportations` - Vehicle types and pricing
    - `hotels` - Hotel information
    - `room_types` - Hotel room types with seasonal pricing
    - `sightseeings` - Sightseeing locations with vehicle costs
    - `activities` - Activity types
    - `activity_options` - Activity pricing options
    - `entry_tickets` - Entry ticket pricing
    - `meals` - Meal options and pricing
    - `itineraries` - Complete travel itineraries
    - `day_plans` - Day-by-day itinerary plans
    - `itinerary_changes` - Change tracking for itineraries
    - `fixed_itineraries` - Pre-defined itinerary templates
    - `follow_up_records` - Client follow-up tracking

  2. Security
    - Enable RLS on all tables
    - Role-based access policies (admin, agent, sales)
    - User isolation for agents and sales
    - Admin full access to all data

  3. Functions & Triggers
    - Auto-create profile on user signup
    - Auto-update timestamps
    - Proper foreign key relationships
*/

-- Create the profiles table if it doesn't exist and add custom columns
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'agent'::text,
  company_name text,
  company_logo text,
  phone_number text,
  address text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile." ON public.profiles;
CREATE POLICY "Users can read own profile." ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles." ON public.profiles;
CREATE POLICY "Admins can read all profiles." ON public.profiles
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." ON public.profiles
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can insert profiles." ON public.profiles;
CREATE POLICY "Admins can insert profiles." ON public.profiles
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

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

-- Policies for agent_registrations
DROP POLICY IF EXISTS "Admins can view all agent registrations." ON public.agent_registrations;
CREATE POLICY "Admins can view all agent registrations." ON public.agent_registrations
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can manage agent registrations." ON public.agent_registrations;
CREATE POLICY "Admins can manage agent registrations." ON public.agent_registrations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Anyone can register as agent." ON public.agent_registrations;
CREATE POLICY "Anyone can register as agent." ON public.agent_registrations
  FOR INSERT WITH CHECK (true);

-- Create transportations table
CREATE TABLE IF NOT EXISTS public.transportations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  vehicle_name text NOT NULL,
  cost_per_day numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.transportations ENABLE ROW LEVEL SECURITY;

-- Transportations policies
DROP POLICY IF EXISTS "All authenticated users can read transportations" ON public.transportations;
CREATE POLICY "All authenticated users can read transportations" ON public.transportations
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage transportations" ON public.transportations;
CREATE POLICY "Admins can manage transportations" ON public.transportations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  place text NOT NULL,
  star_category text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Hotels policies
DROP POLICY IF EXISTS "All authenticated users can read hotels" ON public.hotels;
CREATE POLICY "All authenticated users can read hotels" ON public.hotels
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage hotels" ON public.hotels;
CREATE POLICY "Admins can manage hotels" ON public.hotels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create room_types table
CREATE TABLE IF NOT EXISTS public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  peak_season_price numeric NOT NULL,
  season_price numeric NOT NULL,
  off_season_price numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

-- Room types policies
DROP POLICY IF EXISTS "All authenticated users can read room types" ON public.room_types;
CREATE POLICY "All authenticated users can read room types" ON public.room_types
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage room types" ON public.room_types;
CREATE POLICY "Admins can manage room types" ON public.room_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create sightseeings table
CREATE TABLE IF NOT EXISTS public.sightseeings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  transportation_mode text NOT NULL,
  vehicle_costs jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.sightseeings ENABLE ROW LEVEL SECURITY;

-- Sightseeings policies
DROP POLICY IF EXISTS "All authenticated users can read sightseeings" ON public.sightseeings;
CREATE POLICY "All authenticated users can read sightseeings" ON public.sightseeings
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage sightseeings" ON public.sightseeings;
CREATE POLICY "Admins can manage sightseeings" ON public.sightseeings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Activities policies
DROP POLICY IF EXISTS "All authenticated users can read activities" ON public.activities;
CREATE POLICY "All authenticated users can read activities" ON public.activities
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage activities" ON public.activities;
CREATE POLICY "Admins can manage activities" ON public.activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create activity_options table
CREATE TABLE IF NOT EXISTS public.activity_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  cost numeric NOT NULL,
  cost_for_how_many integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.activity_options ENABLE ROW LEVEL SECURITY;

-- Activity options policies
DROP POLICY IF EXISTS "All authenticated users can read activity options" ON public.activity_options;
CREATE POLICY "All authenticated users can read activity options" ON public.activity_options
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage activity options" ON public.activity_options;
CREATE POLICY "Admins can manage activity options" ON public.activity_options
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create entry_tickets table
CREATE TABLE IF NOT EXISTS public.entry_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cost numeric NOT NULL,
  sightseeing_id uuid REFERENCES public.sightseeings(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.entry_tickets ENABLE ROW LEVEL SECURITY;

-- Entry tickets policies
DROP POLICY IF EXISTS "All authenticated users can read entry tickets" ON public.entry_tickets;
CREATE POLICY "All authenticated users can read entry tickets" ON public.entry_tickets
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage entry tickets" ON public.entry_tickets;
CREATE POLICY "Admins can manage entry tickets" ON public.entry_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('breakfast', 'lunch', 'dinner')),
  place text NOT NULL,
  cost numeric NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Meals policies
DROP POLICY IF EXISTS "All authenticated users can read meals" ON public.meals;
CREATE POLICY "All authenticated users can read meals" ON public.meals
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage meals" ON public.meals;
CREATE POLICY "Admins can manage meals" ON public.meals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  country_code text NOT NULL,
  travel_dates_start_date date,
  travel_dates_end_date date,
  travel_dates_is_flexible boolean DEFAULT false NOT NULL,
  travel_dates_flexible_month text,
  number_of_pax_adults integer NOT NULL,
  number_of_pax_children integer NOT NULL,
  number_of_days integer NOT NULL,
  transportation_mode text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  follow_up_status_status text,
  follow_up_status_updated_at timestamptz,
  follow_up_status_remarks text,
  next_follow_up_date date,
  next_follow_up_time text
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policies for clients
DROP POLICY IF EXISTS "Admins can view all clients." ON public.clients;
CREATE POLICY "Admins can view all clients." ON public.clients
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can view their own clients." ON public.clients;
CREATE POLICY "Users can view their own clients." ON public.clients
  FOR SELECT USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert clients." ON public.clients;
CREATE POLICY "Users can insert clients." ON public.clients
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their own clients." ON public.clients;
CREATE POLICY "Users can update their own clients." ON public.clients
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins can update any client." ON public.clients;
CREATE POLICY "Admins can update any client." ON public.clients
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete any client." ON public.clients;
CREATE POLICY "Admins can delete any client." ON public.clients
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create itineraries table
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

-- Itineraries policies
DROP POLICY IF EXISTS "Admins can view all itineraries" ON public.itineraries;
CREATE POLICY "Admins can view all itineraries" ON public.itineraries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view their own clients' itineraries" ON public.itineraries;
CREATE POLICY "Users can view their own clients' itineraries" ON public.itineraries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert itineraries for their clients" ON public.itineraries;
CREATE POLICY "Users can insert itineraries for their clients" ON public.itineraries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own clients' itineraries" ON public.itineraries;
CREATE POLICY "Users can update their own clients' itineraries" ON public.itineraries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all itineraries" ON public.itineraries;
CREATE POLICY "Admins can manage all itineraries" ON public.itineraries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create day_plans table
CREATE TABLE IF NOT EXISTS public.day_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id uuid REFERENCES public.itineraries(id) ON DELETE CASCADE NOT NULL,
  day integer NOT NULL,
  sightseeing_ids text[] DEFAULT '{}',
  hotel_place text,
  hotel_id text,
  room_type_id text,
  activities_data jsonb DEFAULT '[]'::jsonb,
  entry_ticket_ids text[] DEFAULT '{}',
  meal_ids text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.day_plans ENABLE ROW LEVEL SECURITY;

-- Day plans policies
DROP POLICY IF EXISTS "Admins can view all day plans" ON public.day_plans;
CREATE POLICY "Admins can view all day plans" ON public.day_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view their own clients' day plans" ON public.day_plans;
CREATE POLICY "Users can view their own clients' day plans" ON public.day_plans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert day plans for their clients' itineraries" ON public.day_plans;
CREATE POLICY "Users can insert day plans for their clients' itineraries" ON public.day_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own clients' day plans" ON public.day_plans;
CREATE POLICY "Users can update their own clients' day plans" ON public.day_plans
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all day plans" ON public.day_plans;
CREATE POLICY "Admins can manage all day plans" ON public.day_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create itinerary_changes table
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

-- Itinerary changes policies
DROP POLICY IF EXISTS "Admins can view all itinerary changes" ON public.itinerary_changes;
CREATE POLICY "Admins can view all itinerary changes" ON public.itinerary_changes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view their own clients' itinerary changes" ON public.itinerary_changes;
CREATE POLICY "Users can view their own clients' itinerary changes" ON public.itinerary_changes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert itinerary changes for their clients" ON public.itinerary_changes;
CREATE POLICY "Users can insert itinerary changes for their clients" ON public.itinerary_changes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.itineraries i 
      JOIN public.clients c ON i.client_id = c.id 
      WHERE i.id = itinerary_id AND c.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all itinerary changes" ON public.itinerary_changes;
CREATE POLICY "Admins can manage all itinerary changes" ON public.itinerary_changes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create fixed_itineraries table
CREATE TABLE IF NOT EXISTS public.fixed_itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  number_of_days integer NOT NULL,
  transportation_mode text NOT NULL,
  base_cost numeric NOT NULL,
  inclusions text NOT NULL,
  exclusions text NOT NULL,
  day_plans_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL
);

ALTER TABLE public.fixed_itineraries ENABLE ROW LEVEL SECURITY;

-- Fixed itineraries policies
DROP POLICY IF EXISTS "All authenticated users can read fixed itineraries" ON public.fixed_itineraries;
CREATE POLICY "All authenticated users can read fixed itineraries" ON public.fixed_itineraries
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage fixed itineraries" ON public.fixed_itineraries;
CREATE POLICY "Admins can manage fixed itineraries" ON public.fixed_itineraries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create follow_up_records table
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

-- Follow-up records policies
DROP POLICY IF EXISTS "Admins can view all follow-up records" ON public.follow_up_records;
CREATE POLICY "Admins can view all follow-up records" ON public.follow_up_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view their own clients' follow-up records" ON public.follow_up_records;
CREATE POLICY "Users can view their own clients' follow-up records" ON public.follow_up_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert follow-up records for their clients" ON public.follow_up_records;
CREATE POLICY "Users can insert follow-up records for their clients" ON public.follow_up_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage all follow-up records" ON public.follow_up_records;
CREATE POLICY "Admins can manage all follow-up records" ON public.follow_up_records
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'agent'),
    new.raw_user_meta_data->>'company_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agent_registrations_updated_at ON public.agent_registrations;
CREATE TRIGGER update_agent_registrations_updated_at BEFORE UPDATE ON public.agent_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fixed_itineraries_updated_at ON public.fixed_itineraries;
CREATE TRIGGER update_fixed_itineraries_updated_at BEFORE UPDATE ON public.fixed_itineraries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();