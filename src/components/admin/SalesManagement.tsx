import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Client, UserProfile } from '../../types';
import {
  SalesPerson,
  fetchAllSalesPersons,
  insertSalesPerson,
  updateSalesPerson,
  deleteSalesPerson,
  hashPassword
} from '../../lib/supabaseHelpers';
import { isSupabaseConfigured } from '../../lib/supabase';
import { 
  TrendingUp, Plus, Users, Eye, Ban, Check, Trash2, Calendar, 
  Phone, MapPin, Clock, AlertCircle, CheckCircle, UserX, 
  Filter, FileText, X, Save, Mail, Lock, User, Building2
} from 'lucide-react';
import Layout from '../Layout';
import ItineraryViewModal from './ItineraryViewModal';

interface SalesProfile {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  todayLeads: number;
  todayFollowups: number;
  confirmedLeads: number;
  totalLeads: number;
}

const SalesManagement: React.FC = () => {
  const { state: authState, signUp } = useAuth();
  const { state: dataState, updateClientData } = useData();
  const { clients } = dataState;
  
  const [salesTeam, setSalesTeam] = useState<SalesProfile[]>([]);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'clients' | 'followups' | 'confirmed'>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [newSalesForm, setNewSalesForm] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: ''
  });

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  // Load sales team data
  useEffect(() => {
    const loadSalesTeam = async () => {
      try {
        let team: SalesPerson[] = [];

        if (isSupabaseConfigured()) {
          console.log('Fetching sales persons from Supabase...');
          team = await fetchAllSalesPersons();
          console.log('Loaded sales persons from Supabase:', team);

          if (!team || team.length === 0) {
            console.log('No sales persons found in database');
          }
        } else {
          const savedSalesTeam = localStorage.getItem('salesTeam');
          if (savedSalesTeam) {
            team = JSON.parse(savedSalesTeam);
          }
        }

        const teamWithMetrics = team.map((person: SalesPerson) => {
          const personClients = clients.filter(c => c.createdBy === person.id);
          const todayClients = personClients.filter(c =>
            new Date(c.createdAt).toISOString().split('T')[0] === today
          );
          const todayFollowups = personClients.filter(c =>
            c.nextFollowUpDate === today
          );
          const confirmedClients = personClients.filter(c =>
            c.followUpStatus?.status === 'advance-paid-confirmed'
          );

          return {
            ...person,
            todayLeads: todayClients.length,
            todayFollowups: todayFollowups.length,
            confirmedLeads: confirmedClients.length,
            totalLeads: personClients.length
          };
        });
        console.log('Sales team with metrics:', teamWithMetrics);
        setSalesTeam(teamWithMetrics);
      } catch (error: any) {
        console.error('Error loading sales team:', error);
        console.error('Error details:', error.message, error.hint);
        setMessage({
          type: 'error',
          text: `Failed to load sales team: ${error.message || 'Unknown error'}`
        });
      }
    };

    loadSalesTeam();

    const interval = setInterval(() => {
      loadSalesTeam();
    }, 5000);

    return () => clearInterval(interval);
  }, [clients, today]);

  const handleViewItinerary = (client: Client) => {
    setSelectedClient(client);
    setShowItineraryModal(true);
  };

  const handleCreateSalesperson = async () => {
    if (!newSalesForm.fullName || !newSalesForm.email || !newSalesForm.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    if (!authState.user) {
      setMessage({ type: 'error', text: 'You must be logged in to create a sales person' });
      return;
    }

    setIsCreating(true);
    setMessage(null);

    try {
      if (isSupabaseConfigured()) {
        const passwordHash = await hashPassword(newSalesForm.password);

        const newSalesPerson = await insertSalesPerson({
          email: newSalesForm.email,
          full_name: newSalesForm.fullName,
          password_hash: passwordHash,
          company_name: newSalesForm.companyName || null,
          is_active: true,
          created_by: authState.user.id,
          raw_password: newSalesForm.password // Pass raw password to create auth user
        });

        if (newSalesPerson) {
          setSalesTeam([...salesTeam, {
            ...newSalesPerson,
            todayLeads: 0,
            todayFollowups: 0,
            confirmedLeads: 0,
            totalLeads: 0
          }]);
        }
      } else {
        const newSalesperson: SalesProfile = {
          id: `sales-${Date.now()}`,
          email: newSalesForm.email,
          full_name: newSalesForm.fullName,
          company_name: newSalesForm.companyName || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: authState.user.id,
          todayLeads: 0,
          todayFollowups: 0,
          confirmedLeads: 0,
          totalLeads: 0
        };

        const updatedTeam = [...salesTeam, newSalesperson];
        setSalesTeam(updatedTeam);
        localStorage.setItem('salesTeam', JSON.stringify(updatedTeam));

        const savedCredentials = localStorage.getItem('salesCredentials') || '[]';
        const credentials = JSON.parse(savedCredentials);
        credentials.push({
          email: newSalesForm.email,
          password: newSalesForm.password,
          profile: newSalesperson
        });
        localStorage.setItem('salesCredentials', JSON.stringify(credentials));
      }

      setMessage({
        type: 'success',
        text: `Sales person created successfully!\n\nLogin Credentials:\nEmail: ${newSalesForm.email}\nPassword: ${newSalesForm.password}\n\nThey can now login to the sales portal.`
      });
      setNewSalesForm({ fullName: '', email: '', password: '', companyName: '' });
      setShowCreateForm(false);

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create sales person. Please try again.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSuspendSalesperson = async (salespersonId: string) => {
    const person = salesTeam.find(p => p.id === salespersonId);
    if (!person) return;

    // If suspending (currently active), automatically redistribute clients
    if (person.is_active) {
      const personClients = clients.filter(c => c.createdBy === salespersonId);

      if (personClients.length > 0) {
        const activeSalesPersons = salesTeam.filter(p => p.id !== salespersonId && p.is_active);

        if (activeSalesPersons.length === 0) {
          alert('Cannot suspend this sales person. No other active sales persons available to receive clients.');
          return;
        }

        if (!confirm(`Are you sure you want to suspend ${person.full_name}? Their ${personClients.length} client(s) will be automatically redistributed to other active sales persons.`)) {
          return;
        }

        try {
          // Redistribute clients randomly to active sales persons
          for (const client of personClients) {
            const randomSalesPerson = activeSalesPersons[Math.floor(Math.random() * activeSalesPersons.length)];
            await updateClientData({
              ...client,
              createdBy: randomSalesPerson.id
            });
          }

          // Now suspend the sales person
          if (isSupabaseConfigured()) {
            await updateSalesPerson({
              id: salespersonId,
              is_active: false
            });
          }

          const updatedTeam = salesTeam.map(p =>
            p.id === salespersonId ? { ...p, is_active: false } : p
          );
          setSalesTeam(updatedTeam);

          if (!isSupabaseConfigured()) {
            localStorage.setItem('salesTeam', JSON.stringify(updatedTeam));
          }

          setMessage({
            type: 'success',
            text: `${person.full_name} suspended and ${personClients.length} client(s) redistributed successfully`
          });
          setTimeout(() => setMessage(null), 3000);
        } catch (error) {
          console.error('Error suspending sales person:', error);
          setMessage({ type: 'error', text: 'Failed to suspend sales person' });
          setTimeout(() => setMessage(null), 3000);
        }
        return;
      }
    }

    // No clients or activating - proceed directly
    if (confirm(`Are you sure you want to ${person.is_active ? 'suspend' : 'activate'} ${person.full_name}?`)) {
      try {
        if (isSupabaseConfigured()) {
          await updateSalesPerson({
            id: salespersonId,
            is_active: !person.is_active
          });
        }

        const updatedTeam = salesTeam.map(p =>
          p.id === salespersonId ? { ...p, is_active: !p.is_active } : p
        );
        setSalesTeam(updatedTeam);

        if (!isSupabaseConfigured()) {
          localStorage.setItem('salesTeam', JSON.stringify(updatedTeam));
        }

        setMessage({ type: 'success', text: `Sales person ${person.is_active ? 'suspended' : 'activated'} successfully` });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error('Error updating sales person:', error);
        setMessage({ type: 'error', text: 'Failed to update sales person status' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };


  const handleDeleteSalesperson = async (salespersonId: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete sales person "${name}"? This action cannot be undone.`)) {
      try {
        if (isSupabaseConfigured()) {
          await deleteSalesPerson(salespersonId);
        }

        const updatedTeam = salesTeam.filter(p => p.id !== salespersonId);
        setSalesTeam(updatedTeam);

        if (!isSupabaseConfigured()) {
          localStorage.setItem('salesTeam', JSON.stringify(updatedTeam));

          const savedCredentials = localStorage.getItem('salesCredentials') || '[]';
          const credentials = JSON.parse(savedCredentials);
          const updatedCredentials = credentials.filter((c: any) => c.profile.id !== salespersonId);
          localStorage.setItem('salesCredentials', JSON.stringify(updatedCredentials));
        }
      } catch (error) {
        console.error('Error deleting sales person:', error);
        alert('Failed to delete sales person');
      }
    }
  };

  const getClientsForSalesperson = (salespersonId: string) => {
    return clients.filter(c => c.createdBy === salespersonId);
  };

  const getTodayFollowupsForSalesperson = (salespersonId: string) => {
    return clients.filter(c => 
      c.createdBy === salespersonId && c.nextFollowUpDate === today
    );
  };

  const getConfirmedClientsForSalesperson = (salespersonId: string) => {
    return clients.filter(c => 
      c.createdBy === salespersonId && c.followUpStatus?.status === 'advance-paid-confirmed'
    );
  };

  const getTodayPerformanceForSalesperson = (salespersonId: string) => {
    const personClients = clients.filter(c => c.createdBy === salespersonId);
    
    // New leads added today
    const newLeadsToday = personClients.filter(c => 
      new Date(c.createdAt).toISOString().split('T')[0] === today
    );
    
    // Follow-ups updated today
    const followupsToday = personClients.filter(c => 
      c.followUpHistory?.some(h => 
        new Date(h.updatedAt).toISOString().split('T')[0] === today
      )
    );

    return {
      newLeads: newLeadsToday,
      updatedFollowups: followupsToday,
      totalActivity: newLeadsToday.length + followupsToday.length
    };
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'advance-paid-confirmed': return 'bg-green-100 text-green-800';
      case 'dead': return 'bg-red-100 text-red-800';
      case 'itinerary-sent': return 'bg-blue-100 text-blue-800';
      case 'itinerary-edited': return 'bg-purple-100 text-purple-800';
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

  const renderTabContent = () => {
    if (!selectedSalesperson) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h4 className="text-slate-900 font-medium">Select a Sales Person</h4>
          <p className="text-slate-500 mt-1">Choose a sales person from the list to view their details and performance.</p>
        </div>
      );
    }

    const salesperson = salesTeam.find(p => p.id === selectedSalesperson);
    if (!salesperson) return null;

    const personClients = getClientsForSalesperson(selectedSalesperson);
    const todayFollowups = getTodayFollowupsForSalesperson(selectedSalesperson);
    const confirmedClients = getConfirmedClientsForSalesperson(selectedSalesperson);
    const todayPerformance = getTodayPerformanceForSalesperson(selectedSalesperson);

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Sales Person Overview</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-slate-900 mb-3">Personal Information</h5>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-slate-700">Name:</span>
                      <p className="text-slate-900">{salesperson.full_name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Email:</span>
                      <p className="text-slate-900">{salesperson.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Company:</span>
                      <p className="text-slate-900">{salesperson.company_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-700">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        salesperson.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {salesperson.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-900 mb-3">Performance Metrics</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{salesperson.totalLeads}</div>
                      <div className="text-sm text-slate-600">Total Leads</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{salesperson.confirmedLeads}</div>
                      <div className="text-sm text-slate-600">Confirmed</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{salesperson.todayFollowups}</div>
                      <div className="text-sm text-slate-600">Today's Follow-ups</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {salesperson.totalLeads > 0 ? ((salesperson.confirmedLeads / salesperson.totalLeads) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-sm text-slate-600">Conversion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">Today's Performance - {salesperson.full_name}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{todayPerformance.newLeads.length}</div>
                  <div className="text-sm text-slate-600">New Leads Today</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{todayPerformance.updatedFollowups.length}</div>
                  <div className="text-sm text-slate-600">Follow-ups Updated</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">{todayPerformance.totalActivity}</div>
                  <div className="text-sm text-slate-600">Total Activity</div>
                </div>
              </div>
            </div>

            {/* Today's New Leads */}
            {todayPerformance.newLeads.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h5 className="font-semibold text-slate-900">New Leads Added Today</h5>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {todayPerformance.newLeads.map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-600">
                            {client.numberOfDays} days • {client.numberOfPax.adults + client.numberOfPax.children} pax
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(client.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Today's Follow-up Updates */}
            {todayPerformance.updatedFollowups.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h5 className="font-semibold text-slate-900">Follow-ups Updated Today</h5>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {todayPerformance.updatedFollowups.map(client => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div>
                          <div className="font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-600">
                            Latest: {getStatusLabel(client.followUpStatus?.status)}
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.followUpStatus?.status)}`}>
                          {getStatusLabel(client.followUpStatus?.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'clients':
        return (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h5 className="font-semibold text-slate-900">All Clients - {salesperson.full_name}</h5>
              <p className="text-slate-500 text-sm">Complete client list with latest itinerary and follow-up status</p>
            </div>
            {personClients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium">No clients yet</h4>
                <p className="text-slate-500 mt-1">This sales person hasn't created any client leads yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Travel Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Follow-up Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Latest Itinerary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {personClients.map(client => (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{client.name}</p>
                            <p className="text-sm text-slate-500">
                              Created: {new Date(client.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center text-slate-600">
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
                            <div className="text-slate-500">{client.transportationMode}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.followUpStatus?.status)}`}>
                            {getStatusLabel(client.followUpStatus?.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleViewItinerary(client)}
                            className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Itinerary
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'followups':
        return (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h5 className="font-semibold text-slate-900">Today's Follow-ups - {salesperson.full_name}</h5>
              <p className="text-slate-500 text-sm">Clients scheduled for follow-up today</p>
            </div>
            {todayFollowups.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium">No follow-ups scheduled for today</h4>
                <p className="text-slate-500 mt-1">This sales person has no follow-ups scheduled for today.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {todayFollowups.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <div className="font-medium text-slate-900">{client.name}</div>
                        <div className="text-sm text-slate-600">
                          {client.numberOfDays} days • {client.numberOfPax.adults + client.numberOfPax.children} pax
                        </div>
                        <div className="text-sm text-slate-500">
                          Follow-up time: {client.nextFollowUpTime || 'Not specified'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.followUpStatus?.status)}`}>
                          {getStatusLabel(client.followUpStatus?.status)}
                        </span>
                        <div className="text-sm text-slate-500 mt-1">
                          {client.countryCode} {client.whatsapp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'confirmed':
        return (
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h5 className="font-semibold text-slate-900">Confirmed Leads - {salesperson.full_name}</h5>
              <p className="text-slate-500 text-sm">Successfully converted clients with confirmed bookings</p>
            </div>
            {confirmedClients.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium">No confirmed leads yet</h4>
                <p className="text-slate-500 mt-1">Confirmed bookings will appear here when clients pay advance.</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-3">
                  {confirmedClients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <div className="font-medium text-slate-900">{client.name}</div>
                        <div className="text-sm text-slate-600">
                          {client.numberOfDays} days • {client.numberOfPax.adults + client.numberOfPax.children} pax
                        </div>
                        <div className="text-sm text-slate-500">
                          Confirmed: {client.followUpStatus?.updatedAt ? new Date(client.followUpStatus.updatedAt).toLocaleDateString() : 'Unknown'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmed
                        </span>
                        <div className="text-sm text-slate-500 mt-1">
                          {client.countryCode} {client.whatsapp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Sales Management" subtitle="Manage sales team, performance, and client relationships" hideHeader={true}>
      <div className="space-y-6">
        {/* Create Sales Person */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Sales Team Management</h3>
                <p className="text-slate-500 text-sm">Create and manage sales team members</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Sales Person
              </button>
            </div>
          </div>

          {showCreateForm && (
            <div className="p-6 border-b border-slate-200 bg-purple-50">
              {message && (
                <div className={`mb-4 p-4 rounded-lg flex items-center space-x-3 ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${
                    message.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message.text}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={newSalesForm.fullName}
                      onChange={(e) => setNewSalesForm({ ...newSalesForm, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="email"
                      value={newSalesForm.email}
                      onChange={(e) => setNewSalesForm({ ...newSalesForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="password"
                      value={newSalesForm.password}
                      onChange={(e) => setNewSalesForm({ ...newSalesForm, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Create password"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      value={newSalesForm.companyName}
                      onChange={(e) => setNewSalesForm({ ...newSalesForm, companyName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter company name (optional)"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSalesperson}
                  disabled={isCreating}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isCreating ? 'Creating...' : 'Create Sales Person'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sales Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Sales Team</p>
                <p className="text-2xl font-bold text-slate-900">{salesTeam.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Sales People</p>
                <p className="text-2xl font-bold text-slate-900">
                  {salesTeam.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Leads</p>
                <p className="text-2xl font-bold text-slate-900">
                  {salesTeam.reduce((sum, p) => sum + p.totalLeads, 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Confirmed Sales</p>
                <p className="text-2xl font-bold text-slate-900">
                  {salesTeam.reduce((sum, p) => sum + p.confirmedLeads, 0)}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Team List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Team Members */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Sales Team</h3>
              <p className="text-slate-500 text-sm">Select a sales person to view details</p>
            </div>

            {salesTeam.length === 0 ? (
              <div className="p-8 text-center">
                <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h4 className="text-slate-900 font-medium">No sales team members yet</h4>
                <p className="text-slate-500 text-sm mt-1">Create your first sales person to get started.</p>
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-2">
                  {salesTeam.map(person => (
                    <div
                      key={person.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedSalesperson === person.id
                          ? 'border-purple-300 bg-purple-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedSalesperson(person.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{person.full_name}</div>
                          <div className="text-sm text-slate-500">{person.email}</div>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-slate-600">
                              {person.totalLeads} leads
                            </span>
                            <span className="text-xs text-slate-600">
                              {person.confirmedLeads} confirmed
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            person.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {person.is_active ? 'Active' : 'Suspended'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSuspendSalesperson(person.id);
                              }}
                              className={`p-1 rounded transition-colors ${
                                person.is_active
                                  ? 'text-red-600 hover:bg-red-100'
                                  : 'text-green-600 hover:bg-green-100'
                              }`}
                              title={person.is_active ? 'Suspend' : 'Activate'}
                            >
                              {person.is_active ? <Ban className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSalesperson(person.id, person.full_name || 'Unknown');
                              }}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sales Person Details */}
          <div className="lg:col-span-2">
            {selectedSalesperson && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {salesTeam.find(p => p.id === selectedSalesperson)?.full_name} - Details
                    </h3>
                    <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'overview'
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setActiveTab('performance')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'performance'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Today's Performance
                      </button>
                      <button
                        onClick={() => setActiveTab('clients')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'clients'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Clients
                      </button>
                      <button
                        onClick={() => setActiveTab('followups')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'followups'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Today's Follow-ups
                      </button>
                      <button
                        onClick={() => setActiveTab('confirmed')}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'confirmed'
                            ? 'bg-white text-green-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Confirmed Leads
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {renderTabContent()}
                </div>
              </div>
            )}

            {!selectedSalesperson && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium">Select a Sales Person</h4>
                <p className="text-slate-500 mt-1">Choose a sales team member from the list to view their performance and client details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

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

export default SalesManagement;