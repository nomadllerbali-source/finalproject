/*
  # Rebuild Sales Portal Schema V2
  
  This migration rebuilds the sales portal with proper structure for:
  - Sales persons with authentication
  - Client management by sales persons
  - Follow-up tracking with detailed status workflow
  - Real-time chat between sales and operations
  - Assignment of confirmed clients to operations

  ## Changes
  
  1. Drop old sales tables if they exist
  2. Create new sales_persons table
  3. Create sales_clients table for client tracking
  4. Create follow_up_history table for tracking all follow-ups
  5. Create sales_operations_chat table for real-time messaging
  6. Create booking_checklist table
  7. Set up RLS policies for all tables
  8. Create indexes for performance

  ## Security
  
  - Enable RLS on all tables
  - Sales persons can only see their own clients
  - Operations can see assigned clients
  - Admins can see everything
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS booking_checklist CASCADE;
DROP TABLE IF EXISTS sales_operations_chat CASCADE;
DROP TABLE IF EXISTS follow_up_history CASCADE;
DROP TABLE IF EXISTS sales_clients CASCADE;
DROP TABLE IF EXISTS sales_persons CASCADE;

-- Create sales_persons table
CREATE TABLE IF NOT EXISTS sales_persons (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_persons ENABLE ROW LEVEL SECURITY;

-- Sales persons can view their own data
CREATE POLICY "Sales persons can view own data"
  ON sales_persons FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR created_by = auth.uid());

-- Only admins can insert sales persons
CREATE POLICY "Admins can insert sales persons"
  ON sales_persons FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins and sales persons can update their own data
CREATE POLICY "Users can update own sales person data"
  ON sales_persons FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR created_by = auth.uid())
  WITH CHECK (auth.uid() = id OR created_by = auth.uid());

-- Create sales_clients table
CREATE TABLE IF NOT EXISTS sales_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_person_id uuid NOT NULL REFERENCES sales_persons(id) ON DELETE CASCADE,
  name text NOT NULL,
  country_code text NOT NULL DEFAULT '+91',
  whatsapp text NOT NULL,
  email text,
  travel_date date NOT NULL,
  number_of_days integer NOT NULL,
  number_of_adults integer NOT NULL DEFAULT 2,
  number_of_children integer NOT NULL DEFAULT 0,
  transportation_mode text NOT NULL,
  itinerary_data jsonb,
  total_cost numeric(10, 2) DEFAULT 0,
  current_follow_up_status text NOT NULL DEFAULT 'itinerary-created',
  next_follow_up_date date,
  next_follow_up_time time,
  assigned_operation_person_id uuid REFERENCES operations_persons(id),
  booking_completion_percentage integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sales_clients ENABLE ROW LEVEL SECURITY;

-- Sales persons can view their own clients
CREATE POLICY "Sales persons can view own clients"
  ON sales_clients FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sales_person_id OR
    auth.uid() = assigned_operation_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  );

-- Sales persons can insert their own clients
CREATE POLICY "Sales persons can insert own clients"
  ON sales_clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sales_person_id);

-- Sales persons can update their own clients
CREATE POLICY "Sales persons can update own clients"
  ON sales_clients FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sales_person_id OR
    auth.uid() = assigned_operation_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  )
  WITH CHECK (
    auth.uid() = sales_person_id OR
    auth.uid() = assigned_operation_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'operations')
    )
  );

-- Sales persons can delete their own clients
CREATE POLICY "Sales persons can delete own clients"
  ON sales_clients FOR DELETE
  TO authenticated
  USING (auth.uid() = sales_person_id);

-- Create follow_up_history table
CREATE TABLE IF NOT EXISTS follow_up_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES sales_clients(id) ON DELETE CASCADE,
  sales_person_id uuid NOT NULL REFERENCES sales_persons(id) ON DELETE CASCADE,
  status text NOT NULL,
  remarks text NOT NULL,
  next_follow_up_date date,
  next_follow_up_time time,
  created_at timestamptz DEFAULT now(),
  created_by uuid NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE follow_up_history ENABLE ROW LEVEL SECURITY;

-- Users can view follow-up history for their clients
CREATE POLICY "Users can view follow up history"
  ON follow_up_history FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sales_person_id OR
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND sales_clients.assigned_operation_person_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Sales persons can insert follow-up history for their clients
CREATE POLICY "Sales persons can insert follow up history"
  ON follow_up_history FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sales_person_id AND
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND sales_clients.sales_person_id = auth.uid()
    )
  );

-- Create sales_operations_chat table for real-time messaging
CREATE TABLE IF NOT EXISTS sales_operations_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES sales_clients(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_role text NOT NULL CHECK (sender_role IN ('sales', 'operations')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales_operations_chat ENABLE ROW LEVEL SECURITY;

-- Users can view chat messages for their assigned clients
CREATE POLICY "Users can view chat messages"
  ON sales_operations_chat FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND (sales_clients.sales_person_id = auth.uid() OR sales_clients.assigned_operation_person_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can insert chat messages for their assigned clients
CREATE POLICY "Users can insert chat messages"
  ON sales_operations_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND (sales_clients.sales_person_id = auth.uid() OR sales_clients.assigned_operation_person_id = auth.uid())
    )
  );

-- Create booking_checklist table for operations
CREATE TABLE IF NOT EXISTS booking_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES sales_clients(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('sightseeing', 'hotel', 'activity', 'entry_ticket', 'meal', 'transportation')),
  item_id text NOT NULL,
  item_name text NOT NULL,
  day_number integer,
  is_booked boolean DEFAULT false,
  booked_at timestamptz,
  booked_by uuid REFERENCES auth.users(id),
  booking_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_checklist ENABLE ROW LEVEL SECURITY;

-- Operations and sales can view booking checklist
CREATE POLICY "Users can view booking checklist"
  ON booking_checklist FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_clients
      WHERE sales_clients.id = client_id
      AND (sales_clients.sales_person_id = auth.uid() OR sales_clients.assigned_operation_person_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Operations can insert booking checklist items
CREATE POLICY "Operations can insert booking checklist"
  ON booking_checklist FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('operations', 'admin')
    )
  );

-- Operations can update booking checklist items
CREATE POLICY "Operations can update booking checklist"
  ON booking_checklist FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('operations', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('operations', 'admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_clients_sales_person ON sales_clients(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_clients_status ON sales_clients(current_follow_up_status);
CREATE INDEX IF NOT EXISTS idx_sales_clients_follow_up_date ON sales_clients(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_sales_clients_operation_person ON sales_clients(assigned_operation_person_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_history_client ON follow_up_history(client_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_history_sales_person ON follow_up_history(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_chat_client ON sales_operations_chat(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON sales_operations_chat(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_checklist_client ON booking_checklist(client_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_sales_persons_updated_at ON sales_persons;
CREATE TRIGGER update_sales_persons_updated_at
  BEFORE UPDATE ON sales_persons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_clients_updated_at ON sales_clients;
CREATE TRIGGER update_sales_clients_updated_at
  BEFORE UPDATE ON sales_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();