import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import {
  CheckCircle, Download, ArrowLeft, RotateCcw, Calendar, Users,
  MapPin, Building2, Camera, Ticket, Utensils, DollarSign,
  Phone, Mail, Globe, Copy
} from 'lucide-react';
import jsPDF from 'jspdf';
import { generateUUID } from '../../utils/uuid';
import {
  addLetterheadHeader,
  addPageWithLetterhead,
  addDocumentTitle,
  addInfoBox,
  addDayPlanBox,
  addDayPlanBoxWithDetails,
  addPricingBox,
  addInclusionsExclusions,
  finalizeLetterheadPDF,
  MARGINS
} from '../../utils/pdfLetterhead';

interface AgentFinalSummaryProps {
  itinerary: Itinerary;
  onBack: () => void;
  onStartNew: () => void;
}

const AgentFinalSummary: React.FC<AgentFinalSummaryProps> = ({ itinerary, onBack, onStartNew }) => {
  const { state, dispatch } = useData();
  const { state: authState } = useAuth();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;

  // Save itinerary to data context
  React.useEffect(() => {
    // Check if client already exists to prevent duplicates
    const existingClient = state.clients.find(c => c.id === itinerary.client.id);
    
    // Create client with follow-up status for guest management (only if has contact info and doesn't exist)
    if (itinerary.client.whatsapp && !existingClient) {
      const clientWithFollowUp = {
        ...itinerary.client,
        followUpStatus: {
          status: 'itinerary-created' as const,
          updatedAt: new Date().toISOString(),
          remarks: 'Initial itinerary created by agent',
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          nextFollowUpTime: '14:00'
        },
        followUpHistory: [{
          id: generateUUID(),
          status: 'itinerary-created' as const,
          remarks: 'Initial itinerary created by agent',
          updatedAt: new Date().toISOString(),
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          nextFollowUpTime: '14:00',
          updatedBy: authState.user?.id || 'agent'
        }],
        nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nextFollowUpTime: '14:00'
      };

      // Add client to guest management system
      dispatch({ type: 'ADD_CLIENT', payload: clientWithFollowUp });
    }

    const itineraryWithMetadata: Itinerary = {
      ...itinerary,
      id: generateUUID(),
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'agent',
      changeLog: [{
        id: Date.now().toString(),
        version: 1,
        changeType: 'created',
        description: 'Initial itinerary created by agent',
        timestamp: new Date().toISOString(),
        updatedBy: 'agent'
      }]
    };
    
    dispatch({ type: 'ADD_ITINERARY', payload: itineraryWithMetadata });
  }, [itinerary, dispatch, authState.user?.id, state.clients]);

  const copyItineraryToClipboard = () => {
    const totalPax = itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children;
    
    let itineraryText = `🌴 TRAVEL PACKAGE 🌴\n\n`;
    itineraryText += `📋 TRIP DETAILS:\n`;
    itineraryText += `• Trip Name: ${itinerary.client.name}\n`;
    itineraryText += `• Duration: ${itinerary.client.numberOfDays} days\n`;
    itineraryText += `• Passengers: ${totalPax} pax (${itinerary.client.numberOfPax.adults} adults, ${itinerary.client.numberOfPax.children} children)\n`;
    itineraryText += `• Transportation: ${itinerary.client.transportationMode}\n\n`;

    itineraryText += `📅 DAY-BY-DAY ITINERARY:\n\n`;
    
    itinerary.dayPlans.forEach((dayPlan) => {
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

    itineraryText += `💰 PACKAGE PRICING:\n`;
    itineraryText += `• Total Package Price: IDR ${(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}\n\n`;

    // Calculate hotel nights by hotel
    const hotelNights = new Map<string, { hotel: any; roomType: any; nights: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
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
    itineraryText += `• ${itinerary.client.numberOfDays} days ${itinerary.client.transportationMode} transportation\n`;
    if (hotelNights.size > 0) {
      hotelNights.forEach(({ hotel, roomType, nights }) => {
        itineraryText += `• ${nights} night${nights > 1 ? 's' : ''} stay ${hotel.name} in ${roomType.name}\n`;
      });
    }
    if (itinerary.dayPlans.some(day => day.sightseeing.length > 0)) {
      itineraryText += `• Sightseeing tours as mentioned\n`;
    }
    if (itinerary.dayPlans.some(day => day.activities.length > 0)) {
      itineraryText += `• Activities and experiences as listed\n`;
    }
    if (itinerary.dayPlans.some(day => day.entryTickets.length > 0)) {
      itineraryText += `• Entry tickets to attractions\n`;
    }
    if (itinerary.dayPlans.some(day => day.meals.length > 0)) {
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
    itineraryText += `${itinerary.client.name} Travel Package\n`;
    itineraryText += `Professional Travel Planning Services\n\n`;
    
    itineraryText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    itineraryText += `Package ID: ${itinerary.client.id}\n`;

    navigator.clipboard.writeText(itineraryText).then(() => {
      alert('✅ Complete travel package copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy package. Please try again.');
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    addLetterheadHeader(doc);

    let yPosition = MARGINS.contentStart;
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    yPosition = addDocumentTitle(doc, 'TRAVEL ITINERARY', `Generated on ${today}`, yPosition);

    const clientInfo = [
      `Client Name: ${itinerary.client.name}`,
      `Contact: ${itinerary.client.countryCode} ${itinerary.client.whatsapp}`,
      `Email: ${itinerary.client.email || 'N/A'}`,
      `Duration: ${itinerary.client.numberOfDays} days / ${itinerary.client.numberOfDays - 1} nights`,
      `Passengers: ${itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax (${itinerary.client.numberOfPax.adults} adults, ${itinerary.client.numberOfPax.children} children)`,
      `Transportation: ${itinerary.client.transportationMode}`,
      !itinerary.client.travelDates.isFlexible ? `Travel Dates: ${new Date(itinerary.client.travelDates.startDate).toLocaleDateString()} to ${new Date(itinerary.client.travelDates.endDate).toLocaleDateString()}` : 'Travel Dates: Flexible'
    ];
    yPosition = addInfoBox(doc, 'CLIENT INFORMATION', clientInfo, yPosition);

    itinerary.dayPlans.forEach(dayPlan => {
      const dayContent: { title: string; items: Array<{ name: string; description?: string }> }[] = [];

      const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
      if (selectedSightseeing.length > 0) {
        dayContent.push({
          title: 'Sightseeing',
          items: selectedSightseeing.map(s => ({ name: s.name, description: s.description || undefined }))
        });
      }

      const selectedActivities = dayPlan.activities.map((a: any) => {
        const activity = activities.find(act => act.id === a.activityId);
        const option = activity?.options.find(opt => opt.id === a.optionId);
        return { activity, option };
      }).filter((item: any) => item.activity && item.option);

      if (selectedActivities.length > 0) {
        dayContent.push({
          title: 'Activities',
          items: selectedActivities.map((item: any) => ({ name: `${item.activity?.name} - ${item.option?.name}` }))
        });
      }

      const selectedTickets = entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
      if (selectedTickets.length > 0) {
        dayContent.push({
          title: 'Entry Tickets',
          items: selectedTickets.map(t => ({ name: t.name }))
        });
      }

      const selectedMeals = dayPlan.meals.map((m: any) => {
        const meal = meals.find(meal => meal.id === m.mealId);
        return meal;
      }).filter(Boolean);

      if (selectedMeals.length > 0) {
        dayContent.push({
          title: 'Meals',
          items: selectedMeals.map((m: any) => ({ name: `${m.mealType} at ${m.placeName}` }))
        });
      }

      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          dayContent.push({
            title: 'Accommodation',
            items: [{ name: `${hotel.name} - ${roomType.name}` }]
          });
        }
      }

      yPosition = addDayPlanBoxWithDetails(doc, dayPlan.day, dayContent, yPosition);
    });

    const pricingItems = [
      { label: 'TOTAL PACKAGE PRICE', usd: `$${itinerary.finalPrice.toFixed(2)}`, idr: `IDR ${(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}` }
    ];

    yPosition = addPricingBox(doc, pricingItems, yPosition);

    // Dynamic inclusions/exclusions based on transport mode
    const transport = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
    const isSelfDrive = transport?.type === 'self-drive-car' || transport?.type === 'self-drive-scooter';

    const inclusions: string[] = [];

    if (transport) {
      if (transport.type === 'cab') {
        inclusions.push('All transportation by private cab');
        inclusions.push('Professional English-speaking driver');
        inclusions.push('All entry tickets as mentioned');
        inclusions.push('Nusa Penida island tour');
      } else if (transport.type === 'self-drive-car') {
        inclusions.push(`${itinerary.client.numberOfDays} days self-drive car for sightseeing`);
        inclusions.push('Up and down boat ticket to Nusa Penida');
      } else if (transport.type === 'self-drive-scooter') {
        inclusions.push(`${itinerary.client.numberOfDays} days self-drive scooter for sightseeing`);
        inclusions.push('Up and down boat ticket to Nusa Penida');
      }
    }

    inclusions.push('Accommodation as per itinerary');

    const hasMeals = itinerary.dayPlans.some(day => day.meals && day.meals.length > 0);
    if (hasMeals) {
      inclusions.push('Meals as mentioned in itinerary');
    }

    // Add activities
    const allActivities = new Set<string>();
    itinerary.dayPlans.forEach(dayPlan => {
      if (dayPlan.activities && dayPlan.activities.length > 0) {
        dayPlan.activities.forEach((a: any) => {
          const activity = activities.find(act => act.id === a.activityId);
          const option = activity?.options.find(opt => opt.id === a.optionId);
          if (activity && option) {
            allActivities.add(`${activity.name} - ${option.name}`);
          }
        });
      }
    });

    if (allActivities.size > 0) {
      allActivities.forEach(activityStr => {
        inclusions.push(activityStr);
      });
    }

    inclusions.push('All applicable taxes');

    const exclusions = [
      'International/domestic airfare',
      'Travel insurance',
      'Personal expenses and tips',
      'Visa fees and documentation',
      'Emergency medical expenses'
    ];

    if (isSelfDrive) {
      exclusions.push('Entry tickets and permits (to be purchased by traveler)');
      exclusions.push('Fuel costs');
      exclusions.push('Parking fees');
      exclusions.push('Traffic fines and violations');
    }

    if (!hasMeals) {
      exclusions.push('All meals and beverages');
    } else {
      exclusions.push('Meals not mentioned in itinerary');
    }

    yPosition = addInclusionsExclusions(doc, inclusions, exclusions, yPosition);
    finalizeLetterheadPDF(doc);

    doc.save(`${itinerary.client.name.replace(/\s+/g, '_')}_Travel_Itinerary.pdf`);
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-green-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Package Complete!</h2>
              <p className="text-teal-100 mt-1 text-sm md:text-base">Step 4 of 4 - Final Summary & Export</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-green-900">
                  Travel Package Created Successfully!
                </h3>
                <p className="text-green-700 mt-1 text-sm md:text-base">
                  Your detailed travel package for {itinerary.client.name} has been generated and saved.
                </p>
              </div>
            </div>
          </div>

          {/* Trip Summary */}
          <div className="bg-slate-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Trip Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Trip Name:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">{itinerary.client.name}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Duration:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">{itinerary.client.numberOfDays} days</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Passengers:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">
                    {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Transport:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">{itinerary.client.transportationMode}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary Overview */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-teal-600" />
              Complete Itinerary
            </h3>
            
            <div className="space-y-4">
              {itinerary.dayPlans.map((dayPlan) => {
                const summary = renderDayPlanSummary(dayPlan);
                
                return (
                  <div key={dayPlan.day} className="border border-slate-200 rounded-xl p-4 md:p-6">
                    <h4 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                      Day {dayPlan.day}
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-3 md:space-y-4">
                        {/* Sightseeing */}
                        {summary.sightseeing.length > 0 && (
                          <div>
                            <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              Sightseeing
                            </h5>
                            <ul className="text-xs md:text-sm text-slate-700 space-y-1 ml-6">
                              {summary.sightseeing.map((sight: any) => (
                                <li key={sight.id}>• {sight.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Activities */}
                        {summary.activities.length > 0 && (
                          <div>
                            <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                              <Camera className="h-4 w-4 mr-2 text-blue-600" />
                              Activities
                            </h5>
                            <ul className="text-xs md:text-sm text-slate-700 space-y-1 ml-6">
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
                            <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                              <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                              Entry Tickets
                            </h5>
                            <ul className="text-xs md:text-sm text-slate-700 space-y-1 ml-6">
                              {summary.tickets.map((ticket: any) => (
                                <li key={ticket.id}>• {ticket.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        {/* Hotel */}
                        {summary.hotel && (
                          <div>
                            <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                              <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                              Accommodation
                            </h5>
                            <div className="text-xs md:text-sm text-slate-700 ml-6">
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
                            <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                              <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                              Meals
                            </h5>
                            <ul className="text-xs md:text-sm text-slate-700 space-y-1 ml-6">
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

          {/* Final Package Pricing - Agent Version (No Breakdown) */}
          <div className="bg-gradient-to-br from-slate-50 to-teal-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
              Package Pricing
            </h3>
            
            <div className="flex items-center justify-center">
              <div className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl p-6 md:p-8 text-center max-w-md">
                <div className="text-sm font-medium mb-2">Final Package Price</div>
                <div className="text-3xl md:text-4xl font-bold mb-2">IDR {(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}</div>
                <div className="text-xl md:text-2xl font-bold text-teal-100 mb-4">
                  IDR {(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}
                </div>
                <div className="text-teal-100 text-sm md:text-base">
                  Complete package for {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} passengers
                </div>
                {itinerary.profitMargin > 0 && (
                  <div className="mt-4 pt-4 border-t border-teal-400 border-opacity-50">
                    <div className="text-sm text-teal-100">
                      <div>Your Profit: IDR {(itinerary.profitMargin * itinerary.exchangeRate).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 md:pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center px-4 md:px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm md:text-base"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Review
              </button>
              <button
                onClick={generatePDF}
                className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </button>
              <button
                onClick={copyItineraryToClipboard}
                className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                <Copy className="mr-2 h-5 w-5" />
                Copy Package
              </button>
            </div>
            <button
              onClick={onStartNew}
              className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-gradient-to-r from-teal-600 to-green-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-teal-700 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Create New Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFinalSummary;