import React, { useState, useEffect } from 'react';
import { Client, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { calculateItineraryCost } from '../../utils/calculations';
import {
  X, Copy, Send, FileText, Calendar, Users, MapPin, Building2,
  Camera, Ticket, Utensils, DollarSign, Phone, Download, CheckCircle,
  Clock, RefreshCw, History, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import jsPDF from 'jspdf';
import { getItineraryVersionsByClient, ItineraryVersion } from '../../lib/salesHelpers';

interface ItineraryViewModalProps {
  client: Client;
  onClose: () => void;
}

const ItineraryViewModal: React.FC<ItineraryViewModalProps> = ({ client, onClose }) => {
  const { state, getLatestItinerary } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  const [copySuccess, setCopySuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<ItineraryVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ItineraryVersion | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());

  const clientItinerary = getLatestItinerary(client.id);

  useEffect(() => {
    loadVersionHistory();
  }, [client.id]);

  const loadVersionHistory = async () => {
    setLoadingVersions(true);
    try {
      const versionData = await getItineraryVersionsByClient(client.id);
      setVersions(versionData);
      if (versionData.length > 0 && !selectedVersion) {
        setSelectedVersion(versionData[0]);
      }
    } catch (error) {
      console.error('Error loading version history:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const toggleVersionExpansion = (versionId: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(versionId)) {
      newExpanded.delete(versionId);
    } else {
      newExpanded.add(versionId);
    }
    setExpandedVersions(newExpanded);
  };

  const convertVersionToItinerary = (version: ItineraryVersion): Itinerary | null => {
    if (!version || !version.itinerary_data) return null;

    return {
      client: client,
      dayPlans: version.itinerary_data.days || version.itinerary_data.dayPlans || [],
      totalBaseCost: version.total_cost,
      profitMargin: 0,
      finalPrice: version.total_cost,
      exchangeRate: 83,
      id: version.id,
      version: version.version_number,
      lastUpdated: version.created_at,
      updatedBy: version.created_by,
      changeLog: []
    };
  };

  const displayItinerary = selectedVersion ? convertVersionToItinerary(selectedVersion) : clientItinerary;

  const currentBaseCost = React.useMemo(() => {
    if (!displayItinerary) return 0;
    return calculateItineraryCost(
      displayItinerary.client,
      displayItinerary.dayPlans,
      hotels,
      sightseeings,
      activities,
      entryTickets,
      meals,
      transportations
    );
  }, [displayItinerary, hotels, sightseeings, activities, entryTickets, meals, transportations]);

  const updatedFinalPrice = currentBaseCost + (displayItinerary?.profitMargin || 0);

  const renderDayPlanSummary = (dayPlan: any) => {
    const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing?.includes(s.id));
    const selectedActivities = (dayPlan.activities || []).map((a: any) => {
      const activity = activities.find(act => act.id === a.activityId);
      const option = activity?.options.find(opt => opt.id === a.optionId);
      return { activity, option };
    }).filter((item: any) => item.activity && item.option);
    const selectedTickets = entryTickets.filter(t => dayPlan.entryTickets?.includes(t.id));
    const selectedMeals = meals.filter(m => dayPlan.meals?.includes(m.id));

    let hotelInfo = null;
    if (dayPlan.hotel) {
      const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
      const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
      if (hotel && roomType) {
        hotelInfo = { hotel, roomType };
      }
    }

    return {
      sightseeing: selectedSightseeing,
      activities: selectedActivities,
      tickets: selectedTickets,
      meals: selectedMeals,
      hotel: hotelInfo
    };
  };

  const generateItineraryText = () => {
    if (!displayItinerary) return '';

    const totalPax = client.numberOfPax.adults + client.numberOfPax.children;

    let itineraryText = `🌴 TRAVEL ITINERARY 🌴\n\n`;
    itineraryText += `📋 CLIENT DETAILS:\n`;
    itineraryText += `• Client: ${client.name}\n`;
    itineraryText += `• Contact: ${client.countryCode} ${client.whatsapp}\n`;
    itineraryText += `• Duration: ${client.numberOfDays} days\n`;
    itineraryText += `• Passengers: ${totalPax} pax (${client.numberOfPax.adults} adults, ${client.numberOfPax.children} children)\n`;
    itineraryText += `• Transportation: ${client.transportationMode}\n\n`;

    itineraryText += `📅 DAY-BY-DAY ITINERARY:\n\n`;

    displayItinerary.dayPlans.forEach((dayPlan) => {
      const summary = renderDayPlanSummary(dayPlan);
      itineraryText += `🗓️ DAY ${dayPlan.day}:\n`;

      if (summary.sightseeing.length > 0) {
        itineraryText += `📍 SIGHTSEEING:\n`;
        summary.sightseeing.forEach(sight => {
          itineraryText += `   • ${sight.name}\n`;
        });
      }

      if (summary.hotel) {
        itineraryText += `🏨 ACCOMMODATION:\n`;
        itineraryText += `   • ${summary.hotel.hotel.name} - ${summary.hotel.roomType.name}\n`;
        itineraryText += `   • Location: ${summary.hotel.hotel.place}\n`;
      }

      if (summary.activities.length > 0) {
        itineraryText += `🎯 ACTIVITIES:\n`;
        summary.activities.forEach(item => {
          itineraryText += `   • ${item.activity?.name} - ${item.option?.name}\n`;
        });
      }

      if (summary.tickets.length > 0) {
        itineraryText += `🎫 ENTRY TICKETS:\n`;
        summary.tickets.forEach(ticket => {
          itineraryText += `   • ${ticket.name}\n`;
        });
      }

      if (summary.meals.length > 0) {
        itineraryText += `🍽️ MEALS:\n`;
        summary.meals.forEach(meal => {
          itineraryText += `   • ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place}\n`;
        });
      }

      itineraryText += `\n`;
    });

    itineraryText += `💰 PRICING:\n`;
    itineraryText += `• Total Package Price: IDR ${(updatedFinalPrice * (displayItinerary?.exchangeRate || 83)).toLocaleString('en-IN')}\n\n`;

    const hotelNights = new Map<string, { hotel: any; roomType: any; nights: number }>();
    displayItinerary.dayPlans.forEach(dayPlan => {
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          const key = `${hotel.id}-${roomType.id}`;
          if (hotelNights.has(key)) {
            hotelNights.get(key)!.nights += 1;
          } else {
            hotelNights.set(key, { hotel, roomType, nights: 1 });
          }
        }
      }
    });

    itineraryText += `✅ INCLUSIONS:\n`;
    itineraryText += `• ${client.numberOfDays} days ${client.transportationMode} transportation\n`;
    if (hotelNights.size > 0) {
      hotelNights.forEach(({ hotel, roomType, nights }) => {
        itineraryText += `• ${nights} night${nights > 1 ? 's' : ''} stay ${hotel.name} in ${roomType.name}\n`;
      });
    }
    if (displayItinerary.dayPlans.some(day => day.sightseeing?.length > 0)) {
      itineraryText += `• Sightseeing tours as mentioned\n`;
    }
    if (displayItinerary.dayPlans.some(day => day.activities?.length > 0)) {
      itineraryText += `• Activities and experiences as listed\n`;
    }
    if (displayItinerary.dayPlans.some(day => day.entryTickets?.length > 0)) {
      itineraryText += `• Entry tickets to attractions\n`;
    }
    if (displayItinerary.dayPlans.some(day => day.meals?.length > 0)) {
      itineraryText += `• Meals as specified in itinerary\n`;
    }
    itineraryText += `• Professional travel planning service\n`;
    itineraryText += `• 24/7 customer support during travel\n\n`;

    itineraryText += `❌ EXCLUSIONS:\n`;
    itineraryText += `• International/domestic flights\n`;
    itineraryText += `• Travel insurance\n`;
    itineraryText += `• Personal expenses and shopping\n`;
    itineraryText += `• Tips and gratuities\n`;
    itineraryText += `• Any meals not mentioned in inclusions\n`;
    itineraryText += `• Additional activities not listed\n`;
    itineraryText += `• Visa fees and documentation\n`;
    itineraryText += `• Emergency medical expenses\n\n`;

    itineraryText += `📞 CONTACT:\n`;
    itineraryText += `Nomadller Solution - Travel Agency Management\n`;
    itineraryText += `Professional Travel Planning Services\n\n`;

    itineraryText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    itineraryText += `Package ID: ${client.id}\n`;

    return itineraryText;
  };

  const handleCopyItinerary = () => {
    const itineraryText = generateItineraryText();
    navigator.clipboard.writeText(itineraryText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(() => {
      alert('❌ Failed to copy itinerary. Please try again.');
    });
  };

  const handleSendToWhatsApp = () => {
    const itineraryText = generateItineraryText();
    const message = encodeURIComponent(itineraryText);
    const whatsappUrl = `https://wa.me/${client.countryCode.replace('+', '')}${client.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 2000);
  };

  const generatePDF = () => {
    if (!displayItinerary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Itinerary', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${client.name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Contact: ${client.countryCode} ${client.whatsapp}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Duration: ${client.numberOfDays} days`, margin, yPosition);
    yPosition += 8;
    doc.text(`Passengers: ${client.numberOfPax.adults + client.numberOfPax.children} pax`, margin, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Day-by-Day Itinerary:', margin, yPosition);
    yPosition += 10;

    displayItinerary.dayPlans.forEach((dayPlan) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${dayPlan.day}:`, margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');

      if (dayPlan.sightseeing?.length > 0) {
        const sightseeingNames = dayPlan.sightseeing.map((id: string) => {
          const sight = sightseeings.find(s => s.id === id);
          return sight ? sight.name : 'Unknown';
        }).join(', ');
        doc.text(`• Sightseeing: ${sightseeingNames}`, margin + 5, yPosition);
        yPosition += 6;
      }

      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          doc.text(`• Hotel: ${hotel.name} - ${roomType.name}`, margin + 5, yPosition);
          yPosition += 6;
        }
      }

      yPosition += 5;
    });

    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Pricing Summary:', margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Price: IDR ${(displayItinerary.finalPrice * displayItinerary.exchangeRate).toLocaleString('en-IN')}`, margin, yPosition);

    doc.save(`${client.name}-itinerary.pdf`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'advance-paid-confirmed': return 'bg-green-100 text-green-800';
      case 'dead': return 'bg-red-100 text-red-800';
      case 'itinerary-sent': return 'bg-blue-100 text-blue-800';
      case 'itinerary-edited': return 'bg-purple-100 text-purple-800';
      case 'updated-itinerary-sent': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!displayItinerary && !loadingVersions) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="bg-slate-100 p-4 rounded-lg mb-4 inline-block">
            <FileText className="h-8 w-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Itinerary Found</h3>
          <p className="text-slate-600 mb-6">
            No itinerary has been created for {client.name} yet.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedVersion ? `Version ${selectedVersion.version_number}` : 'Latest'} Itinerary - {client.name}
              </h3>
              <p className="text-slate-500 text-sm">
                {versions.length > 0 ? `${versions.length} version${versions.length > 1 ? 's' : ''} available` : 'Created on ' + new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {versions.length > 0 && (
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    showVersionHistory
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <History className="h-4 w-4 mr-2" />
                  {showVersionHistory ? 'Hide' : 'Show'} History ({versions.length})
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {showVersionHistory && (
            <div className="w-80 border-r border-slate-200 overflow-y-auto max-h-[calc(90vh-100px)] bg-slate-50">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
                  Version History
                </h4>
                {loadingVersions ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((version, index) => {
                      const isLatest = index === 0;
                      const isSelected = selectedVersion?.id === version.id;
                      const isExpanded = expandedVersions.has(version.id);

                      return (
                        <div
                          key={version.id}
                          className={`rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div
                            className="p-3 cursor-pointer"
                            onClick={() => setSelectedVersion(version)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className={`px-2 py-1 rounded text-xs font-bold ${
                                  isLatest ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  v{version.version_number}
                                </div>
                                {isLatest && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVersionExpansion(version.id);
                                }}
                                className="p-1 hover:bg-slate-200 rounded"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-slate-600" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-slate-600" />
                                )}
                              </button>
                            </div>

                            <div className="text-xs font-medium text-slate-900 mb-1">
                              {version.change_description}
                            </div>

                            <div className="flex items-center text-xs text-slate-600 mb-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(version.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>

                            <div className="flex items-center text-xs text-slate-600">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(version.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-3 pb-3 border-t border-slate-200 pt-2 space-y-2">
                              <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(version.associated_follow_up_status)}`}>
                                  {getStatusLabel(version.associated_follow_up_status)}
                                </span>
                              </div>
                              <div className="flex items-center text-xs text-slate-600">
                                <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                                <span className="font-semibold">IDR {version.total_cost.toLocaleString()}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={`flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)] ${showVersionHistory ? '' : 'w-full'}`}>
            {selectedVersion && selectedVersion.version_number !== versions[0]?.version_number && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Viewing Historical Version</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    You are viewing version {selectedVersion.version_number} from {new Date(selectedVersion.created_at).toLocaleDateString()}.
                    This is not the current version.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-lg">
              <button
                onClick={handleCopyItinerary}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                  copySuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Itinerary
                  </>
                )}
              </button>

              <button
                onClick={handleSendToWhatsApp}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-all ${
                  sendSuccess
                    ? 'bg-green-600 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {sendSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to WhatsApp
                  </>
                )}
              </button>

              <button
                onClick={generatePDF}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Client:</span>
                    <div className="text-base text-slate-900 font-semibold">{client.name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Contact:</span>
                    <div className="text-base text-slate-900 font-semibold">
                      {client.countryCode} {client.whatsapp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Duration:</span>
                    <div className="text-base text-slate-900 font-semibold">{client.numberOfDays} days</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-slate-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">Passengers:</span>
                    <div className="text-base text-slate-900 font-semibold">
                      {client.numberOfPax.adults + client.numberOfPax.children} pax
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Package Pricing
              </h4>
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 text-center">
                  <div className="text-sm font-medium mb-2">Total Package Price</div>
                  <div className="text-3xl font-bold mb-2">IDR {(updatedFinalPrice * (displayItinerary?.exchangeRate || 83)).toLocaleString('en-IN')}</div>
                  <div className="text-xl font-bold text-green-100">
                    IDR {(updatedFinalPrice * (displayItinerary?.exchangeRate || 83)).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-green-100 mt-2">
                    Complete package for all passengers
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                Complete Itinerary
              </h4>

              <div className="space-y-4">
                {displayItinerary?.dayPlans.map((dayPlan) => {
                  const summary = renderDayPlanSummary(dayPlan);

                  return (
                    <div key={dayPlan.day} className="border border-slate-200 rounded-xl p-6">
                      <h5 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                        Day {dayPlan.day}
                      </h5>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {summary.sightseeing.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                Sightseeing
                              </h6>
                              <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                {summary.sightseeing.map((sight: any) => (
                                  <li key={sight.id}>• {sight.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {summary.activities.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                <Camera className="h-4 w-4 mr-2 text-blue-600" />
                                Activities
                              </h6>
                              <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                {summary.activities.map((item: any, index: number) => (
                                  <li key={index}>
                                    • {item.activity?.name} - {item.option?.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {summary.tickets.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                                Entry Tickets
                              </h6>
                              <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                {summary.tickets.map((ticket: any) => (
                                  <li key={ticket.id}>• {ticket.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          {summary.hotel && (
                            <div>
                              <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                                Accommodation
                              </h6>
                              <div className="text-sm text-slate-700 ml-6">
                                <div>• {summary.hotel.hotel.name}</div>
                                <div className="text-slate-600">
                                  {summary.hotel.roomType.name} - {summary.hotel.hotel.place}
                                </div>
                              </div>
                            </div>
                          )}

                          {summary.meals.length > 0 && (
                            <div>
                              <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                                Meals
                              </h6>
                              <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                {summary.meals.map((meal: any) => (
                                  <li key={meal.id} className="capitalize">
                                    • {meal.type} at {meal.place}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryViewModal;
