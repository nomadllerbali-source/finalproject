import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, FileText, Calendar, DollarSign, Clock, Copy } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { SalesClient, ItineraryVersion, getItineraryVersionsByClient } from '../../lib/salesHelpers';
import { Client, Itinerary } from '../../types';
import SalesFinalSummary from '../itinerary/SalesFinalSummary';
import Layout from '../Layout';

interface ViewItineraryProps {
  client: SalesClient;
  onBack: () => void;
}

const ViewItinerary: React.FC<ViewItineraryProps> = ({ client: salesClient, onBack }) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals } = state;
  const [versions, setVersions] = useState<ItineraryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<number | null>(null);

  useEffect(() => {
    loadVersions();
  }, [salesClient.id]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const versionData = await getItineraryVersionsByClient(salesClient.id);
      setVersions(versionData);
      if (versionData.length > 0) {
        setExpandedVersion(versionData[0].version_number);
      }
    } catch (error) {
      console.error('Error loading itinerary versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVersion = (versionNumber: number) => {
    setExpandedVersion(expandedVersion === versionNumber ? null : versionNumber);
  };

  const convertToClientItinerary = (version: ItineraryVersion): { client: Client; itinerary: Itinerary } => {
    const clientData: Client = {
      id: salesClient.id,
      name: salesClient.name,
      email: salesClient.email,
      whatsapp: salesClient.whatsapp,
      countryCode: salesClient.country_code,
      travelDates: {
        startDate: salesClient.travel_date,
        endDate: salesClient.travel_date,
        isFlexible: false,
        flexibleMonth: ''
      },
      numberOfPax: {
        adults: salesClient.number_of_adults,
        children: salesClient.number_of_children
      },
      numberOfDays: salesClient.number_of_days,
      transportationMode: salesClient.transportation_mode,
      createdAt: salesClient.created_at,
      createdBy: salesClient.sales_person_id
    };

    const itineraryData: Itinerary = {
      client: clientData,
      dayPlans: version.itinerary_data.days || [],
      totalBaseCost: version.total_cost,
      profitMargin: 0,
      finalPrice: version.total_cost,
      exchangeRate: 85,
      id: version.id,
      version: version.version_number,
      lastUpdated: version.created_at,
      updatedBy: version.created_by,
      changeLog: []
    };

    return { client: clientData, itinerary: itineraryData };
  };

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

  const copyLatestItineraryToClipboard = () => {
    if (versions.length === 0) return;

    const latestVersion = versions[0];
    const { client, itinerary } = convertToClientItinerary(latestVersion);
    const totalPax = salesClient.number_of_adults + salesClient.number_of_children;

    let itineraryText = `🌴 PREMIUM TRAVEL PACKAGE 🌴\n\n`;
    itineraryText += `📋 TRIP DETAILS:\n`;
    itineraryText += `• Trip Name: ${salesClient.name}\n`;
    itineraryText += `• Duration: ${salesClient.number_of_days} days\n`;
    itineraryText += `• Passengers: ${totalPax} pax (${salesClient.number_of_adults} adults, ${salesClient.number_of_children} children)\n`;
    itineraryText += `• Transportation: ${salesClient.transportation_mode}\n\n`;

    itineraryText += `📅 DAY-BY-DAY ITINERARY:\n\n`;

    itinerary.dayPlans.forEach((dayPlan) => {
      itineraryText += `🗓️ DAY ${dayPlan.day}:\n`;

      // Sightseeing
      if (dayPlan.sightseeing.length > 0) {
        itineraryText += `📍 SIGHTSEEING:\n`;
        dayPlan.sightseeing.forEach(sightId => {
          const sight = sightseeings.find(s => s.id === sightId);
          if (sight) {
            itineraryText += `   • ${sight.name}\n`;
          }
        });
      }

      // Hotel
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          itineraryText += `🏨 ACCOMMODATION:\n`;
          itineraryText += `   • ${hotel.name} - ${roomType.name}\n`;
          itineraryText += `   • Location: ${hotel.place}\n`;
        }
      }

      // Activities
      if (dayPlan.activities.length > 0) {
        itineraryText += `🎯 ACTIVITIES:\n`;
        dayPlan.activities.forEach(act => {
          const activity = activities.find(a => a.id === act.activityId);
          const option = activity?.options.find(o => o.id === act.optionId);
          if (activity && option) {
            itineraryText += `   • ${activity.name} - ${option.name}\n`;
          }
        });
      }

      // Entry Tickets
      if (dayPlan.entryTickets.length > 0) {
        itineraryText += `🎫 ENTRY TICKETS:\n`;
        dayPlan.entryTickets.forEach(ticketId => {
          const ticket = entryTickets.find(t => t.id === ticketId);
          if (ticket) {
            itineraryText += `   • ${ticket.name}\n`;
          }
        });
      }

      // Meals
      if (dayPlan.meals.length > 0) {
        itineraryText += `🍽️ MEALS:\n`;
        dayPlan.meals.forEach(mealId => {
          const meal = meals.find(m => m.id === mealId);
          if (meal) {
            itineraryText += `   • ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place}\n`;
          }
        });
      }

      itineraryText += `\n`;
    });

    itineraryText += `💰 PREMIUM PACKAGE PRICING:\n`;
    itineraryText += `• Total Package Price: IDR ${latestVersion.total_cost.toLocaleString()}\n\n`;

    itineraryText += `📞 SALES CONTACT:\n`;
    itineraryText += `${salesClient.name} Premium Travel Package\n`;
    itineraryText += `Bali CRM - Sales Department\n`;
    itineraryText += `Professional Travel Planning Services\n\n`;

    itineraryText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    itineraryText += `Package ID: ${salesClient.id}\n`;

    navigator.clipboard.writeText(itineraryText).then(() => {
      alert('✅ Complete itinerary copied to clipboard! Ready to share on WhatsApp.');
    }).catch(() => {
      alert('❌ Failed to copy itinerary. Please try again.');
    });
  };

  if (loading) {
    return (
      <Layout title="View Itinerary History" subtitle={salesClient.name}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading itinerary versions...</p>
        </div>
      </Layout>
    );
  }

  if (versions.length === 0) {
    return (
      <Layout title="View Itinerary History" subtitle={salesClient.name}>
        <div className="mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700 mb-2">No itinerary versions found</p>
          <p className="text-slate-500">This client does not have any itinerary versions yet.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="View Itinerary History" subtitle={salesClient.name}>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl shadow-sm p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{salesClient.name}</h2>
            <p className="text-blue-100">Complete Itinerary Version History</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={copyLatestItineraryToClipboard}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-lg"
            >
              <Copy className="h-5 w-5 mr-2" />
              Copy for WhatsApp
            </button>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-sm text-blue-100">Total Versions</p>
              <p className="text-3xl font-bold">{versions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version Timeline */}
      <div className="space-y-4">
        {versions.map((version, index) => {
          const isLatest = index === 0;
          const isExpanded = expandedVersion === version.version_number;
          const { client, itinerary } = convertToClientItinerary(version);

          return (
            <div
              key={version.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                isLatest ? 'border-green-500' : 'border-slate-200'
              }`}
            >
              {/* Version Header */}
              <div
                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleVersion(version.version_number)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        isLatest ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Version {version.version_number}
                      </div>
                      {isLatest && (
                        <div className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-xs font-semibold">
                          CURRENT VERSION
                        </div>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(version.associated_follow_up_status)}`}>
                        {getStatusLabel(version.associated_follow_up_status)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {version.change_description}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        Created: {new Date(version.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Clock className="h-4 w-4 mr-2 text-purple-600" />
                        {new Date(version.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        Total Cost: IDR {version.total_cost.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    className="ml-4 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVersion(version.version_number);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Version Content */}
              {isExpanded && (
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
                      Complete Itinerary Details
                    </h4>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <SalesFinalSummary
                      itinerary={itinerary}
                      onStartNew={() => {}}
                      onBack={onBack}
                      onBackToDashboard={onBack}
                      isViewMode={true}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-8 bg-slate-100 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-slate-600 text-sm mb-1">Latest Version</p>
            <p className="text-2xl font-bold text-slate-900">v{versions[0]?.version_number}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Current Cost</p>
            <p className="text-2xl font-bold text-green-600">IDR {versions[0]?.total_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm mb-1">Last Updated</p>
            <p className="text-2xl font-bold text-slate-900">
              {new Date(versions[0]?.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewItinerary;
