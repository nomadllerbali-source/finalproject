import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, CheckCircle2, Clock, AlertCircle, Calendar, Users, MessageCircle, ChevronRight } from 'lucide-react';

interface PackageAssignment {
  id: string;
  itinerary_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_at: string;
  completed_at: string | null;
  sales_person: {
    full_name: string;
    email: string;
  } | null;
  checklist_stats: {
    total: number;
    completed: number;
  };
  itinerary_data: any;
}

interface OperationsDashboardProps {
  operationsPersonId: string;
  onViewChecklist: (assignmentId: string) => void;
}

const OperationsDashboard: React.FC<OperationsDashboardProps> = ({ operationsPersonId, onViewChecklist }) => {
  const [assignments, setAssignments] = useState<PackageAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    if (operationsPersonId) {
      fetchAssignments();
    }
  }, [operationsPersonId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('package_assignments')
        .select(`
          *,
          sales_person:sales_persons(full_name, email)
        `)
        .eq('operations_person_id', operationsPersonId)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch checklist stats for each assignment
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
              checklist_stats: { total: 0, completed: 0 },
              itinerary_data: null
            };
          }

          // Fetch itinerary data from localStorage
          const itinerariesJson = localStorage.getItem('itineraries');
          let itineraryData = null;
          if (itinerariesJson) {
            const itineraries = JSON.parse(itinerariesJson);
            itineraryData = itineraries.find((it: any) => it.id === assignment.itinerary_id);
          }

          return {
            ...assignment,
            checklist_stats: {
              total: checklistData?.length || 0,
              completed: checklistData?.filter(item => item.is_completed).length || 0
            },
            itinerary_data: itineraryData
          };
        })
      );

      setAssignments(assignmentsWithStats);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Stats */}
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

      {/* Filters */}
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

      {/* Assignments List */}
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
            const itinerary = assignment.itinerary_data;

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
                        {itinerary && (
                          <h3 className="text-lg font-semibold text-slate-900">
                            {itinerary.client.name} - {itinerary.client.numberOfDays} Days Trip
                          </h3>
                        )}
                      </div>
                    </div>

                    {itinerary && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-4 w-4" />
                          <span>{itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} passengers</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(itinerary.client.travelDates.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Package className="h-4 w-4" />
                          <span>Rp {itinerary.finalPrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
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
