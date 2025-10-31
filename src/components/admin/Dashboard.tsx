import React from 'react';
import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Calendar, Phone, Users, MapPin, TrendingUp, Clock, UserCheck, Car, Building2, Camera, Ticket, Utensils, FileText } from 'lucide-react';
import Layout from '../Layout';
import SupabaseConnectionButton from './SupabaseConnectionButton';

interface DashboardProps {
  onNavigateToSection: (section: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToSection }) => {
  const { state, dispatch } = useData();
  const { clients, itineraries } = state;
  const [activeFilter, setActiveFilter] = useState<'all' | 'clients' | 'itineraries'>('all');
  
  // Force refresh data from localStorage on component mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.clients || parsedData.itineraries) {
          dispatch({ type: 'SET_DATA', payload: parsedData });
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    }
    
    // Set up interval to refresh data every 3 seconds for real-time updates
    const interval = setInterval(() => {
      const savedData = localStorage.getItem('appData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.clients || parsedData.itineraries) {
            dispatch({ type: 'SET_DATA', payload: parsedData });
          }
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Show all real clients (admin, agent, and sales created)
  const adminClients = clients;
  const adminItineraries = itineraries;

  const totalRevenue = adminItineraries.reduce((sum, itinerary) => sum + itinerary.finalPrice, 0);
  const averageItineraryValue = adminItineraries.length > 0 ? totalRevenue / adminItineraries.length : 0;

  const filteredData = () => {
    switch (activeFilter) {
      case 'clients':
        return { clients: adminClients, itineraries: [] };
      case 'itineraries':
        return { clients: [], itineraries: adminItineraries };
      default:
        return { clients: adminClients, itineraries: adminItineraries };
    }
  };

  const { clients: displayClients, itineraries: displayItineraries } = filteredData();

  return (
    <Layout 
      title="Admin Dashboard" 
      subtitle="Manage your travel agency operations and view client leads"
    >
      <SupabaseConnectionButton />

      {/* Admin Panel */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Admin Panel</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => onNavigateToSection('guests')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Guest Management
            </button>
            <button
              onClick={() => onNavigateToSection('fixedItineraries')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <FileText className="h-4 w-4 mr-2" />
              Fixed Itineraries
            </button>
            <button
              onClick={() => onNavigateToSection('transportation')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
            >
              <Car className="h-4 w-4 mr-2" />
              Transportation
            </button>
            <button
              onClick={() => onNavigateToSection('hotels')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-lg hover:from-purple-700 hover:to-violet-700 transition-all duration-200 transform hover:scale-105"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Hotels
            </button>
            <button
              onClick={() => onNavigateToSection('sightseeing')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Sightseeing
            </button>
            <button
              onClick={() => onNavigateToSection('activities')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <Camera className="h-4 w-4 mr-2" />
              Activities
            </button>
            <button
              onClick={() => onNavigateToSection('meals')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
            >
              <Utensils className="h-4 w-4 mr-2" />
              Meals
            </button>
            <button
              onClick={() => onNavigateToSection('tickets')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Entry Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div 
          className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'clients' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter(activeFilter === 'clients' ? 'all' : 'clients')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{adminClients.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div 
          className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'itineraries' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter(activeFilter === 'itineraries' ? 'all' : 'itineraries')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Active Itineraries</p>
              <p className="text-2xl font-bold text-slate-900">{adminItineraries.length}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-teal-600" />
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
              <p className="text-slate-500 text-sm font-medium">Avg. Quote Value</p>
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
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Data
          </button>
          <button
            onClick={() => setActiveFilter('clients')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'clients'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Clients Only ({adminClients.length})
          </button>
          <button
            onClick={() => setActiveFilter('itineraries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'itineraries'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Itineraries Only ({adminItineraries.length})
          </button>
        </div>
      </div>
      {/* Recent Clients */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {activeFilter === 'clients' ? 'All Clients' : 
             activeFilter === 'itineraries' ? 'All Itineraries' : 
             'Recent Client Leads'}
          </h3>
          <p className="text-slate-500 text-sm">
            {activeFilter === 'clients' ? 'Complete list of all client inquiries' :
             activeFilter === 'itineraries' ? 'All generated itineraries and quotes' :
             'Latest inquiries from the itinerary builder'}
          </p>
        </div>
        
        {displayClients.length === 0 && displayItineraries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-slate-900 font-medium">
              {activeFilter === 'clients' ? 'No clients yet' :
               activeFilter === 'itineraries' ? 'No itineraries yet' :
               'No data yet'}
            </h4>
            <p className="text-slate-500 mt-1">
              {activeFilter === 'clients' ? 'Client leads will appear here when created through the itinerary builder.' :
               activeFilter === 'itineraries' ? 'Completed itineraries will appear here.' :
               'Data will appear here when created through the itinerary builder.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeFilter === 'itineraries' ? 'Itinerary Details' : 'Client Details'}
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
                        <div className="flex items-center text-slate-500 text-sm">
                          <Phone className="h-4 w-4 mr-1" />
                          {client.countryCode} {client.whatsapp}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                        <div className="flex items-center text-slate-500 text-sm">
                          <Phone className="h-4 w-4 mr-1" />
                          {itinerary.client.countryCode} {itinerary.client.whatsapp}
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

export default Dashboard;