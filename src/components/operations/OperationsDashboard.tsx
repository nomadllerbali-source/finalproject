import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, Clock, AlertCircle, Calendar, Users, ChevronRight, DollarSign, MessageSquare } from 'lucide-react';
import { getAssignmentsByOperationsPerson, getUnreadMessageCountForAssignment, PackageAssignment } from '../../lib/operationsHelpers';
import { supabase } from '../../lib/supabase';
import SalesOperationsChat from '../shared/SalesOperationsChat';

interface AssignmentWithDetails extends PackageAssignment {
  sales_person: {
    full_name: string;
    email: string;
  } | null;
  sales_client: {
    id: string;
    name: string;
    travel_date: string;
    number_of_days: number;
    number_of_adults: number;
    number_of_children: number;
    transportation_mode: string;
    total_cost: number;
  } | null;
  checklist_stats: {
    total: number;
    completed: number;
  };
}

interface OperationsDashboardProps {
  operationsPersonId: string;
  onViewChecklist: (assignmentId: string) => void;
}

interface ClientForChat {
  id: string;
  name: string;
}

const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ operationsPersonId, onViewChecklist }) => {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [showChat, setShowChat] = useState(false);
  const [chatClient, setChatClient] = useState<ClientForChat | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<{[assignmentId: string]: number}>({});

  useEffect(() => {
    if (operationsPersonId) {
      fetchAssignments();
    }
  }, [operationsPersonId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('package_assignments')
        .select(`
          *,
          sales_person:sales_persons(full_name, email),
          sales_client:sales_clients!inner(
            id,
            name,
            travel_date,
            number_of_adults,
            number_of_children,
            transportation_mode,
            total_cost,
            confirmed_version_id
          )
        `)
        .eq('operations_person_id', operationsPersonId)
        .eq('sales_client.current_follow_up_status', 'advance-paid-confirmed')
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      const assignmentsWithStats = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const { data: checklistData, error: checklistError } = await supabase
            .from('booking_checklist')
            .select('is_completed')
            .eq('assignment_id', assignment.id);

          if (checklistError) {
            console.error('Error fetching checklist:', checklistError);
            return {
              ...assignment,
              checklist_stats: { total: 0, completed: 0 }
            };
          }

          let confirmedDays = 0;
          if (assignment.sales_client?.confirmed_version_id) {
            const { data: versionData } = await supabase
              .from('sales_itinerary_versions')
              .select('itinerary_data')
              .eq('id', assignment.sales_client.confirmed_version_id)
              .maybeSingle();

            if (versionData?.itinerary_data?.days) {
              confirmedDays = versionData.itinerary_data.days.length;
            }
          }

          return {
            ...assignment,
            sales_client: {
              ...assignment.sales_client,
              number_of_days: confirmedDays || assignment.sales_client.number_of_days
            },
            checklist_stats: {
              total: checklistData?.length || 0,
              completed: checklistData?.filter(item => item.is_completed).length || 0
            }
          };
        })
      );

      setAssignments(assignmentsWithStats);
      loadUnreadCounts(assignmentsWithStats);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCounts = async (assignments: AssignmentWithDetails[]) => {
    const counts: {[assignmentId: string]: number} = {};
    for (const assignment of assignments) {
      try {
        const count = await getUnreadMessageCountForAssignment(assignment.id, operationsPersonId);
        counts[assignment.id] = count;
      } catch (error) {
        console.error('Error loading unread count for assignment:', assignment.id, error);
      }
    }
    setUnreadCounts(counts);
  };

  useEffect(() => {
    if (!showChat) {
      loadUnreadCounts(assignments);
    }
  }, [showChat]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!showChat) {
        loadUnreadCounts(assignments);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [assignments, showChat, operationsPersonId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProgressPercentage = (stats: { total: number; completed: number }) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const handleOpenChat = (client: ClientForChat) => {
    setChatClient(client);
    setShowChat(true);
  };

  if (showChat && chatClient) {
    return (
      <SalesOperationsChat
        clientId={chatClient.id}
        clientName={chatClient.name}
        onClose={() => {
          setShowChat(false);
          setChatClient(null);
        }}
      />
    );
  }

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Loading your packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Packages</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Package className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.in_progress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All Packages' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No packages found</h3>
            <p className="text-slate-600">
              {filter === 'all'
                ? 'You have no assigned packages yet'
                : `No ${filter.replace('_', ' ')} packages`}
            </p>
          </div>
        ) : (
          filteredAssignments.map((assignment) => {
            const progress = getProgressPercentage(assignment.checklist_stats);
            const client = assignment.sales_client;

            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {getStatusIcon(assignment.status)}
                            {assignment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {assignment.sales_person && (
                            <span className="text-sm text-slate-600">
                              by {assignment.sales_person.full_name}
                            </span>
                          )}
                        </div>
                        {client && (
                          <h3 className="text-lg font-semibold text-slate-900">
                            {client.name} - {client.number_of_days} Days Trip
                          </h3>
                        )}
                      </div>
                    </div>

                    {client && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>{client.number_of_adults + client.number_of_children} passengers</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(client.travel_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <DollarSign className="h-4 w-4" />
                          <span>IDR {client.total_cost?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Booking Progress
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {assignment.checklist_stats.completed} / {assignment.checklist_stats.total} items
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            progress === 100 ? 'bg-green-600' : progress > 50 ? 'bg-blue-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{progress}% complete</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => onViewChecklist(assignment.id)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      View Checklist
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                    {client && (
                      <button
                        onClick={() => handleOpenChat({ id: client.id, name: client.name })}
                        className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors relative"
                        title="Chat with Sales"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Chat
                        {unreadCounts[assignment.id] > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                            {unreadCounts[assignment.id]}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OperationsDashboard;
