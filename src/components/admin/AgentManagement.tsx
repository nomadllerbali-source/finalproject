import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Mail, Phone, MapPin, User, Calendar, CheckCircle, XCircle, Eye, Ban, Check, Trash2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import Layout from '../Layout';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  fetchAllAgentRegistrations,
  approveAgentRegistration,
  rejectAgentRegistration,
  deleteAgentRegistration
} from '../../lib/supabaseHelpers';

interface AgentRegistration {
  id: string;
  company_name: string;
  company_logo: string | null;
  address: string;
  email: string;
  phone_no: string;
  username: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

const AgentManagement: React.FC = () => {
  const { state: authState } = useAuth();
  const [agents, setAgents] = useState<AgentRegistration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAgents();
    const interval = setInterval(() => {
      loadAgents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      if (isSupabaseConfigured()) {
        const data = await fetchAllAgentRegistrations();
        setAgents(data);
      } else {
        const savedAgents = localStorage.getItem('registeredAgents');
        if (savedAgents) {
          setAgents(JSON.parse(savedAgents));
        }
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const handleApprove = async (agentId: string) => {
    if (!authState.user?.id) return;

    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (confirm(`Approve registration for ${agent.company_name}? This will create their agent account and allow them to login.`)) {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured()) {
          await approveAgentRegistration(agentId, authState.user.id);
          setMessage({ type: 'success', text: `${agent.company_name} has been approved!` });
          setTimeout(() => setMessage(null), 3000);
          await loadAgents();
        }
      } catch (error: any) {
        console.error('Error approving agent:', error);
        setMessage({ type: 'error', text: error.message || 'Failed to approve agent' });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleReject = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (confirm(`Reject registration for ${agent.company_name}? They can register again later.`)) {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured()) {
          await rejectAgentRegistration(agentId);
          setMessage({ type: 'success', text: `${agent.company_name} registration rejected` });
          setTimeout(() => setMessage(null), 3000);
          await loadAgents();
        }
      } catch (error) {
        console.error('Error rejecting agent:', error);
        setMessage({ type: 'error', text: 'Failed to reject agent' });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (agentId: string, companyName: string) => {
    if (confirm(`Permanently delete ${companyName}? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured()) {
          await deleteAgentRegistration(agentId);
          setMessage({ type: 'success', text: `${companyName} deleted successfully` });
          setTimeout(() => setMessage(null), 3000);
          await loadAgents();
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        setMessage({ type: 'error', text: 'Failed to delete agent' });
        setTimeout(() => setMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredAgents = agents.filter(agent => agent.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Layout title="Agent Management" subtitle="Approve, reject, and manage travel agent registrations" hideHeader={true}>
      <div className="space-y-6">
        {/* Success/Error Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </span>
          </div>
        )}

        {/* Agent Registration Link */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-teal-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Agent Registration</h3>
                <p className="text-slate-600 mt-1">
                  Share this link with travel agencies to register as agents. You'll review and approve their registrations here.
                </p>
                <div className="mt-3 flex items-center space-x-2">
                  <code className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
                    {window.location.origin}/register-agent
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/register-agent`);
                      setMessage({ type: 'success', text: 'Registration link copied!' });
                      setTimeout(() => setMessage(null), 2000);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Registrations</p>
                <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
              </div>
              <div className="bg-slate-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold text-slate-900">
                  {agents.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Approved Agents</p>
                <p className="text-2xl font-bold text-slate-900">
                  {agents.filter(a => a.status === 'approved').length}
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
                <p className="text-slate-500 text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-slate-900">
                  {agents.filter(a => a.status === 'rejected').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Agent List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          {/* Tabs */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-white text-yellow-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending ({agents.filter(a => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'approved'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Approved ({agents.filter(a => a.status === 'approved').length})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'rejected'
                    ? 'bg-white text-red-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejected ({agents.filter(a => a.status === 'rejected').length})
              </button>
            </div>
          </div>

          {/* Agent Cards */}
          <div className="p-6">
            {filteredAgents.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h4 className="text-slate-900 font-medium">No {activeTab} agents</h4>
                <p className="text-slate-500 text-sm mt-1">
                  {activeTab === 'pending'
                    ? 'New agent registrations will appear here for your approval.'
                    : `No agents with ${activeTab} status.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="p-5 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-teal-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{agent.company_name}</h4>
                          <p className="text-sm text-slate-600">{agent.username}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        <span className="capitalize">{agent.status}</span>
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {agent.email}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {agent.phone_no}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {agent.address}
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Applied: {new Date(agent.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                      {agent.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(agent.id)}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            <Check className="h-4 w-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(agent.id)}
                            disabled={isLoading}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition-colors"
                          >
                            <XCircle className="h-4 w-4 inline mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {agent.status === 'approved' && agent.approved_at && (
                        <div className="text-sm text-slate-600">
                          Approved on {new Date(agent.approved_at).toLocaleDateString()}
                        </div>
                      )}
                      <button
                        onClick={() => handleDelete(agent.id, agent.company_name)}
                        disabled={isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

export default AgentManagement;
