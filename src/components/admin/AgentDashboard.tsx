import React from 'react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, TrendingUp, Clock, Building2, Edit2, Save, X, Upload } from 'lucide-react';
import Layout from '../Layout';

const AgentDashboard: React.FC = () => {
  const { state } = useData();
  const { state: authState, updateAgentProfile } = useAuth();
  const { clients, itineraries } = state;
  const [activeFilter, setActiveFilter] = useState<'all' | 'itineraries'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    companyName: authState.user?.companyName || '',
    companyLogo: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter out clients without contact details (agent-created)
  const agentClients = clients.filter(client => !client.whatsapp);
  const totalRevenue = itineraries.reduce((sum, itinerary) => sum + itinerary.finalPrice, 0);
  const averageItineraryValue = itineraries.length > 0 ? totalRevenue / itineraries.length : 0;

  const filteredData = () => {
    switch (activeFilter) {
      case 'itineraries':
        return { clients: [], itineraries };
      default:
        return { clients: agentClients, itineraries };
    }
  };

  const { clients: displayClients, itineraries: displayItineraries } = filteredData();

  const handleProfileUpdate = async () => {
    if (!authState.user?.id) return;
    
    setIsUpdating(true);
    setMessage(null);
    
    try {
      const result = await updateAgentProfile(authState.user.id, {
        companyName: profileForm.companyName,
        companyLogo: profileForm.companyLogo
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setIsEditingProfile(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileForm({ ...profileForm, companyLogo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Layout 
      title="Agent Dashboard" 
      subtitle="View your travel packages and client itineraries"
    >
      {/* Company Profile Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Company Profile</h3>
                <p className="text-slate-500 text-sm">Manage your company information</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setProfileForm({
                  companyName: authState.user?.companyName || '',
                  companyLogo: ''
                });
              }}
              className="inline-flex items-center px-4 py-2 text-teal-600 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {isEditingProfile ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </label>
                    {profileForm.companyLogo && (
                      <img
                        src={profileForm.companyLogo}
                        alt="Company Logo"
                        className="h-12 w-12 object-cover rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2 inline" />
                  Cancel
                </button>
                <button
                  onClick={handleProfileUpdate}
                  disabled={isUpdating || !profileForm.companyName}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {authState.user?.company_logo ? (
                  <img
                    src={authState.user.company_logo}
                    alt="Company Logo"
                    className="h-16 w-16 object-cover rounded-lg border-2 border-teal-200"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-4 rounded-lg">
                    <Building2 className="h-8 w-8 text-teal-700" />
                  </div>
                )}
                <div>
                  <h4 className="text-2xl font-bold text-slate-900">
                    {authState.user?.company_name || authState.user?.companyName || 'Your Company Name'}
                  </h4>
                  <p className="text-slate-600 font-medium">Travel Agency</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Contact Person</p>
                  <p className="text-sm text-slate-900 font-medium">{authState.user?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Email</p>
                  <p className="text-sm text-slate-900">{authState.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Phone</p>
                  <p className="text-sm text-slate-900">{authState.user?.phone_number || 'Not provided'}</p>
                </div>
              </div>

              {authState.user?.address && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Address</p>
                  <p className="text-sm text-slate-900">{authState.user.address}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 cursor-pointer transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Trips</p>
              <p className="text-2xl font-bold text-slate-900">{agentClients.length}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'itineraries' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter(activeFilter === 'itineraries' ? 'all' : 'itineraries')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Completed Itineraries</p>
              <p className="text-2xl font-bold text-slate-900">{itineraries.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 cursor-pointer transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">Rp {totalRevenue.toLocaleString('id-ID', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 cursor-pointer transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Avg. Package Value</p>
              <p className="text-2xl font-bold text-slate-900">Rp {averageItineraryValue.toLocaleString('id-ID', {maximumFractionDigits: 0})}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Data
          </button>
          <button
            onClick={() => setActiveFilter('itineraries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'itineraries'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Completed Itineraries ({itineraries.length})
          </button>
        </div>
      </div>

      {/* Recent Data */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {activeFilter === 'itineraries' ? 'All Completed Itineraries' : 'Recent Travel Packages'}
          </h3>
          <p className="text-slate-500 text-sm">
            {activeFilter === 'itineraries' ? 'All generated itineraries and quotes' : 'Latest travel packages created'}
          </p>
        </div>
        
        {displayClients.length === 0 && displayItineraries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-slate-900 font-medium">
              {activeFilter === 'itineraries' ? 'No completed itineraries yet' : 'No travel packages yet'}
            </h4>
            <p className="text-slate-500 mt-1">
              {activeFilter === 'itineraries' ? 'Completed itineraries will appear here.' : 'Travel packages will appear here when created through the itinerary builder.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeFilter === 'itineraries' ? 'Package Details' : 'Trip Details'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Travel Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pax & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeFilter === 'itineraries' ? 'Total Cost' : 'Transportation'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{client.name}</p>
                        <div className="text-slate-500 text-sm">
                          Trip Package
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {client.travelDates.isFlexible ? (
                          <span className="text-slate-600">Flexible ({client.travelDates.flexibleMonth})</span>
                        ) : (
                          <div>
                            <div className="text-slate-900">
                              {new Date(client.travelDates.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-slate-500">
                              to {new Date(client.travelDates.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-slate-900">
                          {client.numberOfPax.adults + client.numberOfPax.children} pax
                        </div>
                        <div className="text-slate-500">
                          {client.numberOfDays} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {client.transportationMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(client.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {displayItineraries.map((itinerary, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{itinerary.client.name}</p>
                        <div className="text-slate-500 text-sm">
                          Completed Package
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        {itinerary.client.travelDates.isFlexible ? (
                          <span className="text-slate-600">Flexible ({itinerary.client.travelDates.flexibleMonth})</span>
                        ) : (
                          <div>
                            <div className="text-slate-900">
                              {new Date(itinerary.client.travelDates.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-slate-500">
                              to {new Date(itinerary.client.travelDates.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-slate-900">
                          {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax
                        </div>
                        <div className="text-slate-500">
                          {itinerary.client.numberOfDays} days
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-green-600">Rp {itinerary.finalPrice.toLocaleString('id-ID')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(itinerary.client.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AgentDashboard;