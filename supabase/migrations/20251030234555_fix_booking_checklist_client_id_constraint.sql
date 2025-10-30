/*
  # Fix Booking Checklist Client ID Constraint
  
  ## Problem
  The auto_assign_to_operations trigger fails when updating a client status to 
  'advance-paid-confirmed' because the generate_booking_checklist function does 
  not populate the required client_id field when inserting checklist items.
  
  ## Changes
  1. Update generate_booking_checklist function to accept client_id parameter
  2. Update all INSERT statements to include client_id
  3. Update auto_assign_to_operations trigger to pass client_id to checklist function
  4. Both functions use SECURITY DEFINER to bypass RLS during execution
  
  ## Tables Modified
  - booking_checklist (via function inserts)
  
  ## Functions Modified
  - generate_booking_checklist(p_assignment_id, p_client_id, p_itinerary_data)
  - auto_assign_to_operations() trigger function
*/

-- Drop and recreate generate_booking_checklist with client_id parameter
DROP FUNCTION IF EXISTS generate_booking_checklist(uuid, jsonb);

CREATE OR REPLACE FUNCTION generate_booking_checklist(
  p_assignment_id uuid,
  p_client_id uuid,
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
      
      -- Insert hotel checklist item
      IF day_plan->'hotel' IS NOT NULL THEN
        INSERT INTO booking_checklist (
          client_id, 
          assignment_id, 
          item_type, 
          item_id, 
          item_name, 
          day_number, 
          is_completed,
          is_booked
        )
        VALUES (
          p_client_id,
          p_assignment_id, 
          'hotel', 
          COALESCE(day_plan->'hotel'->>'hotelId', 'unknown'), 
          'Hotel - Day ' || day_number, 
          day_number, 
          false,
          false
        );
      END IF;
      
      -- Insert sightseeing checklist items
      IF day_plan->'sightseeing' IS NOT NULL AND jsonb_array_length(day_plan->'sightseeing') > 0 THEN
        FOR sightseeing_id IN SELECT jsonb_array_elements_text(day_plan->'sightseeing')
        LOOP
          INSERT INTO booking_checklist (
            client_id,
            assignment_id, 
            item_type, 
            item_id, 
            item_name, 
            day_number, 
            is_completed,
            is_booked
          )
          VALUES (
            p_client_id,
            p_assignment_id, 
            'sightseeing', 
            sightseeing_id, 
            'Sightseeing - Day ' || day_number, 
            day_number, 
            false,
            false
          );
        END LOOP;
      END IF;
      
      -- Insert activity checklist items
      IF day_plan->'activities' IS NOT NULL AND jsonb_array_length(day_plan->'activities') > 0 THEN
        FOR activity IN SELECT * FROM jsonb_array_elements(day_plan->'activities')
        LOOP
          INSERT INTO booking_checklist (
            client_id,
            assignment_id, 
            item_type, 
            item_id, 
            item_name, 
            day_number, 
            is_completed,
            is_booked
          )
          VALUES (
            p_client_id,
            p_assignment_id, 
            'activity', 
            COALESCE(activity->>'activityId', 'unknown'), 
            'Activity - Day ' || day_number, 
            day_number, 
            false,
            false
          );
        END LOOP;
      END IF;
      
      -- Insert entry ticket checklist items
      IF day_plan->'entryTickets' IS NOT NULL AND jsonb_array_length(day_plan->'entryTickets') > 0 THEN
        FOR entry_ticket_id IN SELECT jsonb_array_elements_text(day_plan->'entryTickets')
        LOOP
          INSERT INTO booking_checklist (
            client_id,
            assignment_id, 
            item_type, 
            item_id, 
            item_name, 
            day_number, 
            is_completed,
            is_booked
          )
          VALUES (
            p_client_id,
            p_assignment_id, 
            'entry_ticket', 
            entry_ticket_id, 
            'Entry Ticket - Day ' || day_number, 
            day_number, 
            false,
            false
          );
        END LOOP;
      END IF;
      
      -- Insert meal checklist items
      IF day_plan->'meals' IS NOT NULL AND jsonb_array_length(day_plan->'meals') > 0 THEN
        FOR meal_id IN SELECT jsonb_array_elements_text(day_plan->'meals')
        LOOP
          INSERT INTO booking_checklist (
            client_id,
            assignment_id, 
            item_type, 
            item_id, 
            item_name, 
            day_number, 
            is_completed,
            is_booked
          )
          VALUES (
            p_client_id,
            p_assignment_id, 
            'meal', 
            meal_id, 
            'Meal - Day ' || day_number, 
            day_number, 
            false,
            false
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recreate auto_assign_to_operations trigger with client_id parameter
CREATE OR REPLACE FUNCTION auto_assign_to_operations()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_ops_person_id uuid;
  new_assignment_id uuid;
BEGIN
  -- Only proceed if status is changing to advance-paid-confirmed
  IF NEW.current_follow_up_status = 'advance-paid-confirmed' 
     AND (OLD.current_follow_up_status IS NULL OR OLD.current_follow_up_status != 'advance-paid-confirmed') THEN
    
    -- Check if assignment already exists
    IF EXISTS (SELECT 1 FROM package_assignments WHERE sales_client_id = NEW.id) THEN
      RETURN NEW;
    END IF;
    
    -- Get available operations person
    selected_ops_person_id := get_random_available_operations_person();
    
    IF selected_ops_person_id IS NOT NULL THEN
      -- Create package assignment
      INSERT INTO package_assignments (
        sales_client_id, 
        sales_person_id, 
        operations_person_id, 
        status, 
        completion_percentage
      )
      VALUES (
        NEW.id, 
        NEW.sales_person_id, 
        selected_ops_person_id, 
        'pending', 
        0
      )
      RETURNING id INTO new_assignment_id;
      
      -- Generate booking checklist with both assignment_id AND client_id
      IF NEW.itinerary_data IS NOT NULL THEN
        PERFORM generate_booking_checklist(new_assignment_id, NEW.id, NEW.itinerary_data);
      END IF;
      
      -- Update client record
      NEW.assigned_operation_person_id := selected_ops_person_id;
      NEW.booking_completion_percentage := 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
