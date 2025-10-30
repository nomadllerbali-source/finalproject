import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DataProvider } from '../../contexts/DataContext';
import { Users, CheckCircle, Clock, Plus, Eye, Edit2, Trash2, MessageCircle, Phone, FileText, X, Calendar, MapPin, Car, DollarSign, Send, Filter, LogOut, Mail } from 'lucide-react';
import Layout from '../Layout';
import SalesItineraryBuilder from '../itinerary/SalesItineraryBuilder';
import {
  getSalesClientsBySalesPerson,
  getConfirmedClients,
  getTodayFollowUps,
  createSalesClient,
  updateSalesClient,
  deleteSalesClient,
  SalesClient
} from '../../lib/salesHelpers';

type TabType = 'all' | 'confirmed' | 'followups';

const SalesApp: React.FC = () => {
  const { state: authState, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [allClients, setAllClients] = useState<SalesClient[]>([]);
  const [confirmedClients, setConfirmedClients] = useState<SalesClient[]>([]);
  const [followUpClients, setFollowUpClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [authState.user?.id]);

  const loadData = async () => {
    if (!authState.user?.id) return;

    setLoading(true);
    try {
      const [all, confirmed, followups] = await Promise.all([
        getSalesClientsBySalesPerson(authState.user.id),
        getConfirmedClients(authState.user.id),
        getTodayFollowUps(authState.user.id)
      ]);

      setAllClients(all);
      setConfirmedClients(confirmed);
      setFollowUpClients(followups);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentClients = (): SalesClient[] => {
    switch (activeTab) {
      case 'confirmed':
        return confirmedClients;
      case 'followups':
        return followUpClients;
      default:
        return allClients;
    }
  };

  const clients = getCurrentClients();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'itinerary-created':
        return 'bg-blue-100 text-blue-800';
      case 'itinerary-sent':
        return 'bg-purple-100 text-purple-800';
      case '1st-follow-up':
      case '2nd-follow-up':
      case '3rd-follow-up':
      case '4th-follow-up':
        return 'bg-yellow-100 text-yellow-800';
      case 'itinerary-edited':
        return 'bg-indigo-100 text-indigo-800';
      case 'updated-itinerary-sent':
        return 'bg-cyan-100 text-cyan-800';
      case 'advance-paid-confirmed':
        return 'bg-green-100 text-green-800';
      case 'dead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleViewClient = (client: SalesClient) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client: SalesClient) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete client "${clientName}"? This will also delete all associated booking checklists.`)) {
      try {
        await deleteSalesClient(clientId);
        await loadData();
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
      }
    }
  };

  const handleFollowUp = (client: SalesClient) => {
    setSelectedClient(client);
    setShowFollowUpModal(true);
  };

  const handleViewItinerary = (client: SalesClient) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleWhatsAppChat = (client: SalesClient) => {
    const message = encodeURIComponent(
      `Hello ${client.name}! This is regarding your ${client.number_of_days}-day travel package. How can I assist you today?`
    );
    const whatsappUrl = `https://wa.me/${client.country_code.replace('+', '')}${client.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  if (showItineraryBuilder) {
    return (
      <DataProvider>
        <SalesItineraryBuilder onBackToDashboard={() => {
          setShowItineraryBuilder(false);
          loadData();
        }} />
      </DataProvider>
    );
  }

  if (loading) {
    return (
      <Layout title="Sales Portal" subtitle="Manage your clients and itineraries">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sales Portal" subtitle="Manage your clients and itineraries">
      {/* User Info and Logout */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="font-medium text-slate-900">{authState.user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Clients</span>
                <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {allClients.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'confirmed'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Confirmed Clients</span>
                <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {confirmedClients.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('followups')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'followups'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Today's Follow Ups</span>
                <span className="bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                  {followUpClients.length}
                </span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{allClients.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-slate-900">{confirmedClients.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Today's Follow Ups</p>
              <p className="text-2xl font-bold text-slate-900">{followUpClients.length}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ₹{confirmedClients.reduce((sum, c) => sum + c.total_cost, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {activeTab === 'all' && 'All Clients'}
              {activeTab === 'confirmed' && 'Confirmed Clients'}
              {activeTab === 'followups' && "Today's Follow Ups"}
            </h2>
            <button
              onClick={() => setShowItineraryBuilder(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {clients.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">No clients found</p>
              <p className="text-sm">
                {activeTab === 'all' && 'Start by adding your first client'}
                {activeTab === 'confirmed' && 'No confirmed bookings yet'}
                {activeTab === 'followups' && 'No follow-ups scheduled for today'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Travel Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Next Follow-up
                  </th>
                  {activeTab === 'confirmed' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Booking Progress
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{client.name}</p>
                        <div className="flex items-center text-slate-500 text-sm">
                          <Phone className="h-4 w-4 mr-1" />
                          {client.country_code} {client.whatsapp}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-slate-900 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(client.travel_date).toLocaleDateString()}
                        </div>
                        <div className="text-slate-500">
                          {client.number_of_days} days • {client.number_of_adults + client.number_of_children} pax
                        </div>
                        <div className="text-slate-500 flex items-center">
                          <Car className="h-4 w-4 mr-1" />
                          {client.transportation_mode}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.current_follow_up_status)}`}>
                        {getStatusLabel(client.current_follow_up_status)}
                      </span>
                      <div className="text-xs text-slate-500 mt-1">
                        ₹{client.total_cost.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.next_follow_up_date ? (
                        <div className="text-sm">
                          <div className="text-slate-900">
                            {new Date(client.next_follow_up_date).toLocaleDateString()}
                          </div>
                          {client.next_follow_up_time && (
                            <div className="text-slate-500">
                              {client.next_follow_up_time}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Not scheduled</span>
                      )}
                    </td>
                    {activeTab === 'confirmed' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${client.booking_completion_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-600">
                            {client.booking_completion_percentage}%
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewItinerary(client)}
                          className="p-2 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors"
                          title="View Itinerary"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewClient(client)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Edit Client"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFollowUp(client)}
                          className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                          title="Follow Up"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppChat(client)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="WhatsApp Chat"
                        >
                          <Phone className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showViewModal && selectedClient && (
        <ViewClientModal
          client={selectedClient}
          onClose={() => {
            setShowViewModal(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showEditModal && selectedClient && (
        <EditClientModal
          client={selectedClient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onSave={async () => {
            setShowEditModal(false);
            setSelectedClient(null);
            await loadData();
          }}
        />
      )}

      {showFollowUpModal && selectedClient && (
        <FollowUpModal
          client={selectedClient}
          onClose={() => {
            setShowFollowUpModal(false);
            setSelectedClient(null);
          }}
          onSave={async () => {
            setShowFollowUpModal(false);
            setSelectedClient(null);
            await loadData();
          }}
        />
      )}
    </Layout>
  );
};

const ViewClientModal: React.FC<{
  client: SalesClient;
  onClose: () => void;
}> = ({ client, onClose }) => {
  const itinerary = client.itinerary_data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">View Client & Itinerary</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Client Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Name</p>
                    <p className="font-medium text-slate-900">{client.name}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">WhatsApp</p>
                    <p className="font-medium text-slate-900">{client.country_code} {client.whatsapp}</p>
                  </div>
                </div>
                {client.email && (
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{client.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Travel Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Travel Date</p>
                    <p className="font-medium text-slate-900">{new Date(client.travel_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-medium text-slate-900">{client.number_of_days} days</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Users className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Passengers</p>
                    <p className="font-medium text-slate-900">{client.number_of_adults} Adults, {client.number_of_children} Children</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Car className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Transportation</p>
                    <p className="font-medium text-slate-900">{client.transportation_mode}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-4 w-4 text-slate-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-slate-500">Total Cost</p>
                    <p className="font-medium text-slate-900">₹{client.total_cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {itinerary && itinerary.days && Array.isArray(itinerary.days) && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Itinerary Details</h4>
              <div className="space-y-3">
                {itinerary.days.map((day: any, index: number) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-medium text-slate-900 mb-2">Day {day.day || index + 1}</h5>
                    <div className="space-y-1 text-sm text-slate-600">
                      {day.hotel && <p>🏨 Hotel: {typeof day.hotel === 'string' ? day.hotel : day.hotel.name}</p>}
                      {day.sightseeing && <p>📸 Sightseeing: {typeof day.sightseeing === 'string' ? day.sightseeing : day.sightseeing.name}</p>}
                      {day.activity && <p>🎯 Activity: {typeof day.activity === 'string' ? day.activity : day.activity.name}</p>}
                      {day.entryTicket && <p>🎫 Entry Ticket: {typeof day.entryTicket === 'string' ? day.entryTicket : day.entryTicket.name}</p>}
                      {day.meal && <p>🍽️ Meal: {typeof day.meal === 'string' ? day.meal : day.meal.name}</p>}
                      {day.transportation && <p>🚗 Transport: {typeof day.transportation === 'string' ? day.transportation : day.transportation.name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-medium text-slate-900">{client.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}</p>
            </div>
            {client.next_follow_up_date && (
              <div>
                <p className="text-sm text-slate-500">Next Follow-up</p>
                <p className="font-medium text-slate-900">
                  {new Date(client.next_follow_up_date).toLocaleDateString()} {client.next_follow_up_time}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500">Booking Progress</p>
              <p className="font-medium text-slate-900">{client.booking_completion_percentage}%</p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const EditClientModal: React.FC<{
  client: SalesClient;
  onClose: () => void;
  onSave: () => void;
}> = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email || '',
    country_code: client.country_code,
    whatsapp: client.whatsapp,
    travel_date: client.travel_date,
    number_of_days: client.number_of_days,
    number_of_adults: client.number_of_adults,
    number_of_children: client.number_of_children,
    transportation_mode: client.transportation_mode
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSalesClient(client.id, formData);
      onSave();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Edit Client</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Country Code
              </label>
              <input
                type="text"
                value={formData.country_code}
                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Travel Date
              </label>
              <input
                type="date"
                value={formData.travel_date}
                onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Days
              </label>
              <input
                type="number"
                value={formData.number_of_days}
                onChange={(e) => setFormData({ ...formData, number_of_days: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adults
              </label>
              <input
                type="number"
                value={formData.number_of_adults}
                onChange={(e) => setFormData({ ...formData, number_of_adults: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Children
              </label>
              <input
                type="number"
                value={formData.number_of_children}
                onChange={(e) => setFormData({ ...formData, number_of_children: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Transportation Mode
            </label>
            <select
              value={formData.transportation_mode}
              onChange={(e) => setFormData({ ...formData, transportation_mode: e.target.value as 'Flight' | 'Train' | 'Bus' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="Flight">Flight</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FollowUpModal: React.FC<{
  client: SalesClient;
  onClose: () => void;
  onSave: () => void;
}> = ({ client, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    current_follow_up_status: client.current_follow_up_status,
    next_follow_up_date: client.next_follow_up_date || '',
    next_follow_up_time: client.next_follow_up_time || '10:00'
  });
  const [saving, setSaving] = useState(false);

  const followUpStatuses = [
    'itinerary-created',
    'itinerary-sent',
    '1st-follow-up',
    '2nd-follow-up',
    '3rd-follow-up',
    '4th-follow-up',
    'itinerary-edited',
    'updated-itinerary-sent',
    'advance-paid-confirmed',
    'dead'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSalesClient(client.id, formData);
      onSave();
    } catch (error) {
      console.error('Error updating follow-up:', error);
      alert('Failed to update follow-up. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Update Follow-up</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Client Name
            </label>
            <p className="text-slate-900 font-medium">{client.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Follow-up Status
            </label>
            <select
              value={formData.current_follow_up_status}
              onChange={(e) => setFormData({ ...formData, current_follow_up_status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {followUpStatuses.map(status => (
                <option key={status} value={status}>
                  {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Next Follow-up Date
            </label>
            <input
              type="date"
              value={formData.next_follow_up_date}
              onChange={(e) => setFormData({ ...formData, next_follow_up_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Next Follow-up Time
            </label>
            <input
              type="time"
              value={formData.next_follow_up_time}
              onChange={(e) => setFormData({ ...formData, next_follow_up_time: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesApp;
