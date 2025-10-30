/*
  # Fix Trigger Timing Conflict
  
  ## Problem
  The auto_assign_to_operations trigger uses BEFORE UPDATE and modifies the NEW record,
  causing a "tuple to be updated was already modified" error. This happens because
  BEFORE triggers that modify NEW can conflict with the original UPDATE statement.
  
  ## Solution
  Change the trigger to AFTER UPDATE and update the client record separately using
  a direct UPDATE statement instead of modifying NEW.
  
  ## Changes
  1. Drop existing BEFORE UPDATE trigger
  2. Recreate as AFTER UPDATE trigger
  3. Update function to use separate UPDATE statement for client fields
*/

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_auto_assign_to_operations ON sales_clients;

-- Recreate the function to work with AFTER trigger
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
      
      -- Update client record with assignment info (using separate UPDATE)
      UPDATE sales_clients
      SET 
        assigned_operation_person_id = selected_ops_person_id,
        booking_completion_percentage = 0
      WHERE id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create AFTER UPDATE trigger instead of BEFORE UPDATE
CREATE TRIGGER trigger_auto_assign_to_operations
  AFTER UPDATE ON sales_clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_to_operations();
