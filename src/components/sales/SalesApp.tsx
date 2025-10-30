import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DataProvider } from '../../contexts/DataContext';
import { Users, CheckCircle, Clock, Plus, Eye, Edit2, Trash2, MessageCircle, Phone, FileText, X, Calendar, MapPin, Car, DollarSign, Send, Filter, LogOut, Mail } from 'lucide-react';
import Layout from '../Layout';
import SalesItineraryBuilder from '../itinerary/SalesItineraryBuilder';
import ViewItinerary from './ViewItinerary';
import ViewClientDetails from './ViewClientDetails';
import EditClient from './EditClient';
import EditItinerary from './EditItinerary';
import FollowUpManager from './FollowUpManager';
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
type ViewType = 'viewItinerary' | 'viewDetails' | 'edit' | 'editItinerary' | 'followUp';

const SalesApp: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [allClients, setAllClients] = useState<SalesClient[]>([]);
  const [confirmedClients, setConfirmedClients] = useState<SalesClient[]>([]);
  const [followUpClients, setFollowUpClients] = useState<SalesClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItineraryBuilder, setShowItineraryBuilder] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SalesClient | null>(null);
  const [currentView, setCurrentView] = useState<ViewType | null>(null);

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
    setCurrentView('viewDetails');
  };

  const handleEditClient = (client: SalesClient) => {
    setSelectedClient(client);
    setCurrentView('edit');
  };

  const handleEditItinerary = (client: SalesClient) => {
    setSelectedClient(client);
    setCurrentView('editItinerary');
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
    setCurrentView('followUp');
  };

  const handleViewItinerary = (client: SalesClient) => {
    setSelectedClient(client);
    setCurrentView('viewItinerary');
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
      await logout();
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

  if (currentView && selectedClient) {
    const handleBack = () => {
      setCurrentView(null);
      setSelectedClient(null);
      loadData();
    };

    return (
      <DataProvider>
        {currentView === 'viewItinerary' && <ViewItinerary client={selectedClient} onBack={handleBack} />}
        {currentView === 'viewDetails' && <ViewClientDetails client={selectedClient} onBack={handleBack} />}
        {currentView === 'edit' && <EditClient client={selectedClient} onBack={handleBack} onEditItinerary={handleEditItinerary} />}
        {currentView === 'editItinerary' && <EditItinerary client={selectedClient} onBack={handleBack} onSuccess={handleBack} />}
        {currentView === 'followUp' && <FollowUpManager client={selectedClient} onBack={handleBack} />}
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
    </Layout>
  );
};

export default SalesApp;
