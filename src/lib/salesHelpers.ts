import { supabase } from './supabase';

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SalesClient {
  id: string;
  sales_person_id: string;
  name: string;
  country_code: string;
  whatsapp: string;
  email?: string;
  travel_date: string;
  number_of_days: number;
  number_of_adults: number;
  number_of_children: number;
  transportation_mode: string;
  itinerary_data?: any;
  total_cost: number;
  current_follow_up_status: string;
  next_follow_up_date?: string;
  next_follow_up_time?: string;
  assigned_operation_person_id?: string;
  booking_completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface FollowUpHistory {
  id: string;
  client_id: string;
  sales_person_id: string;
  status: string;
  remarks: string;
  next_follow_up_date?: string;
  next_follow_up_time?: string;
  itinerary_version_number?: number;
  created_at: string;
  created_by: string;
}

export interface ItineraryVersion {
  id: string;
  client_id: string;
  version_number: number;
  itinerary_data: any;
  total_cost: number;
  change_description: string;
  associated_follow_up_status: string;
  created_at: string;
  created_by: string;
}

export interface ChatMessage {
  id: string;
  client_id: string;
  sender_id: string;
  sender_role: 'sales' | 'operations';
  message: string;
  created_at: string;
}

export interface BookingChecklistItem {
  id: string;
  client_id: string;
  item_type: 'sightseeing' | 'hotel' | 'activity' | 'entry_ticket' | 'meal' | 'transportation';
  item_id: string;
  item_name: string;
  day_number?: number;
  is_booked: boolean;
  booked_at?: string;
  booked_by?: string;
  booking_notes?: string;
  created_at: string;
}

// Sales Person Operations
export const getAllSalesPersons = async (): Promise<SalesPerson[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_persons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getSalesPerson = async (id: string): Promise<SalesPerson | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_persons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const createSalesPerson = async (salesPerson: Omit<SalesPerson, 'id' | 'created_at' | 'updated_at'>): Promise<SalesPerson | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_persons')
    .insert(salesPerson)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSalesPerson = async (id: string, updates: Partial<SalesPerson>): Promise<SalesPerson | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_persons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Sales Client Operations
export const getAllSalesClients = async (): Promise<SalesClient[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_clients')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getSalesClientsBySalesPerson = async (salesPersonId: string): Promise<SalesClient[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_clients')
    .select('*')
    .eq('sales_person_id', salesPersonId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getConfirmedClients = async (salesPersonId: string): Promise<SalesClient[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_clients')
    .select('*')
    .eq('sales_person_id', salesPersonId)
    .eq('current_follow_up_status', 'advance-paid-confirmed')
    .order('created_at', { ascending: false});
  if (error) throw error;
  return data || [];
};

export const getTodayFollowUps = async (salesPersonId: string): Promise<SalesClient[]> => {
  if (!supabase) return [];
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('sales_clients')
    .select('*')
    .eq('sales_person_id', salesPersonId)
    .eq('next_follow_up_date', today)
    .order('next_follow_up_time', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createSalesClient = async (client: Omit<SalesClient, 'id' | 'created_at' | 'updated_at'>): Promise<SalesClient | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_clients')
    .insert(client)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateSalesClient = async (id: string, updates: Partial<SalesClient>): Promise<SalesClient | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteSalesClient = async (id: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('sales_clients')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Follow-up History Operations
export const getFollowUpHistory = async (clientId: string): Promise<FollowUpHistory[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('follow_up_history')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createFollowUpHistory = async (followUp: Omit<FollowUpHistory, 'id' | 'created_at'>): Promise<FollowUpHistory | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('follow_up_history')
    .insert(followUp)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Chat Operations
export const getChatMessages = async (clientId: string): Promise<ChatMessage[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_operations_chat')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const sendChatMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_operations_chat')
    .insert(message)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Subscribe to real-time chat updates
export const subscribeToChatMessages = (clientId: string, callback: (message: ChatMessage) => void) => {
  if (!supabase) return null;
  return supabase
    .channel(`chat:${clientId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'sales_operations_chat',
      filter: `client_id=eq.${clientId}`
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();
};

// Booking Checklist Operations
export const getBookingChecklist = async (clientId: string): Promise<BookingChecklistItem[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('booking_checklist')
    .select('*')
    .eq('client_id', clientId)
    .order('day_number', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const updateBookingChecklistItem = async (id: string, updates: Partial<BookingChecklistItem>): Promise<BookingChecklistItem | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('booking_checklist')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createBookingChecklist = async (clientId: string, itineraryData: any): Promise<void> => {
  if (!supabase) return;

  const checklistItems: any[] = [];

  // Parse itinerary data and create checklist items
  if (itineraryData && itineraryData.dayPlans) {
    itineraryData.dayPlans.forEach((dayPlan: any, index: number) => {
      const dayNumber = index + 1;

      // Add sightseeing items
      if (dayPlan.sightseeing) {
        dayPlan.sightseeing.forEach((sightseeingId: string) => {
          checklistItems.push({
            client_id: clientId,
            item_type: 'sightseeing',
            item_id: sightseeingId,
            item_name: `Sightseeing - Day ${dayNumber}`,
            day_number: dayNumber,
            is_booked: false
          });
        });
      }

      // Add hotel items
      if (dayPlan.hotel) {
        checklistItems.push({
          client_id: clientId,
          item_type: 'hotel',
          item_id: dayPlan.hotel.hotelId,
          item_name: `Hotel - Day ${dayNumber}`,
          day_number: dayNumber,
          is_booked: false
        });
      }

      // Add activity items
      if (dayPlan.activities) {
        dayPlan.activities.forEach((activity: any) => {
          checklistItems.push({
            client_id: clientId,
            item_type: 'activity',
            item_id: activity.activityId,
            item_name: `Activity - Day ${dayNumber}`,
            day_number: dayNumber,
            is_booked: false
          });
        });
      }

      // Add entry ticket items
      if (dayPlan.entryTickets) {
        dayPlan.entryTickets.forEach((ticketId: string) => {
          checklistItems.push({
            client_id: clientId,
            item_type: 'entry_ticket',
            item_id: ticketId,
            item_name: `Entry Ticket - Day ${dayNumber}`,
            day_number: dayNumber,
            is_booked: false
          });
        });
      }

      // Add meal items
      if (dayPlan.meals) {
        dayPlan.meals.forEach((mealId: string) => {
          checklistItems.push({
            client_id: clientId,
            item_type: 'meal',
            item_id: mealId,
            item_name: `Meal - Day ${dayNumber}`,
            day_number: dayNumber,
            is_booked: false
          });
        });
      }
    });
  }

  if (checklistItems.length > 0) {
    const { error } = await supabase
      .from('booking_checklist')
      .insert(checklistItems);
    if (error) throw error;
  }
};

// Itinerary Version Operations
export const getItineraryVersionsByClient = async (clientId: string): Promise<ItineraryVersion[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_itinerary_versions')
    .select('*')
    .eq('client_id', clientId)
    .order('version_number', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getLatestItineraryVersion = async (clientId: string): Promise<ItineraryVersion | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_itinerary_versions')
    .select('*')
    .eq('client_id', clientId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getItineraryVersion = async (clientId: string, versionNumber: number): Promise<ItineraryVersion | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_itinerary_versions')
    .select('*')
    .eq('client_id', clientId)
    .eq('version_number', versionNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const createItineraryVersion = async (
  clientId: string,
  itineraryData: any,
  totalCost: number,
  changeDescription: string,
  followUpStatus: string,
  createdBy: string
): Promise<ItineraryVersion | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .rpc('create_itinerary_version_atomic', {
      p_client_id: clientId,
      p_itinerary_data: itineraryData,
      p_total_cost: totalCost,
      p_change_description: changeDescription,
      p_associated_follow_up_status: followUpStatus,
      p_created_by: createdBy
    });

  if (error) throw error;
  return data;
};

export const getFollowUpHistoryWithVersions = async (clientId: string): Promise<FollowUpHistory[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('follow_up_history')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
