/*
  # Fix Trigger Security Settings
  
  Make the auto-assignment and checklist generation functions run
  with SECURITY DEFINER so they can bypass RLS when needed.
*/

-- Recreate generate_booking_checklist with SECURITY DEFINER
CREATE OR REPLACE FUNCTION generate_booking_checklist(
  p_assignment_id uuid,
  p_itinerary_data jsonb
)
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Recreate auto_assign_to_operations with SECURITY DEFINER
CREATE OR REPLACE FUNCTION auto_assign_to_operations()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
