import React from 'react';
import { Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircle, Download, ArrowLeft, RotateCcw, Calendar, Users,
  MapPin, Building2, Camera, Ticket, Utensils, DollarSign, Car,
  Phone, Mail, Globe, TrendingUp, Copy
} from 'lucide-react';
import jsPDF from 'jspdf';
import { generateUUID } from '../../utils/uuid';

interface AdminFinalSummaryProps {
  itinerary: Itinerary;
  onBack: () => void;
  onStartNew: () => void;
}

const AdminFinalSummary: React.FC<AdminFinalSummaryProps> = ({ itinerary, onBack, onStartNew }) => {
  const { state, dispatch } = useData();
  const { state: authState } = useAuth();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;

  // Save itinerary to data context
  React.useEffect(() => {
    // Check if client already exists to prevent duplicates
    const existingClient = state.clients.find(c => c.id === itinerary.client.id);
    
    if (!existingClient) {
      // Create client with follow-up status for guest management
      const clientWithFollowUp = {
        ...itinerary.client,
        followUpStatus: {
          status: 'itinerary-created' as const,
          updatedAt: new Date().toISOString(),
          remarks: 'Initial itinerary created by admin',
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          nextFollowUpTime: '11:00'
        },
        followUpHistory: [{
          id: generateUUID(),
          status: 'itinerary-created' as const,
          remarks: 'Initial itinerary created by admin',
          updatedAt: new Date().toISOString(),
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          nextFollowUpTime: '11:00',
          updatedBy: authState.user?.id || 'admin'
        }],
        nextFollowUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        nextFollowUpTime: '11:00'
      };

      // Add client to guest management system
      dispatch({ type: 'ADD_CLIENT', payload: clientWithFollowUp });
    }

    const itineraryWithMetadata: Itinerary = {
      ...itinerary,
      id: generateUUID(),
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
      changeLog: [{
        id: Date.now().toString(),
        version: 1,
        changeType: 'created',
        description: 'Initial itinerary created',
        timestamp: new Date().toISOString(),
        updatedBy: 'admin'
      }]
    };
    
    dispatch({ type: 'ADD_ITINERARY', payload: itineraryWithMetadata });
  }, [itinerary, dispatch, authState.user?.id, state.clients]);

  const generatePDF = () => {
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
    doc.text(`Client: ${itinerary.client.name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Contact: ${itinerary.client.countryCode} ${itinerary.client.whatsapp}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Duration: ${itinerary.client.numberOfDays} days`, margin, yPosition);
    yPosition += 8;
    doc.text(`Passengers: ${itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax`, margin, yPosition);
    yPosition += 15;

    // Itinerary details
    doc.setFont('helvetica', 'bold');
    doc.text('Day-by-Day Itinerary:', margin, yPosition);
    yPosition += 10;

    itinerary.dayPlans.forEach((dayPlan) => {
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

      // Activities
      if (dayPlan.activities.length > 0) {
        dayPlan.activities.forEach(activity => {
          const activityData = activities.find(a => a.id === activity.activityId);
          const option = activityData?.options.find(o => o.id === activity.optionId);
          if (activityData && option) {
            doc.text(`• Activity: ${activityData.name} - ${option.name}`, margin + 5, yPosition);
            yPosition += 6;
          }
        });
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
    doc.text(`Base Cost: $${itinerary.totalBaseCost.toFixed(2)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Profit Margin: $${itinerary.profitMargin.toFixed(2)}`, margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Price: $${itinerary.finalPrice.toFixed(2)}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Total Price (INR): ₹${(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}`, margin, yPosition);

    doc.save(`${itinerary.client.name}-itinerary.pdf`);
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

  const calculateDetailedCostBreakdown = () => {
    let transportationCost = 0;
    let accommodationCost = 0;
    let sightseeingCost = 0;
    let activitiesCost = 0;
    let ticketsCost = 0;
    let mealsCost = 0;
    let dailyBreakdown: any[] = [];

    const totalPax = itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children;

    // Transportation cost
    const transportation = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
    if (transportation && transportation.type !== 'cab') {
      transportationCost = transportation.costPerDay * itinerary.client.numberOfDays;
    }

    itinerary.dayPlans.forEach(dayPlan => {
      let dayTransportCost = 0;
      let dayAccommodationCost = 0;
      let daySightseeingCost = 0;
      let dayActivitiesCost = 0;
      let dayTicketsCost = 0;
      let dayMealsCost = 0;

      // Hotel cost
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        if (hotel) {
          const roomType = hotel.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
          if (roomType) {
            // Determine seasonal pricing
            const date = new Date(itinerary.client.travelDates.startDate);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            let seasonalPrice = roomType.offSeasonPrice;
            let season = 'Off-Season';
            
            // Peak season: Dec 20 - Jan 5
            if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
              seasonalPrice = roomType.peakSeasonPrice;
              season = 'Peak Season';
            }
            // Season: July 1 - Aug 31
            else if (month === 7 || month === 8) {
              seasonalPrice = roomType.seasonPrice;
              season = 'High Season';
            }
            
            accommodationCost += seasonalPrice;
            dayAccommodationCost = seasonalPrice;
          }
        }
      }

      // Sightseeing cost
      const transportMode = itinerary.client.transportationMode.toLowerCase();
      if (transportMode.includes('cab') || transportMode === 'private cab service') {
        dayPlan.sightseeing.forEach((sightseeingId: string) => {
          const sightseeing = sightseeings.find(s => s.id === sightseeingId);
          if (sightseeing && sightseeing.vehicleCosts) {
            let vehicleCost = 0;
            if (totalPax <= 6) vehicleCost = sightseeing.vehicleCosts.avanza;
            else if (totalPax <= 12) vehicleCost = sightseeing.vehicleCosts.hiace;
            else if (totalPax <= 27) vehicleCost = sightseeing.vehicleCosts.miniBus;
            else if (totalPax <= 32) vehicleCost = sightseeing.vehicleCosts.bus32;
            else vehicleCost = sightseeing.vehicleCosts.bus39;
            
            sightseeingCost += vehicleCost;
            daySightseeingCost += vehicleCost;
          }
        });
      } else {
        dayPlan.sightseeing.forEach((sightseeingId: string) => {
          const sightseeing = sightseeings.find(s => s.id === sightseeingId);
          if (sightseeing) {
            let cost = 0;
            if (sightseeing.transportationMode === 'self-drive-car') {
              cost = 15;
            } else if (sightseeing.transportationMode === 'self-drive-scooter') {
              cost = 8;
            }
            sightseeingCost += cost;
            daySightseeingCost += cost;
          }
        });
      }

      // Activities cost
      dayPlan.activities.forEach((activity: any) => {
        const activityData = activities.find(a => a.id === activity.activityId);
        if (activityData) {
          const option = activityData.options.find(o => o.id === activity.optionId);
          if (option) {
            let activityCost = 0;
            if (option.costForHowMany >= totalPax) {
              activityCost = option.cost;
            } else {
              const groupsNeeded = Math.ceil(totalPax / option.costForHowMany);
              activityCost = option.cost * groupsNeeded;
            }
            activitiesCost += activityCost;
            dayActivitiesCost += activityCost;
          }
        }
      });

      // Entry tickets cost
      dayPlan.entryTickets.forEach((ticketId: string) => {
        const ticket = entryTickets.find(t => t.id === ticketId);
        if (ticket) {
          const cost = ticket.cost * totalPax;
          ticketsCost += cost;
          dayTicketsCost += cost;
        }
      });

      // Meals cost
      dayPlan.meals.forEach((mealId: string) => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
          const cost = meal.cost * totalPax;
          mealsCost += cost;
          dayMealsCost += cost;
        }
      });

      // Add daily breakdown
      const dayTotal = dayAccommodationCost + daySightseeingCost + dayActivitiesCost + dayTicketsCost + dayMealsCost;
      dailyBreakdown.push({
        day: dayPlan.day,
        accommodation: dayAccommodationCost,
        sightseeing: daySightseeingCost,
        activities: dayActivitiesCost,
        tickets: dayTicketsCost,
        meals: dayMealsCost,
        total: dayTotal
      });
    });

    return {
      transportation: transportationCost,
      accommodation: accommodationCost,
      sightseeing: sightseeingCost,
      activities: activitiesCost,
      tickets: ticketsCost,
      meals: mealsCost,
      dailyBreakdown
    };
  };

  const costBreakdown = calculateDetailedCostBreakdown();

  const copyItineraryToClipboard = () => {
    const totalPax = itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children;
    
    let itineraryText = `🌴 TRAVEL ITINERARY 🌴\n\n`;
    itineraryText += `📋 CLIENT DETAILS:\n`;
    itineraryText += `• Client: ${itinerary.client.name}\n`;
    itineraryText += `• Contact: ${itinerary.client.countryCode} ${itinerary.client.whatsapp}\n`;
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

    itineraryText += `💰 PRICING:\n`;
    itineraryText += `• Total Package Price: $${itinerary.finalPrice.toFixed(2)}\n`;
    itineraryText += `• Total Package Price (INR): ₹${(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}\n`;
    itineraryText += `• Exchange Rate: 1 USD = ₹${itinerary.exchangeRate}\n\n`;

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
    itineraryText += `Nomadller Solutions - Travel Agency Management\n`;
    itineraryText += `Professional Travel Planning Services\n\n`;
    
    itineraryText += `Generated on: ${new Date().toLocaleDateString()}\n`;
    itineraryText += `Package ID: ${itinerary.client.id}\n`;

    navigator.clipboard.writeText(itineraryText).then(() => {
      alert('✅ Complete itinerary copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy itinerary. Please try again.');
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Itinerary Complete!</h2>
              <p className="text-green-100 mt-1 text-sm md:text-base">Step 4 of 4 - Final Summary & Export</p>
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
                  Your detailed itinerary for {itinerary.client.name} has been generated and saved.
                </p>
              </div>
            </div>
          </div>

          {/* Client Summary */}
          <div className="bg-slate-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Client:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">{itinerary.client.name}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-slate-500" />
                <div>
                  <span className="text-xs md:text-sm font-medium text-slate-700">Contact:</span>
                  <div className="text-sm md:text-base text-slate-900 font-semibold">
                    {itinerary.client.countryCode} {itinerary.client.whatsapp}
                  </div>
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

          {/* Daily Cost Breakdown */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Daily Cost Analysis
            </h3>
            <p className="text-slate-600 mb-4 text-sm md:text-base">
              Detailed day-by-day cost breakdown for complete transparency
            </p>
            
            <div className="space-y-4">
              {costBreakdown.dailyBreakdown.map((day: any) => (
                <div key={day.day} className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">Day {day.day}</h4>
                    <div className="text-lg font-bold text-indigo-600">${day.total.toFixed(2)}</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                    {day.accommodation > 0 && (
                      <div className="text-center">
                        <div className="text-slate-600">Hotel</div>
                        <div className="font-semibold">${day.accommodation.toFixed(2)}</div>
                      </div>
                    )}
                    {day.sightseeing > 0 && (
                      <div className="text-center">
                        <div className="text-slate-600">Sightseeing</div>
                        <div className="font-semibold">${day.sightseeing.toFixed(2)}</div>
                      </div>
                    )}
                    {day.activities > 0 && (
                      <div className="text-center">
                        <div className="text-slate-600">Activities</div>
                        <div className="font-semibold">${day.activities.toFixed(2)}</div>
                      </div>
                    )}
                    {day.tickets > 0 && (
                      <div className="text-center">
                        <div className="text-slate-600">Tickets</div>
                        <div className="font-semibold">${day.tickets.toFixed(2)}</div>
                      </div>
                    )}
                    {day.meals > 0 && (
                      <div className="text-center">
                        <div className="text-slate-600">Meals</div>
                        <div className="font-semibold">${day.meals.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Detailed Cost Breakdown */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Complete Cost Analysis & Calculations
            </h3>
            <p className="text-slate-600 mb-4 text-sm md:text-base">
              Comprehensive breakdown of all costs with detailed calculations and pricing logic
            </p>
            
            <div className="space-y-6">
              {/* Transportation Analysis */}
              {costBreakdown.transportation > 0 && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Car className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-900">Transportation Analysis</span>
                  </div>
                  <div className="text-sm text-slate-600 mb-2">
                    Vehicle: {itinerary.client.transportationMode} • Duration: {itinerary.client.numberOfDays} days
                  </div>
                  <div className="text-lg font-bold text-slate-900">${costBreakdown.transportation.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Self-drive vehicle rental including fuel and insurance
                  </div>
                </div>
              )}

              {/* Service Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Accommodation</span>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.accommodation.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Hotels & room charges with seasonal pricing</div>
                <div className="text-xs text-slate-500 mt-1">
                  {itinerary.client.numberOfDays} night{itinerary.client.numberOfDays !== 1 ? 's' : ''} • Various locations
                </div>
              </div>

                <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Sightseeing</span>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.sightseeing.toFixed(2)}</div>
                <div className="text-sm text-slate-600">
                  {itinerary.client.transportationMode.toLowerCase().includes('cab') 
                    ? 'Vehicle costs based on group size' 
                    : 'Fuel & parking for self-drive tours'
                  }
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} passengers
                </div>
              </div>

                <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Activities</span>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.activities.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Adventure & experiences with group calculations</div>
                <div className="text-xs text-slate-500 mt-1">
                  Costs calculated per activity capacity requirements
                </div>
              </div>

                <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Entry Tickets</span>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.tickets.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Attraction entries calculated per person</div>
                <div className="text-xs text-slate-500 mt-1">
                  ${costBreakdown.tickets.toFixed(2)} ÷ {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} = ${(costBreakdown.tickets / (itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children)).toFixed(2)} per person
                </div>
              </div>

                <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Utensils className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-slate-900">Meals</span>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.meals.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Food & beverages calculated per person</div>
                <div className="text-xs text-slate-500 mt-1">
                  Various restaurants and meal types included
                </div>
              </div>
              </div>

              {/* Calculation Summary */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Pricing Calculation Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Base Services Total:</span>
                        <span className="font-semibold">${(costBreakdown.transportation + costBreakdown.accommodation + costBreakdown.sightseeing + costBreakdown.activities + costBreakdown.tickets + costBreakdown.meals).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Passenger Count:</span>
                        <span className="font-semibold">{itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trip Duration:</span>
                        <span className="font-semibold">{itinerary.client.numberOfDays} days</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cost per Person:</span>
                        <span className="font-semibold">${(itinerary.totalBaseCost / (itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cost per Day:</span>
                        <span className="font-semibold">${(itinerary.totalBaseCost / itinerary.client.numberOfDays).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Transportation Mode:</span>
                        <span className="font-semibold text-xs">{itinerary.client.transportationMode}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900">${costBreakdown.meals.toFixed(2)}</div>
                <div className="text-sm text-slate-600">Food & beverages</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Subtotal (Base Cost):</span>
                  <span className="font-semibold text-slate-900">${itinerary.totalBaseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Profit Margin:</span>
                  <span className="font-semibold text-slate-900">${itinerary.profitMargin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-slate-900">Total (USD):</span>
                  <span className="text-green-600">${itinerary.finalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center justify-center mt-6">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 text-center">
                  <div className="text-sm font-medium mb-2">Total Package Price</div>
                  <div className="text-2xl font-bold mb-1">${itinerary.finalPrice.toFixed(2)}</div>
                  <div className="text-lg font-semibold text-green-100">
                    ₹{(itinerary.finalPrice * itinerary.exchangeRate).toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-green-100 mt-2">
                    Exchange Rate: 1 USD = ₹{itinerary.exchangeRate}
                  </div>
                </div>
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
                Copy Itinerary
              </button>
            </div>
            <button
              onClick={onStartNew}
              className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Create New Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinalSummary;