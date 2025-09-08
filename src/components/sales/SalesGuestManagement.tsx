import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateItineraryCost } from '../../utils/calculations';
import { Client, FollowUpStatus, FollowUpRecord } from '../../types';
import { 
  Users, Eye, Edit2, Trash2, MessageCircle, Calendar, Phone, 
  MapPin, Car, DollarSign, X, Save, Clock, AlertCircle, CheckCircle,
  UserCheck, UserX, Filter, FileText, Copy, Send, TrendingUp
} from 'lucide-react';
import Layout from '../Layout';
import ClientEditModal from '../admin/ClientEditModal';
import FollowUpModal from '../admin/FollowUpModal';
import ItineraryViewModal from '../admin/ItineraryViewModal';

type SalesGuestTab = 'all' | 'prospects' | 'followups' | 'converted';

const SalesGuestManagement: React.FC = () => {
  const { state, dispatch } = useData();
  const { state: authState } = useAuth();
  const { clients: allClients, hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  
  const [activeTab, setActiveTab] = useState<SalesGuestTab>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);

  // Filter clients to show only current sales person's clients
  const clients = allClients.filter(c => c.createdBy === authState.user?.id);

  // Get today's date for follow-up filtering
  const today = new Date().toISOString().split('T')[0];

  // Filter clients based on active tab
  const getFilteredClients = () => {
    switch (activeTab) {
      case 'prospects':
        return clients.filter(client => 
          !['advance-paid-confirmed', 'dead'].includes(client.followUpStatus?.status || '')
        );
      case 'followups':
        return clients.filter(client => {
          if (!client.nextFollowUpDate) return false;
          return client.nextFollowUpDate === today;
        });
      case 'converted':
        return clients.filter(client => 
          client.followUpStatus?.status === 'advance-paid-confirmed'
        );
      default:
        return clients;
    }
  };

  const filteredClients = getFilteredClients();

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleFollowUp = (client: Client) => {
    setSelectedClient(client);
    setShowFollowUpModal(true);
  };

  const handleViewItinerary = (client: Client) => {
    setSelectedClient(client);
    setShowItineraryModal(true);
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (confirm(`Are you sure you want to delete client "${clientName}"? This action cannot be undone.`)) {
      const updatedClients = clients.filter(c => c.id !== clientId);
      dispatch({ type: 'SET_DATA', payload: { clients: updatedClients } });
    }
  };

  const handleWhatsAppChat = (client: Client) => {
    const message = encodeURIComponent(
      `Hello ${client.name}! This is regarding your ${client.numberOfDays}-day travel package. How can I assist you today?`
    );
    const whatsappUrl = `https://wa.me/${client.countryCode.replace('+', '')}${client.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const updateClientFollowUp = (
    clientId: string, 
    status: FollowUpStatus['status'], 
    remarks: string,
    nextFollowUpDate?: string,
    nextFollowUpTime?: string
  ) => {
    const updatedClients = clients.map(client => {
      if (client.id === clientId) {
        const newFollowUpRecord: FollowUpRecord = {
          id: Date.now().toString(),
          status,
          remarks,
          updatedAt: new Date().toISOString(),
          nextFollowUpDate,
          nextFollowUpTime,
          updatedBy: authState.user?.id || 'sales'
        };

        return {
          ...client,
          followUpStatus: {
            status,
            updatedAt: new Date().toISOString(),
            remarks,
            nextFollowUpDate,
            nextFollowUpTime
          },
          followUpHistory: [
            ...(client.followUpHistory || []),
            newFollowUpRecord
          ],
          nextFollowUpDate,
          nextFollowUpTime
        };
      }
      return client;
    });

    dispatch({ type: 'SET_DATA', payload: { clients: updatedClients } });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'advance-paid-confirmed': return 'bg-green-100 text-green-800';
      case 'dead': return 'bg-red-100 text-red-800';
      case 'itinerary-sent': return 'bg-blue-100 text-blue-800';
      case 'itinerary-edited': return 'bg-purple-100 text-purple-800';
      case 'updated-itinerary-sent': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'itinerary-created': return 'Itinerary Created';
      case 'itinerary-sent': return 'Itinerary Sent';
      case '1st-follow-up': return '1st Follow Up';
      case '2nd-follow-up': return '2nd Follow Up';
      case '3rd-follow-up': return '3rd Follow Up';
      case '4th-follow-up': return '4th Follow Up';
      case 'itinerary-edited': return 'Itinerary Edited';
      case 'updated-itinerary-sent': return 'Updated Itinerary Sent';
      case 'advance-paid-confirmed': return 'Advance Paid & Confirmed';
      case 'dead': return 'Dead';
      default: return 'New Lead';
    }
  };

  const getTabCount = (tab: SalesGuestTab) => {
    switch (tab) {
      case 'prospects':
        return clients.filter(c => !['advance-paid-confirmed', 'dead'].includes(c.followUpStatus?.status || '')).length;
      case 'followups':
        return clients.filter(c => c.nextFollowUpDate === today).length;
      case 'converted':
        return clients.filter(c => c.followUpStatus?.status === 'advance-paid-confirmed').length;
      default:
        return clients.length;
    }
  };

  return (
    <Layout title="Sales Guest Management" subtitle="Manage sales leads, prospects, and client conversions">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Sales Client Management</h3>
              <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Clients ({getTabCount('all')})
                </button>
                <button
                  onClick={() => setActiveTab('prospects')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'prospects'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Active Prospects ({getTabCount('prospects')})
                </button>
                <button
                  onClick={() => setActiveTab('followups')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'followups'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today's Follow Ups ({getTabCount('followups')})
                </button>
                <button
                  onClick={() => setActiveTab('converted')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'converted'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Converted Sales ({getTabCount('converted')})
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium">
                  {activeTab === 'prospects' ? 'No active prospects' :
                   activeTab === 'followups' ? 'No follow-ups scheduled for today' :
                   activeTab === 'converted' ? 'No converted sales yet' :
                   'No clients yet'}
                </h4>
                <p className="text-slate-500 mt-1">
                  {activeTab === 'prospects' ? 'Active prospects will appear here.' :
                   activeTab === 'followups' ? 'Clients scheduled for follow-up today will appear here.' :
                   activeTab === 'converted' ? 'Successfully converted sales will appear here.' :
                   'Client leads will appear here when created through the itinerary builder.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                        Sales Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Next Follow-up
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{client.name}</p>
                            <div className="flex items-center text-slate-500 text-sm">
                              <Phone className="h-4 w-4 mr-1" />
                              {client.countryCode} {client.whatsapp}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="text-slate-900">
                              {client.numberOfDays} days • {client.numberOfPax.adults + client.numberOfPax.children} pax
                            </div>
                            <div className="text-slate-500">
                              {client.transportationMode}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.followUpStatus?.status)}`}>
                            {getStatusLabel(client.followUpStatus?.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {client.nextFollowUpDate ? (
                            <div className="text-sm">
                              <div className="text-slate-900">
                                {new Date(client.nextFollowUpDate).toLocaleDateString()}
                              </div>
                              {client.nextFollowUpTime && (
                                <div className="text-slate-500">
                                  {client.nextFollowUpTime}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">No follow-up scheduled</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
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
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Follow Up"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleViewItinerary(client)}
                              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                              title="View Latest Itinerary"
                            >
                              <FileText className="h-4 w-4" />
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
              </div>
            )}
          </div>
        </div>

        {/* Sales Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Prospects</p>
                <p className="text-2xl font-bold text-slate-900">
                  {clients.filter(c => !['advance-paid-confirmed', 'dead'].includes(c.followUpStatus?.status || '')).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Today's Follow-ups</p>
                <p className="text-2xl font-bold text-slate-900">
                  {clients.filter(c => c.nextFollowUpDate === today).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Converted Sales</p>
                <p className="text-2xl font-bold text-slate-900">
                  {clients.filter(c => c.followUpStatus?.status === 'advance-paid-confirmed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Client Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Personal Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <p className="text-slate-900">{selectedClient.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">WhatsApp</label>
                      <p className="text-slate-900">{selectedClient.countryCode} {selectedClient.whatsapp}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Travel Details</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Travel Dates</label>
                      <p className="text-slate-900">
                        {selectedClient.travelDates.isFlexible 
                          ? `Flexible (${selectedClient.travelDates.flexibleMonth})`
                          : `${new Date(selectedClient.travelDates.startDate).toLocaleDateString()} - ${new Date(selectedClient.travelDates.endDate).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Duration</label>
                      <p className="text-slate-900">{selectedClient.numberOfDays} days</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Passengers</label>
                      <p className="text-slate-900">
                        {selectedClient.numberOfPax.adults + selectedClient.numberOfPax.children} pax 
                        ({selectedClient.numberOfPax.adults} adults, {selectedClient.numberOfPax.children} children)
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Transportation</label>
                      <p className="text-slate-900">{selectedClient.transportationMode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow-up History */}
              {selectedClient.followUpHistory && selectedClient.followUpHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Sales Follow-up History</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedClient.followUpHistory.map((record) => (
                      <div key={record.id} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusLabel(record.status)}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(record.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{record.remarks}</p>
                        {record.nextFollowUpDate && (
                          <p className="text-xs text-slate-500 mt-1">
                            Next follow-up: {new Date(record.nextFollowUpDate).toLocaleDateString()} 
                            {record.nextFollowUpTime && ` at ${record.nextFollowUpTime}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <ClientEditModal
          client={selectedClient}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedClient) => {
            const updatedClients = clients.map(c => 
              c.id === updatedClient.id ? updatedClient : c
            );
            dispatch({ type: 'SET_DATA', payload: { clients: updatedClients } });
            setShowEditModal(false);
          }}
        />
      )}

      {/* Follow-up Modal */}
      {showFollowUpModal && selectedClient && (
        <FollowUpModal
          client={selectedClient}
          onClose={() => setShowFollowUpModal(false)}
          onSave={updateClientFollowUp}
        />
      )}

      {/* Itinerary View Modal */}
      {showItineraryModal && selectedClient && (
        <ItineraryViewModal
          client={selectedClient}
          onClose={() => setShowItineraryModal(false)}
        />
      )}
    </Layout>
  );
};

export default SalesGuestManagement;