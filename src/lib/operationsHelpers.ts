import { supabase } from './supabase';

/**
 * Assigns a package to an operations person and creates checklist items
 */
export async function assignPackageToOperations(
  itineraryId: string,
  salesPersonId: string,
  itineraryData: any
): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
  try {
    // Get all active operations persons
    const { data: operationsPersons, error: opsError } = await supabase
      .from('operations_persons')
      .select('id')
      .eq('is_active', true);

    if (opsError) throw opsError;

    if (!operationsPersons || operationsPersons.length === 0) {
      return { success: false, error: 'No active operations persons available' };
    }

    // Check if already assigned
    const { data: existingAssignment } = await supabase
      .from('package_assignments')
      .select('id')
      .eq('itinerary_id', itineraryId)
      .maybeSingle();

    if (existingAssignment) {
      return { success: true, assignmentId: existingAssignment.id };
    }

    // Randomly assign to an operations person
    const randomIndex = Math.floor(Math.random() * operationsPersons.length);
    const selectedOperationsPerson = operationsPersons[randomIndex];

    // Create package assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('package_assignments')
      .insert([{
        itinerary_id: itineraryId,
        sales_person_id: salesPersonId,
        operations_person_id: selectedOperationsPerson.id,
        status: 'pending'
      }])
      .select()
      .single();

    if (assignmentError) throw assignmentError;

    // Create checklist items from itinerary
    const checklistItems = createChecklistItems(assignment.id, itineraryData);

    const { error: checklistError } = await supabase
      .from('booking_checklist')
      .insert(checklistItems);

    if (checklistError) throw checklistError;

    return { success: true, assignmentId: assignment.id };
  } catch (error: any) {
    console.error('Error assigning package:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates checklist items from itinerary data
 */
function createChecklistItems(assignmentId: string, itinerary: any): any[] {
  const items: any[] = [];

  // Add transportation if not cab
  if (itinerary.client.transportationMode && !itinerary.client.transportationMode.toLowerCase().includes('cab')) {
    items.push({
      assignment_id: assignmentId,
      item_type: 'transportation',
      item_id: 'main-transport',
      item_name: `${itinerary.client.transportationMode} for ${itinerary.client.numberOfDays} days`,
      day_number: null,
      is_completed: false
    });
  }

  // Process each day plan
  itinerary.dayPlans.forEach((dayPlan: any, index: number) => {
    const dayNumber = index + 1;

    // Hotel booking
    if (dayPlan.hotel) {
      items.push({
        assignment_id: assignmentId,
        item_type: 'hotel',
        item_id: dayPlan.hotel.hotelId,
        item_name: `Hotel booking for Day ${dayNumber} at ${dayPlan.hotel.place}`,
        day_number: dayNumber,
        is_completed: false
      });
    }

    // Sightseeing bookings
    if (dayPlan.sightseeing && dayPlan.sightseeing.length > 0) {
      dayPlan.sightseeing.forEach((sightseeingId: string) => {
        items.push({
          assignment_id: assignmentId,
          item_type: 'sightseeing',
          item_id: sightseeingId,
          item_name: `Sightseeing arrangement for Day ${dayNumber}`,
          day_number: dayNumber,
          is_completed: false
        });
      });
    }

    // Activity bookings
    if (dayPlan.activities && dayPlan.activities.length > 0) {
      dayPlan.activities.forEach((activity: any) => {
        items.push({
          assignment_id: assignmentId,
          item_type: 'activity',
          item_id: activity.activityId,
          item_name: `Activity booking for Day ${dayNumber}`,
          day_number: dayNumber,
          is_completed: false
        });
      });
    }

    // Entry tickets
    if (dayPlan.entryTickets && dayPlan.entryTickets.length > 0) {
      dayPlan.entryTickets.forEach((ticketId: string) => {
        items.push({
          assignment_id: assignmentId,
          item_type: 'entry_ticket',
          item_id: ticketId,
          item_name: `Entry ticket for Day ${dayNumber}`,
          day_number: dayNumber,
          is_completed: false
        });
      });
    }

    // Meal arrangements
    if (dayPlan.meals && dayPlan.meals.length > 0) {
      dayPlan.meals.forEach((mealId: string) => {
        items.push({
          assignment_id: assignmentId,
          item_type: 'meal',
          item_id: mealId,
          item_name: `Meal arrangement for Day ${dayNumber}`,
          day_number: dayNumber,
          is_completed: false
        });
      });
    }
  });

  return items;
}

/**
 * Get assignment progress for a specific itinerary
 */
export async function getAssignmentProgress(itineraryId: string): Promise<{
  total: number;
  completed: number;
  percentage: number;
} | null> {
  try {
    const { data: assignment } = await supabase
      .from('package_assignments')
      .select('id')
      .eq('itinerary_id', itineraryId)
      .maybeSingle();

    if (!assignment) return null;

    const { data: checklistItems } = await supabase
      .from('booking_checklist')
      .select('is_completed')
      .eq('assignment_id', assignment.id);

    if (!checklistItems) return { total: 0, completed: 0, percentage: 0 };

    const total = checklistItems.length;
    const completed = checklistItems.filter(item => item.is_completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  } catch (error) {
    console.error('Error getting assignment progress:', error);
    return null;
  }
}
