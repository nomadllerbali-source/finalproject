import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, TrendingUp, Clock, Users, DollarSign, Target, Award } from 'lucide-react';
import Layout from '../Layout';

const SalesDashboard: React.FC = () => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const { clients: allClients, itineraries: allItineraries } = state;
  const [activeFilter, setActiveFilter] = useState<'all' | 'itineraries'>('all');

  // Filter data to show only current sales person's data
  const clients = allClients.filter(c => c.createdBy === authState.user?.id);
  const itineraries = allItineraries.filter(i => i.client.createdBy === authState.user?.id);

  // Sales-specific metrics
  const totalRevenue = itineraries.reduce((sum, itinerary) => sum + itinerary.finalPrice, 0);
  const averageItineraryValue = itineraries.length > 0 ? totalRevenue / itineraries.length : 0;
  const conversionRate = clients.length > 0 ? (itineraries.length / clients.length) * 100 : 0;
  const totalProfit = itineraries.reduce((sum, itinerary) => sum + itinerary.profitMargin, 0);

  const filteredData = () => {
    switch (activeFilter) {
      case 'itineraries':
        return { clients: [], itineraries };
      default:
        return { clients, itineraries };
    }
  };

  const { clients: displayClients, itineraries: displayItineraries } = filteredData();

  return (
    <Layout 
      title="Sales Dashboard" 
      subtitle="Track your sales performance and client conversions"
    >
      {/* Sales Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        <div 
          className={`bg-white rounded-xl p-6 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'itineraries' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
          }`}
          onClick={() => setActiveFilter(activeFilter === 'itineraries' ? 'all' : 'itineraries')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Converted Sales</p>
              <p className="text-2xl font-bold text-slate-900">{itineraries.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(0)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Target className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Average Deal Size</p>
              <p className="text-2xl font-bold text-slate-900">${averageItineraryValue.toFixed(0)}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Profit</p>
              <p className="text-2xl font-bold text-slate-900">${totalProfit.toFixed(0)}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Award className="h-6 w-6 text-emerald-600" />
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
            <div className="bg-indigo-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-indigo-600" />
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
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Data
          </button>
          <button
            onClick={() => setActiveFilter('itineraries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'itineraries'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Converted Sales Only ({itineraries.length})
          </button>
        </div>
      </div>

      {/* Recent Data */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            {activeFilter === 'itineraries' ? 'All Converted Sales' : 'Recent Sales Activity'}
          </h3>
          <p className="text-slate-500 text-sm">
            {activeFilter === 'itineraries' ? 'All successfully converted sales and quotes' : 'Latest sales leads and conversions'}
          </p>
        </div>
        
        {displayClients.length === 0 && displayItineraries.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-slate-900 font-medium">
              {activeFilter === 'itineraries' ? 'No converted sales yet' : 'No sales activity yet'}
            </h4>
            <p className="text-slate-500 mt-1">
              {activeFilter === 'itineraries' ? 'Converted sales will appear here.' : 'Sales leads and conversions will appear here when created through the itinerary builder.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeFilter === 'itineraries' ? 'Sale Details' : 'Lead Details'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Travel Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Pax & Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeFilter === 'itineraries' ? 'Sale Value' : 'Transportation'}
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
                          <Users className="h-4 w-4 mr-1" />
                          Sales Lead
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
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
                          <Award className="h-4 w-4 mr-1" />
                          Converted Sale
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

export default SalesDashboard;