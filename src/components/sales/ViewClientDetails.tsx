import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Phone, Mail, Calendar, Clock, Car, DollarSign, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { SalesClient, FollowUpHistory, getFollowUpHistoryWithVersions } from '../../lib/salesHelpers';
import Layout from '../Layout';

interface ViewClientDetailsProps {
  client: SalesClient;
  onBack: () => void;
}

const ViewClientDetails: React.FC<ViewClientDetailsProps> = ({ client, onBack }) => {
  const [followUpHistory, setFollowUpHistory] = useState<FollowUpHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUpHistory();
  }, [client.id]);

  const loadFollowUpHistory = async () => {
    setLoading(true);
    try {
      const history = await getFollowUpHistoryWithVersions(client.id);
      setFollowUpHistory(history);
    } catch (error) {
      console.error('Error loading follow-up history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'itinerary-created':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'itinerary-sent':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case '1st-follow-up':
      case '2nd-follow-up':
      case '3rd-follow-up':
      case '4th-follow-up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'itinerary-edited':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'updated-itinerary-sent':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'advance-paid-confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'dead':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Layout title="Client Details" subtitle={client.name}>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Current Status Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Current Status</p>
            <h2 className="text-2xl font-bold">
              {getStatusLabel(client.current_follow_up_status)}
            </h2>
          </div>
          {client.next_follow_up_date && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
              <p className="text-xs text-blue-100 mb-1">Next Follow-up</p>
              <p className="font-semibold">
                {new Date(client.next_follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
              {client.next_follow_up_time && (
                <p className="text-sm text-blue-100">{client.next_follow_up_time}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
              Client Information
            </h2>

            <div className="space-y-5">
              {/* Personal Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Personal Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Name</p>
                      <p className="font-medium text-slate-900">{client.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">WhatsApp</p>
                      <p className="font-medium text-slate-900">
                        {client.country_code} {client.whatsapp}
                      </p>
                    </div>
                  </div>

                  {client.email && (
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-slate-900 break-all">{client.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Travel Details */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Travel Details
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Travel Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(client.travel_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="font-medium text-slate-900">{client.number_of_days} Days</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Passengers</p>
                      <p className="font-medium text-slate-900">
                        {client.number_of_adults} {client.number_of_adults === 1 ? 'Adult' : 'Adults'}
                        {client.number_of_children > 0 &&
                          `, ${client.number_of_children} ${client.number_of_children === 1 ? 'Child' : 'Children'}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Car className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Transportation</p>
                      <p className="font-medium text-slate-900">{client.transportation_mode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500">Total Cost</p>
                    <p className="text-2xl font-bold text-green-600">₹{client.total_cost.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-slate-500 mb-2">Booking Progress</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-slate-200 rounded-full h-2.5 mr-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all"
                        style={{ width: `${client.booking_completion_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {client.booking_completion_percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up History Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Follow-up History</h2>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MessageCircle className="h-4 w-4" />
                <span>{followUpHistory.length} {followUpHistory.length === 1 ? 'entry' : 'entries'}</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : followUpHistory.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No follow-up history yet</p>
                <p className="text-sm text-slate-400 mt-1">Follow-ups will appear here as they are added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {followUpHistory.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="relative pl-8 pb-6 border-l-2 border-slate-200 last:border-l-0 last:pb-0"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-0 -ml-[9px] w-4 h-4 rounded-full bg-white border-2 border-blue-600"></div>

                    {/* Follow-up Card */}
                    <div className={`border-2 rounded-lg p-4 ${getStatusColor(entry.status)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2.5 py-1 bg-white rounded-full text-xs font-bold text-slate-700">
                            #{followUpHistory.length - index}
                          </span>
                          <span className="font-semibold text-sm">
                            {getStatusLabel(entry.status)}
                          </span>
                          {entry.itinerary_version_number && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-white rounded-full text-xs font-medium text-blue-700">
                              <FileText className="h-3 w-3 mr-1" />
                              v{entry.itinerary_version_number}
                            </span>
                          )}
                        </div>
                        <div className="text-right text-xs">
                          <div className="font-medium">
                            {new Date(entry.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-slate-600">
                            {new Date(entry.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-white/60 rounded p-3">
                        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                          Remarks
                        </p>
                        <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                          {entry.remarks}
                        </p>
                      </div>

                      {entry.next_follow_up_date && (
                        <div className="mt-3 flex items-center space-x-4 text-xs text-slate-700">
                          <div className="flex items-center bg-white/60 rounded px-2 py-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Next: {new Date(entry.next_follow_up_date).toLocaleDateString()}
                          </div>
                          {entry.next_follow_up_time && (
                            <div className="flex items-center bg-white/60 rounded px-2 py-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {entry.next_follow_up_time}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewClientDetails;
