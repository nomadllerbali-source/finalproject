import React, { useState, useEffect } from 'react';
import { Client, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { calculateItineraryCost } from '../../utils/calculations';
import { 
  X, Copy, Send, FileText, Calendar, Users, MapPin, Building2, 
  Camera, Ticket, Utensils, DollarSign, Phone, Download, CheckCircle,
  Clock, RefreshCw, History
} from 'lucide-react';
import jsPDF from 'jspdf';

interface ItineraryViewModalProps {
  client: Client;
  onClose: () => void;
}

const ItineraryViewModal: React.FC<ItineraryViewModalProps> = ({ client, onClose }) => {
  const { state, getLatestItinerary } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  const [copySuccess, setCopySuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [showChangeLog, setShowChangeLog] = useState(false);

  // Get the latest itinerary for this client
  const clientItinerary = getLatestItinerary(client.id);

  // Recalculate costs to ensure they're current
  const currentBaseCost = React.useMemo(() => {
    if (!clientItinerary) return 0;
    return calculateItineraryCost(
      clientItinerary.client,
      clientItinerary.dayPlans,
      hotels,
      sightseeings,
      activities,
      entryTickets,
      meals,
      transportations
    );
  }, [clientItinerary, hotels, sightseeings, activities, entryTickets, meals, transportations]);

  const updatedFinalPrice = currentBaseCost + (clientItinerary?.profitMargin || 0);
  // Auto-refresh every 5 seconds to show real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to show latest changes
      const updatedItinerary = getLatestItinerary(client.id);
      if (updatedItinerary && updatedItinerary.version !== clientItinerary?.version) {
        // Trigger re-render by updating state
        window.location.reload = window.location.reload;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [client.id, clientItinerary?.version, getLatestItinerary]);

  const renderDayPlanSummary = (dayPlan: any) => {
    const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
    const selectedActivities = dayPlan.activities.map((a: any) => {
      const activity = activities.find(act => act.id === a.activityId);
      const option = activity?.options.find(opt => opt.id === a.optionId);
      return { activity, option };
    }).filter((item: any) => item.activity && item.option);
    const selectedTickets = entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
    const selectedMeals = meals.filter(m => dayPlan.meals.includes(m.id));
    
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
    if (!clientItinerary) return '';

    const totalPax = client.numberOfPax.adults + client.numberOfPax.children;
    
    let itineraryText = `🌴 TRAVEL ITINERARY 🌴\n\n`;
    itineraryText += `📋 CLIENT DETAILS:\n`;
    itineraryText += `• Client: ${client.name}\n`;
    itineraryText += `• Contact: ${client.countryCode} ${client.whatsapp}\n`;
    itineraryText += `• Duration: ${client.numberOfDays} days\n`;
    itineraryText += `• Passengers: ${totalPax} pax (${client.numberOfPax.adults} adults, ${client.numberOfPax.children} children)\n`;
    itineraryText += `• Transportation: ${client.transportationMode}\n\n`;

    itineraryText += `📅 DAY-BY-DAY ITINERARY:\n\n`;
    
    clientItinerary.dayPlans.forEach((dayPlan) => {
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
    itineraryText += `• Total Package Price: $${updatedFinalPrice.toFixed(2)}\n`;
    itineraryText += `• Total Package Price (INR): ₹${(updatedFinalPrice * (clientItinerary?.exchangeRate || 83)).toLocaleString('en-IN')}\n`;
    itineraryText += `• Exchange Rate: 1 USD = ₹${clientItinerary?.exchangeRate || 83}\n\n`;

    // Calculate hotel nights by hotel
    const hotelNights = new Map<string, { hotel: any; roomType: any; nights: number }>();
    clientItinerary.dayPlans.forEach(dayPlan => {
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
    if (clientItinerary.dayPlans.some(day => day.sightseeing.length > 0)) {
      itineraryText += `• Sightseeing tours as mentioned\n`;
    }
    if (clientItinerary.dayPlans.some(day => day.activities.length > 0)) {
      itineraryText += `• Activities and experiences as listed\n`;
    }
    if (clientItinerary.dayPlans.some(day => day.entryTickets.length > 0)) {
      itineraryText += `• Entry tickets to attractions\n`;
    }
    if (clientItinerary.dayPlans.some(day => day.meals.length > 0)) {
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
    itineraryText += `Nomadller Solutions - Travel Agency Management\n`;
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
    if (!clientItinerary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Travel Itinerary', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Client details
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

    // Itinerary details
    doc.setFont('helvetica', 'bold');
    doc.text('Day-by-Day Itinerary:', margin, yPosition);
    yPosition += 10;

    clientItinerary.dayPlans.forEach((dayPlan) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Day ${dayPlan.day}:`, margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      
      // Sightseeing
      if (dayPlan.sightseeing.length > 0) {
        const sightseeingNames = dayPlan.sightseeing.map(id => {
          const sight = sightseeings.find(s => s.id === id);
          return sight ? sight.name : 'Unknown';
        }).join(', ');
        doc.text(`• Sightseeing: ${sightseeingNames}`, margin + 5, yPosition);
        yPosition += 6;
      }

      // Hotel
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

    // Pricing
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Pricing Summary:', margin, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Price: $${clientItinerary.finalPrice.toFixed(2)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Total Price (INR): ₹${(clientItinerary.finalPrice * clientItinerary.exchangeRate).toLocaleString('en-IN')}`, margin, yPosition);

    doc.save(`${client.name}-itinerary.pdf`);
  };

  if (!clientItinerary) {
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
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Latest Itinerary - {client.name}</h3>
              <p className="text-slate-500 text-sm">
                Created on {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Action Buttons */}
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

          {/* Client Summary */}
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

          {/* Pricing Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Package Pricing
            </h4>
            {currentBaseCost !== clientItinerary?.totalBaseCost && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800 font-medium">
                    Pricing updated based on latest itinerary changes
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 text-center">
                <div className="text-sm font-medium mb-2">Total Package Price</div>
                <div className="text-3xl font-bold mb-2">${updatedFinalPrice.toFixed(2)}</div>
                <div className="text-xl font-bold text-green-100">
                  ₹{(updatedFinalPrice * (clientItinerary?.exchangeRate || 83)).toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-green-100 mt-2">
                  Exchange Rate: 1 USD = ₹{clientItinerary?.exchangeRate || 83}
                </div>
                {currentBaseCost !== clientItinerary?.totalBaseCost && (
                  <div className="mt-3 pt-3 border-t border-green-400 border-opacity-50">
                    <div className="text-xs text-green-100 space-y-1">
                      <div>Updated Base Cost: ${currentBaseCost.toFixed(2)}</div>
                      <div>Profit Margin: ${(clientItinerary?.profitMargin || 0).toFixed(2)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Itinerary Details */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-600" />
              Complete Itinerary
            </h4>
            
            <div className="space-y-4">
              {clientItinerary.dayPlans.map((dayPlan) => {
                const summary = renderDayPlanSummary(dayPlan);
                
                return (
                  <div key={dayPlan.day} className="border border-slate-200 rounded-xl p-6">
                    <h5 className="text-base font-semibold text-slate-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                      Day {dayPlan.day}
                    </h5>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Sightseeing */}
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

                        {/* Activities */}
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

                        {/* Entry Tickets */}
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
                        {/* Hotel */}
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

                        {/* Meals */}
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
  );
};

export default ItineraryViewModal;