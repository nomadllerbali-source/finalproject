import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Mail, Phone, MapPin, User, Calendar, CheckCircle, XCircle, Eye, Ban, Check, Trash2 } from 'lucide-react';
import Layout from '../Layout';

const AgentManagement: React.FC = () => {
  const { state, dispatch } = useAuth();
  const { registeredAgents } = state;
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Force refresh of agents when component mounts and periodically
  React.useEffect(() => {
    const savedAgents = localStorage.getItem('registeredAgents');
    if (savedAgents) {
      try {
        const agents = JSON.parse(savedAgents);
        // Always update to ensure we have the latest data
        dispatch({ type: 'SET_REGISTERED_AGENTS', payload: agents });
      } catch (error) {
        console.error('Error loading agents:', error);
      }
    }
  }, [dispatch]);

  // Also refresh when the component becomes visible (for tab switching)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const savedAgents = localStorage.getItem('registeredAgents');
        if (savedAgents) {
          try {
            const agents = JSON.parse(savedAgents);
            dispatch({ type: 'SET_REGISTERED_AGENTS', payload: agents });
          } catch (error) {
            console.error('Error loading agents:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [dispatch]);

  const handleStatusUpdate = (agentId: string, status: 'active' | 'suspended') => {
    dispatch({ type: 'UPDATE_AGENT_STATUS', payload: { id: agentId, status } });
  };

  const handleDeleteAgent = (agentId: string, agentName: string) => {
    if (confirm(`Are you sure you want to permanently delete agent "${agentName}"? This action cannot be undone.`)) {
      dispatch({ type: 'DELETE_AGENT', payload: agentId });
      // Also update localStorage immediately
      const updatedAgents = registeredAgents.filter(agent => agent.id !== agentId);
      localStorage.setItem('registeredAgents', JSON.stringify(updatedAgents));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Layout title="Agent Management" subtitle="Manage registered travel agents and their accounts" hideHeader={true}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Agents</p>
                <p className="text-2xl font-bold text-slate-900">{registeredAgents.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Active Agents</p>
                <p className="text-2xl font-bold text-slate-900">
                  {registeredAgents.filter(agent => agent.status === 'active').length}
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
                <p className="text-slate-500 text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold text-slate-900">
                  {registeredAgents.filter(agent => agent.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Suspended</p>
                <p className="text-2xl font-bold text-slate-900">
                  {registeredAgents.filter(agent => agent.status === 'suspended').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Agents List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">All Registered Agents</h3>
            <p className="text-slate-500 text-sm">Manage agent accounts and permissions</p>
          </div>

          {registeredAgents.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">No agents registered yet</h4>
              <p className="text-slate-500 mt-1">Agent registrations will appear here when submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Agent Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {registeredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-teal-100 p-2 rounded-lg">
                            <Building2 className="h-5 w-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{agent.companyName}</div>
                            <div className="text-sm text-slate-500">@{agent.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {agent.email}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {agent.phoneNo}
                          </div>
                          <div className="flex items-start text-sm text-slate-600">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{agent.address}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          <span className="ml-1 capitalize">{agent.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {agent.status === 'pending' && (
                            <button
                              onClick={() => handleStatusUpdate(agent.id, 'active')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Approve Agent"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          {agent.status === 'active' && (
                            <button
                              onClick={() => handleStatusUpdate(agent.id, 'suspended')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Suspend Agent"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                          
                          {agent.status === 'suspended' && (
                            <button
                              onClick={() => handleStatusUpdate(agent.id, 'active')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Reactivate Agent"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteAgent(agent.id, agent.companyName)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Agent"
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

        {/* Agent Details Modal */}
        {selectedAgent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Agent Details</h3>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {(() => {
                const agent = registeredAgents.find(a => a.id === selectedAgent);
                if (!agent) return null;
                
                return (
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Company Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Company Name</label>
                            <p className="text-slate-900">{agent.companyName}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Address</label>
                            <p className="text-slate-900">{agent.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Contact Details</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Email</label>
                            <p className="text-slate-900">{agent.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Phone</label>
                            <p className="text-slate-900">{agent.phoneNo}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Account Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Username</label>
                            <p className="text-slate-900">@{agent.username}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Registration Date</label>
                            <p className="text-slate-900">{new Date(agent.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Account Status</h4>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {getStatusIcon(agent.status)}
                            <span className="ml-1 capitalize">{agent.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentManagement;