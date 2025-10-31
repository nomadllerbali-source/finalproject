import { supabase } from './supabase';

export interface PackageAssignment {
  id: string;
  sales_client_id: string;
  sales_person_id: string;
  operations_person_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  completion_percentage: number;
  assigned_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  assignment_id: string;
  item_type: 'hotel' | 'transportation' | 'activity' | 'entry_ticket' | 'meal' | 'sightseeing';
  item_id: string;
  item_name: string;
  day_number: number | null;
  is_completed: boolean;
  completed_at: string | null;
  completed_by: string | null;
  booking_reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  assignment_id: string;
  sender_id: string;
  sender_type: 'sales' | 'operations' | 'admin';
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const getAssignmentsByOperationsPerson = async (operationsPersonId: string): Promise<PackageAssignment[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('package_assignments')
    .select('*')
    .eq('operations_person_id', operationsPersonId)
    .order('assigned_at', { ascending: false });

  if (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }

  return data || [];
};

export const getAssignmentDetails = async (assignmentId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('package_assignments')
    .select(`
      *,
      sales_person:sales_persons(id, full_name, email),
      sales_client:sales_clients(*)
    `)
    .eq('id', assignmentId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching assignment details:', error);
    return null;
  }

  return data;
};

export const getChecklistItems = async (assignmentId: string): Promise<ChecklistItem[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('booking_checklist')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('day_number', { ascending: true });

  if (error) {
    console.error('Error fetching checklist items:', error);
    return [];
  }

  return data || [];
};

export const updateChecklistItem = async (
  itemId: string,
  updates: Partial<ChecklistItem>
): Promise<ChecklistItem | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('booking_checklist')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating checklist item:', error);
    return null;
  }

  return data;
};

export const getChatMessages = async (assignmentId: string): Promise<ChatMessage[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('operations_chat')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }

  return data || [];
};

export const sendChatMessage = async (
  assignmentId: string,
  senderId: string,
  senderType: 'sales' | 'operations' | 'admin',
  senderName: string,
  message: string
): Promise<ChatMessage | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('operations_chat')
    .insert([{
      assignment_id: assignmentId,
      sender_id: senderId,
      sender_type: senderType,
      sender_name: senderName,
      message: message
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending chat message:', error);
    return null;
  }

  return data;
};

export const subscribeToAssignmentChat = (
  assignmentId: string,
  callback: (message: ChatMessage) => void
) => {
  if (!supabase) return null;

  return supabase
    .channel(`assignment-chat:${assignmentId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'operations_chat',
      filter: `assignment_id=eq.${assignmentId}`
    }, (payload) => {
      callback(payload.new as ChatMessage);
    })
    .subscribe();
};

export const calculateProgress = async (assignmentId: string): Promise<number> => {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from('booking_checklist')
    .select('is_completed')
    .eq('assignment_id', assignmentId);

  if (error || !data || data.length === 0) {
    return 0;
  }

  const completed = data.filter(item => item.is_completed).length;
  return Math.round((completed / data.length) * 100);
};

export const getAssignmentForClient = async (clientId: string): Promise<PackageAssignment | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('package_assignments')
    .select('*')
    .eq('sales_client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching assignment for client:', error);
    return null;
  }

  return data;
};

export const getOperationsPersonDetails = async (operationsPersonId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('operations_persons')
    .select('id, full_name, email, phone_number')
    .eq('id', operationsPersonId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching operations person details:', error);
    return null;
  }

  return data;
};

export const getUnreadMessageCountForAssignment = async (assignmentId: string, userId: string): Promise<number> => {
  if (!supabase) return 0;

  const { data, error } = await supabase
    .from('operations_chat')
    .select('id', { count: 'exact', head: true })
    .eq('assignment_id', assignmentId)
    .eq('is_read', false)
    .neq('sender_id', userId);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return data?.length || 0;
};

export const getUnreadMessageCountByUser = async (userId: string): Promise<{[assignmentId: string]: number}> => {
  if (!supabase) return {};

  const { data: assignments, error: assignmentsError } = await supabase
    .from('package_assignments')
    .select('id')
    .or(`sales_person_id.eq.${userId},operations_person_id.eq.${userId}`);

  if (assignmentsError || !assignments) {
    console.error('Error fetching assignments:', assignmentsError);
    return {};
  }

  const counts: {[key: string]: number} = {};

  for (const assignment of assignments) {
    const { count, error } = await supabase
      .from('operations_chat')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignment.id)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (!error) {
      counts[assignment.id] = count || 0;
    }
  }

  return counts;
};

export const markMessagesAsRead = async (assignmentId: string, userId: string): Promise<void> => {
  if (!supabase) return;

  const { error } = await supabase
    .from('operations_chat')
    .update({ is_read: true })
    .eq('assignment_id', assignmentId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking messages as read:', error);
  }
};
