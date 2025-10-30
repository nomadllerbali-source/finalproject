/*
  # Recreate Operations Assignment System
  
  Drop and recreate the operations workflow system with correct schema
*/

-- Drop existing tables in correct order (child tables first)
DROP TABLE IF EXISTS operations_chat CASCADE;
DROP TABLE IF EXISTS package_assignments CASCADE;

-- Create package_assignments table with correct schema
CREATE TABLE package_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_client_id uuid NOT NULL REFERENCES sales_clients(id) ON DELETE CASCADE,
  sales_person_id uuid NOT NULL REFERENCES sales_persons(id) ON DELETE CASCADE,
  operations_person_id uuid NOT NULL REFERENCES operations_persons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE package_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for package_assignments
CREATE POLICY "Sales persons can view own assignments"
  ON package_assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sales_person_id OR
    auth.uid() = operations_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can insert assignments"
  ON package_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own assignments"
  ON package_assignments FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = sales_person_id OR
    auth.uid() = operations_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = sales_person_id OR
    auth.uid() = operations_person_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create operations_chat table
CREATE TABLE operations_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES package_assignments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  sender_type text NOT NULL CHECK (sender_type IN ('sales', 'operations', 'admin')),
  sender_name text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operations_chat ENABLE ROW LEVEL SECURITY;

-- RLS policies for operations_chat
CREATE POLICY "Users can view assignment chat"
  ON operations_chat FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Users can insert chat messages"
  ON operations_chat FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update own messages"
  ON operations_chat FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM package_assignments
      WHERE package_assignments.id = assignment_id
      AND (
        package_assignments.sales_person_id = auth.uid() OR
        package_assignments.operations_person_id = auth.uid()
      )
    )
  );

-- Add new columns to booking_checklist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'assignment_id'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN assignment_id uuid REFERENCES package_assignments(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN is_completed boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN completed_at timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'completed_by'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN completed_by uuid REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'booking_reference'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN booking_reference text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_checklist' AND column_name = 'notes'
  ) THEN
    ALTER TABLE booking_checklist ADD COLUMN notes text;
  END IF;
END $$;

-- Migrate existing data if needed
UPDATE booking_checklist SET is_completed = COALESCE(is_booked, false) WHERE is_completed IS NULL;
UPDATE booking_checklist SET completed_at = booked_at WHERE completed_at IS NULL AND booked_at IS NOT NULL;
UPDATE booking_checklist SET completed_by = booked_by WHERE completed_by IS NULL AND booked_by IS NOT NULL;
UPDATE booking_checklist SET notes = booking_notes WHERE notes IS NULL AND booking_notes IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_package_assignments_sales_person ON package_assignments(sales_person_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_operations_person ON package_assignments(operations_person_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_client ON package_assignments(sales_client_id);
CREATE INDEX IF NOT EXISTS idx_package_assignments_status ON package_assignments(status);
CREATE INDEX IF NOT EXISTS idx_operations_chat_assignment ON operations_chat(assignment_id);
CREATE INDEX IF NOT EXISTS idx_operations_chat_created ON operations_chat(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_checklist_assignment ON booking_checklist(assignment_id);

-- Function to get random available operations person (load balanced)
CREATE OR REPLACE FUNCTION get_random_available_operations_person()
RETURNS uuid AS $$
DECLARE
  selected_person_id uuid;
BEGIN
  SELECT op.id INTO selected_person_id
  FROM operations_persons op
  WHERE op.is_active = true
  ORDER BY (
    SELECT COUNT(*)
    FROM package_assignments pa
    WHERE pa.operations_person_id = op.id
    AND pa.status != 'completed'
  ) ASC, RANDOM()
  LIMIT 1;
  
  RETURN selected_person_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate booking checklist from itinerary data
CREATE OR REPLACE FUNCTION generate_booking_checklist(
  p_assignment_id uuid,
  p_itinerary_data jsonb
)
RETURNS void AS $$
DECLARE
  day_plan jsonb;
  day_number int := 0;
  activity jsonb;
  sightseeing_id text;
  entry_ticket_id text;
  meal_id text;
BEGIN
  IF p_itinerary_data IS NOT NULL AND p_itinerary_data->'dayPlans' IS NOT NULL THEN
    FOR day_plan IN SELECT * FROM jsonb_array_elements(p_itinerary_data->'dayPlans')
    LOOP
      day_number := day_number + 1;
      
      IF day_plan->'hotel' IS NOT NULL THEN
        INSERT INTO booking_checklist (assignment_id, item_type, item_id, item_name, day_number, is_completed)
        VALUES (p_assignment_id, 'hotel', COALESCE(day_plan->'hotel'->>'hotelId', 'unknown'), 'Hotel - Day ' || day_number, day_number, false);
      END IF;
      
      IF day_plan->'sightseeing' IS NOT NULL AND jsonb_array_length(day_plan->'sightseeing') > 0 THEN
        FOR sightseeing_id IN SELECT jsonb_array_elements_text(day_plan->'sightseeing')
        LOOP
          INSERT INTO booking_checklist (assignment_id, item_type, item_id, item_name, day_number, is_completed)
          VALUES (p_assignment_id, 'sightseeing', sightseeing_id, 'Sightseeing - Day ' || day_number, day_number, false);
        END LOOP;
      END IF;
      
      IF day_plan->'activities' IS NOT NULL AND jsonb_array_length(day_plan->'activities') > 0 THEN
        FOR activity IN SELECT * FROM jsonb_array_elements(day_plan->'activities')
        LOOP
          INSERT INTO booking_checklist (assignment_id, item_type, item_id, item_name, day_number, is_completed)
          VALUES (p_assignment_id, 'activity', COALESCE(activity->>'activityId', 'unknown'), 'Activity - Day ' || day_number, day_number, false);
        END LOOP;
      END IF;
      
      IF day_plan->'entryTickets' IS NOT NULL AND jsonb_array_length(day_plan->'entryTickets') > 0 THEN
        FOR entry_ticket_id IN SELECT jsonb_array_elements_text(day_plan->'entryTickets')
        LOOP
          INSERT INTO booking_checklist (assignment_id, item_type, item_id, item_name, day_number, is_completed)
          VALUES (p_assignment_id, 'entry_ticket', entry_ticket_id, 'Entry Ticket - Day ' || day_number, day_number, false);
        END LOOP;
      END IF;
      
      IF day_plan->'meals' IS NOT NULL AND jsonb_array_length(day_plan->'meals') > 0 THEN
        FOR meal_id IN SELECT jsonb_array_elements_text(day_plan->'meals')
        LOOP
          INSERT INTO booking_checklist (assignment_id, item_type, item_id, item_name, day_number, is_completed)
          VALUES (p_assignment_id, 'meal', meal_id, 'Meal - Day ' || day_number, day_number, false);
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate assignment progress
CREATE OR REPLACE FUNCTION calculate_assignment_progress(p_assignment_id uuid)
RETURNS integer AS $$
DECLARE
  total_items integer;
  completed_items integer;
BEGIN
  SELECT COUNT(*) INTO total_items FROM booking_checklist WHERE assignment_id = p_assignment_id;
  IF total_items = 0 THEN RETURN 0; END IF;
  
  SELECT COUNT(*) INTO completed_items FROM booking_checklist WHERE assignment_id = p_assignment_id AND is_completed = true;
  RETURN ROUND((completed_items::numeric / total_items::numeric) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign client to operations
CREATE OR REPLACE FUNCTION auto_assign_to_operations()
RETURNS TRIGGER AS $$
DECLARE
  selected_ops_person_id uuid;
  new_assignment_id uuid;
BEGIN
  IF NEW.current_follow_up_status = 'advance-paid-confirmed' 
     AND (OLD.current_follow_up_status IS NULL OR OLD.current_follow_up_status != 'advance-paid-confirmed') THEN
    
    IF EXISTS (SELECT 1 FROM package_assignments WHERE sales_client_id = NEW.id) THEN
      RETURN NEW;
    END IF;
    
    selected_ops_person_id := get_random_available_operations_person();
    
    IF selected_ops_person_id IS NOT NULL THEN
      INSERT INTO package_assignments (sales_client_id, sales_person_id, operations_person_id, status, completion_percentage)
      VALUES (NEW.id, NEW.sales_person_id, selected_ops_person_id, 'pending', 0)
      RETURNING id INTO new_assignment_id;
      
      IF NEW.itinerary_data IS NOT NULL THEN
        PERFORM generate_booking_checklist(new_assignment_id, NEW.itinerary_data);
      END IF;
      
      NEW.assigned_operation_person_id := selected_ops_person_id;
      NEW.booking_completion_percentage := 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_to_operations ON sales_clients;
CREATE TRIGGER trigger_auto_assign_to_operations
  BEFORE UPDATE ON sales_clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_to_operations();

-- Function to update assignment status
CREATE OR REPLACE FUNCTION update_assignment_status()
RETURNS TRIGGER AS $$
DECLARE
  assignment_record RECORD;
  progress integer;
BEGIN
  SELECT * INTO assignment_record FROM package_assignments WHERE id = COALESCE(NEW.assignment_id, OLD.assignment_id);
  IF assignment_record IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  
  progress := calculate_assignment_progress(assignment_record.id);
  
  UPDATE package_assignments
  SET completion_percentage = progress,
      status = CASE WHEN progress = 0 THEN 'pending' WHEN progress = 100 THEN 'completed' ELSE 'in_progress' END,
      completed_at = CASE WHEN progress = 100 THEN now() ELSE NULL END
  WHERE id = assignment_record.id;
  
  UPDATE sales_clients SET booking_completion_percentage = progress WHERE id = assignment_record.sales_client_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update assignment status
DROP TRIGGER IF EXISTS trigger_update_assignment_status ON booking_checklist;
CREATE TRIGGER trigger_update_assignment_status
  AFTER INSERT OR UPDATE OR DELETE ON booking_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_assignment_status();

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_package_assignments_updated_at ON package_assignments;
CREATE TRIGGER update_package_assignments_updated_at
  BEFORE UPDATE ON package_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
