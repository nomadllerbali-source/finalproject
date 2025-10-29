/*
  # Operations Management System

  1. New Tables
    - `operations_persons`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `password_hash` (text)
      - `phone_number` (text)
      - `company_name` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, foreign key to profiles)
    
    - `package_assignments`
      - `id` (uuid, primary key)
      - `itinerary_id` (text)
      - `sales_person_id` (uuid, foreign key to sales_persons)
      - `operations_person_id` (uuid, foreign key to operations_persons)
      - `status` (text) - 'pending', 'in_progress', 'completed'
      - `assigned_at` (timestamptz)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `booking_checklist`
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, foreign key to package_assignments)
      - `item_type` (text) - 'hotel', 'transportation', 'activity', 'entry_ticket', 'meal', 'sightseeing'
      - `item_id` (text)
      - `item_name` (text)
      - `day_number` (integer)
      - `is_completed` (boolean, default false)
      - `booking_reference` (text)
      - `notes` (text)
      - `completed_at` (timestamptz)
      - `completed_by` (uuid)
      - `created_at` (timestamptz)
    
    - `operations_chat`
      - `id` (uuid, primary key)
      - `assignment_id` (uuid, foreign key to package_assignments)
      - `sender_id` (uuid)
      - `sender_type` (text) - 'sales', 'operations'
      - `sender_name` (text)
      - `message` (text)
      - `created_at` (timestamptz)
      - `is_read` (boolean, default false)

  2. Security
    - Enable RLS on all tables
    - Add policies for operations persons
    - Add policies for sales persons
    - Add policies for admin
*/

-- Create operations_persons table (similar structure to sales_persons)
CREATE TABLE IF NOT EXISTS operations_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  phone_number text,
  company_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id)
);

-- Create package_assignments table
CREATE TABLE IF NOT EXISTS package_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id text NOT NULL,
  sales_person_id uuid REFERENCES sales_persons(id) ON DELETE SET NULL,
  operations_person_id uuid REFERENCES operations_persons(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create booking_checklist table
CREATE TABLE IF NOT EXISTS booking_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES package_assignments(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('hotel', 'transportation', 'activity', 'entry_ticket', 'meal', 'sightseeing')),
  item_id text NOT NULL,
  item_name text NOT NULL,
  day_number integer,
  is_completed boolean DEFAULT false,
  booking_reference text,
  notes text,
  completed_at timestamptz,
  completed_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Create operations_chat table
CREATE TABLE IF NOT EXISTS operations_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES package_assignments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('sales', 'operations', 'admin')),
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_operations_persons_email ON operations_persons(email);
CREATE INDEX IF NOT EXISTS idx_operations_persons_active ON operations_persons(is_active);
CREATE INDEX IF NOT EXISTS idx_package_assignments_itinerary ON package_assignments(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_sales ON package_assignments(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_operations ON package_assignments(operations_person_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_status ON package_assignments(status);
CREATE INDEX IF NOT EXISTS idx_booking_checklist_assignment ON booking_checklist(assignment_id);
CREATE INDEX IF NOT EXISTS idx_booking_checklist_completed ON booking_checklist(is_completed);
CREATE INDEX IF NOT EXISTS idx_operations_chat_assignment ON operations_chat(assignment_id);
CREATE INDEX IF NOT EXISTS idx_operations_chat_created ON operations_chat(created_at);

-- Enable Row Level Security
ALTER TABLE operations_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for operations_persons
CREATE POLICY "Admin can manage all operations persons"
  ON operations_persons FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Operations persons can view all operations persons"
  ON operations_persons FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM operations_persons op
      WHERE op.email = auth.jwt()->>'email'
      AND op.is_active = true
    )
  );

-- RLS Policies for package_assignments
CREATE POLICY "Admin can manage all assignments"
  ON package_assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Operations persons can view and update their assignments"
  ON package_assignments FOR ALL
  TO authenticated
  USING (
    operations_person_id IN (
      SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
    )
  );

CREATE POLICY "Sales persons can view their package assignments"
  ON package_assignments FOR SELECT
  TO authenticated
  USING (
    sales_person_id IN (
      SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
    )
  );

-- RLS Policies for booking_checklist
CREATE POLICY "Admin can manage all checklist items"
  ON booking_checklist FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Operations persons can manage their checklist items"
  ON booking_checklist FOR ALL
  TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE operations_person_id IN (
        SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  );

CREATE POLICY "Sales persons can view their package checklist"
  ON booking_checklist FOR SELECT
  TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE sales_person_id IN (
        SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  );

-- RLS Policies for operations_chat
CREATE POLICY "Admin can manage all chat messages"
  ON operations_chat FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Sales and operations can view their chat messages"
  ON operations_chat FOR SELECT
  TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE sales_person_id IN (
        SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
      OR operations_person_id IN (
        SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  );

CREATE POLICY "Sales and operations can send chat messages"
  ON operations_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE sales_person_id IN (
        SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
      OR operations_person_id IN (
        SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  );

CREATE POLICY "Users can update chat read status"
  ON operations_chat FOR UPDATE
  TO authenticated
  USING (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE sales_person_id IN (
        SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
      OR operations_person_id IN (
        SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  )
  WITH CHECK (
    assignment_id IN (
      SELECT id FROM package_assignments
      WHERE sales_person_id IN (
        SELECT id FROM sales_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
      OR operations_person_id IN (
        SELECT id FROM operations_persons WHERE email = auth.jwt()->>'email' AND is_active = true
      )
    )
  );