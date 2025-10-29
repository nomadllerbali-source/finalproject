import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, Edit2, Trash2, MessageCircle, Calendar, Phone, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import Layout from '../Layout';
import { Client } from '../../types';

const SalesDashboard: React.FC = () => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const { clients: allClients } = state;

  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'followups'>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const myClients = allClients.filter(c => c.createdBy === authState.user?.id);

  const today = new Date().toISOString().split('T')[0];

  const getFilteredClients = () => {
    switch (activeTab) {
      case 'confirmed':
        return myClients.filter(c => c.followUpStatus?.status === 'advance-paid-confirmed');
      case 'followups':
        return myClients.filter(c => c.nextFollowUpDate === today);
      default:
        return myClients;
    }
  };

  const filteredClients = getFilteredClients();

  const handleView = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDelete = (client: Client) => {
    if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
      console.log('Delete client:', client.id);
    }
  };

  const handleFollowUp = (client: Client) => {
    setSelectedClient(client);
    setShowFollowUpModal(true);
  };

  const handleWhatsApp = (client: Client) => {
    const phone = client.whatsapp.replace(/\D/g, '');
    const phoneWithCountry = client.countryCode ? `${client.countryCode}${phone}` : phone;
    window.open(`https://wa.me/${phoneWithCountry}`, '_blank');
  };

  return (
    <Layout
      title="Sales Dashboard"
      subtitle="Manage your clients and track follow-ups"
    >
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Clients ({myClients.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'confirmed'
                    ? 'text-green-600 border-b-2 border-green-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Confirmed Clients ({myClients.filter(c => c.followUpStatus?.status === 'advance-paid-confirmed').length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('followups')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'followups'
                    ? 'text-amber-600 border-b-2 border-amber-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Follow-ups Today ({myClients.filter(c => c.nextFollowUpDate === today).length})
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-2">
                  {activeTab === 'all' && 'No clients yet'}
                  {activeTab === 'confirmed' && 'No confirmed clients'}
                  {activeTab === 'followups' && 'No follow-ups scheduled for today'}
                </div>
                <p className="text-slate-500 text-sm">
                  {activeTab === 'all' && 'Start by adding your first client'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Client Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Phone</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Travel Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Days</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Next Follow-up</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map(client => (
                      <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{client.whatsapp}</td>
                        <td className="py-3 px-4 text-slate-700">
                          {new Date(client.travelDates.startDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{client.numberOfDays}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.followUpStatus?.status === 'advance-paid-confirmed'
                              ? 'bg-green-100 text-green-800'
                              : client.followUpStatus?.status === 'dead'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {client.followUpStatus?.status || 'Itinerary Created'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {client.nextFollowUpDate ? new Date(client.nextFollowUpDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(client)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(client)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Edit Client"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleFollowUp(client)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Follow Up"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleWhatsApp(client)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(client)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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
      </div>

      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Client Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <p className="text-slate-900">{selectedClient.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <p className="text-slate-900">{selectedClient.whatsapp}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <p className="text-slate-900">{selectedClient.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Travel Date</label>
                <p className="text-slate-900">
                  {new Date(selectedClient.travelDates.startDate).toLocaleDateString()} - {new Date(selectedClient.travelDates.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Days</label>
                <p className="text-slate-900">{selectedClient.numberOfDays}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transportation Type</label>
                <p className="text-slate-900">{selectedClient.transportationMode}</p>
              </div>
              {selectedClient.itineraryId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Itinerary Created</label>
                  <p className="text-green-600">✓ Yes</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SalesDashboard;
