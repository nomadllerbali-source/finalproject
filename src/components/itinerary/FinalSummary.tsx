import React from 'react';
import { Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { getSeasonalPrice, getVehicleCostByPax, formatCurrency, convertToIDR } from '../../utils/calculations';
import {
  addLetterheadHeader,
  addPageWithLetterhead,
  addDocumentTitle,
  addInfoBox,
  addDayPlanBox,
  addPricingBox,
  addInclusionsExclusions,
  finalizeLetterheadPDF,
  MARGINS
} from '../../utils/pdfLetterhead';
import { Copy, MessageCircle, Calendar, Users, MapPin, Building2, Camera, Ticket, Utensils, CheckCircle, Phone, Download } from 'lucide-react';

interface FinalSummaryProps {
  itinerary: Itinerary;
  onBack: () => void;
  onStartNew: () => void;
}

const FinalSummary: React.FC<FinalSummaryProps> = ({ itinerary, onBack, onStartNew }) => {
  const { state, dispatch } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  
  React.useEffect(() => {
    dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
  }, [itinerary, dispatch]);

  // Calculate detailed cost breakdown
  const calculateDetailedBreakdown = () => {
    const breakdown = {
      transportation: 0,
      hotels: [] as Array<{ name: string; roomType: string; nights: number; pricePerNight: number; total: number }>,
      sightseeing: [] as Array<{ name: string; vehicleCost: number; days: number }>,
      activities: [] as Array<{ name: string; option: string; cost: number; costForHowMany: number; totalCost: number }>,
      entryTickets: [] as Array<{ name: string; costPerPerson: number; totalCost: number }>,
      meals: [] as Array<{ type: string; place: string; costPerPerson: number; totalCost: number }>
    };

    const totalPax = itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children;

    // Transportation cost
    const transportation = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
    if (transportation && transportation.type !== 'cab') {
      breakdown.transportation = transportation.costPerDay * itinerary.client.numberOfDays;
    }

    // Hotel costs
    const hotelStays = new Map<string, { hotel: any; roomType: any; nights: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          const key = `${hotel.id}-${roomType.id}`;
          if (hotelStays.has(key)) {
            hotelStays.get(key)!.nights++;
          } else {
            hotelStays.set(key, { hotel, roomType, nights: 1 });
          }
        }
      }
    });

    hotelStays.forEach(({ hotel, roomType, nights }) => {
      const pricePerNight = getSeasonalPrice(roomType, itinerary.client.travelDates.startDate);
      breakdown.hotels.push({
        name: hotel.name,
        roomType: roomType.name,
        nights,
        pricePerNight,
        total: pricePerNight * nights
      });
    });

    // Sightseeing costs (for cab mode)
    const cabTransportation = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
    if (cabTransportation && cabTransportation.type === 'cab') {
      const sightseeingCosts = new Map<string, { cost: number; days: number }>();
      itinerary.dayPlans.forEach(dayPlan => {
        dayPlan.sightseeing.forEach(sightseeingId => {
          const sightseeing = sightseeings.find(s => s.id === sightseeingId);
          if (sightseeing && sightseeing.transportationMode === 'cab' && sightseeing.vehicleCosts) {
            const vehicleCost = getVehicleCostByPax(sightseeing, totalPax);
            if (sightseeingCosts.has(sightseeing.name)) {
              const existing = sightseeingCosts.get(sightseeing.name)!;
              sightseeingCosts.set(sightseeing.name, { cost: vehicleCost, days: existing.days + 1 });
            } else {
              sightseeingCosts.set(sightseeing.name, { cost: vehicleCost, days: 1 });
            }
          }
        });
      });
      
      sightseeingCosts.forEach((data, name) => {
        breakdown.sightseeing.push({ name, vehicleCost: data.cost * data.days, days: data.days });
      });
    }

    // Activity costs
    const activityCosts = new Map<string, { option: string; cost: number; costForHowMany: number; count: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.activities.forEach(a => {
        const activity = activities.find(act => act.id === a.activityId);
        const option = activity?.options.find(opt => opt.id === a.optionId);
        if (activity && option) {
          const key = `${activity.name}-${option.name}`;
          if (activityCosts.has(key)) {
            activityCosts.get(key)!.count++;
          } else {
            activityCosts.set(key, { option: option.name, cost: option.cost, costForHowMany: option.costForHowMany, count: 1 });
          }
        }
      });
    });

    activityCosts.forEach((data, name) => {
      const groupsNeeded = Math.ceil(totalPax / data.costForHowMany);
      const totalCost = data.cost * groupsNeeded * data.count;
      breakdown.activities.push({
        name: name.split('-')[0],
        option: data.option,
        cost: data.cost,
        costForHowMany: data.costForHowMany,
        totalCost: totalCost
      });
    });

    // Entry ticket costs
    const ticketCosts = new Map<string, { costPerPerson: number; count: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.entryTickets.forEach(ticketId => {
        const ticket = entryTickets.find(t => t.id === ticketId);
        if (ticket) {
          if (ticketCosts.has(ticket.name)) {
            ticketCosts.get(ticket.name)!.count++;
          } else {
            ticketCosts.set(ticket.name, { costPerPerson: ticket.cost, count: 1 });
          }
        }
      });
    });

    ticketCosts.forEach((data, name) => {
      breakdown.entryTickets.push({
        name,
        costPerPerson: data.costPerPerson,
        totalCost: data.costPerPerson * totalPax * data.count
      });
    });

    // Meal costs
    const mealCosts = new Map<string, { type: string; costPerPerson: number; count: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.meals.forEach(mealId => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) {
          const key = `${meal.type}-${meal.place}`;
          if (mealCosts.has(key)) {
            mealCosts.get(key)!.count++;
          } else {
            mealCosts.set(key, { type: meal.type, costPerPerson: meal.cost, count: 1 });
          }
        }
      });
    });

    mealCosts.forEach((data, name) => {
      const [type, place] = name.split('-');
      breakdown.meals.push({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        place,
        costPerPerson: data.costPerPerson,
        totalCost: data.costPerPerson * totalPax * data.count
      });
    });

    return breakdown;
  };

  const costBreakdown = calculateDetailedBreakdown();
  const totalPax = itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children;
  const generateWhatsAppText = () => {
    let text = `*TRAVEL ITINERARY*\n\n`;
    text += `*Client:* ${itinerary.client.name}\n`;
    text += `*WhatsApp:* ${itinerary.client.countryCode} ${itinerary.client.whatsapp}\n`;
    
    if (itinerary.client.travelDates.isFlexible) {
      text += `*Travel Month:* ${itinerary.client.travelDates.flexibleMonth}\n`;
    } else {
      const startDate = new Date(itinerary.client.travelDates.startDate).toLocaleDateString();
      const endDate = new Date(itinerary.client.travelDates.endDate).toLocaleDateString();
      text += `*Travel Dates:* ${startDate} to ${endDate}\n`;
    }
    
    text += `*Duration:* ${itinerary.client.numberOfDays} days\n`;
    text += `*Passengers:* ${itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax (${itinerary.client.numberOfPax.adults} adults, ${itinerary.client.numberOfPax.children} children)\n\n`;

    // Day-by-day itinerary
    text += `*DETAILED ITINERARY*\n\n`;
    itinerary.dayPlans.forEach(dayPlan => {
      text += `*Day ${dayPlan.day}:*\n`;
      
      // Sightseeing
      const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
      if (selectedSightseeing.length > 0) {
        text += `📍 *Sightseeing:*\n`;
        selectedSightseeing.forEach(sight => {
          text += `\n*${sight.name}*\n`;
          if (sight.description) {
            text += `${sight.description}\n`;
          }
        });
        text += `\n`;
      }

      // Activities
      const selectedActivities = dayPlan.activities.map(a => {
        const activity = activities.find(act => act.id === a.activityId);
        const option = activity?.options.find(opt => opt.id === a.optionId);
        return { activity, option };
      }).filter(item => item.activity && item.option);
      
      if (selectedActivities.length > 0) {
        text += `🎯 *Activities:*\n`;
        selectedActivities.forEach(item => {
          text += `   • ${item.activity?.name} - ${item.option?.name}\n`;
        });
      }

      // Hotel
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          text += `🏨 *Hotel:* ${hotel.name} - ${roomType.name}, ${hotel.place}\n`;
        }
      }

      // Meals
      const selectedMeals = meals.filter(m => dayPlan.meals.includes(m.id));
      if (selectedMeals.length > 0) {
        text += `🍽️ *Meals:*\n`;
        selectedMeals.forEach(meal => {
          text += `   • ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place}\n`;
        });
      }
      
      text += `\n`;
    });

    // Inclusions
    text += `*INCLUSIONS:*\n`;
    
    // Transportation
    const transport = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
    if (transport) {
      if (transport.type === 'cab') {
        text += `✅ Private cab for all transfers and sightseeing as per the itinerary\n`;
      } else {
        text += `✅ ${itinerary.client.numberOfDays} days ${transport.vehicleName} rental\n`;
      }
    }

    // Hotels
    const hotelStays = new Map<string, { hotel: any; roomType: any; nights: number }>();
    itinerary.dayPlans.forEach(dayPlan => {
      if (dayPlan.hotel) {
        const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (hotel && roomType) {
          const key = `${hotel.id}-${roomType.id}`;
          if (hotelStays.has(key)) {
            hotelStays.get(key)!.nights++;
          } else {
            hotelStays.set(key, { hotel, roomType, nights: 1 });
          }
        }
      }
    });

    hotelStays.forEach(({ hotel, roomType, nights }) => {
      text += `✅ ${nights} night${nights > 1 ? 's' : ''} stay at ${hotel.name} in ${roomType.name}\n`;
    });

    // Activities summary
    const allActivities = new Set();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.activities.forEach(a => {
        const activity = activities.find(act => act.id === a.activityId);
        const option = activity?.options.find(opt => opt.id === a.optionId);
        if (activity && option) {
          allActivities.add(`${activity.name} - ${option.name}`);
        }
      });
    });
    allActivities.forEach(activity => {
      text += `✅ ${activity}\n`;
    });

    // Entry tickets
    const allTickets = new Set();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.entryTickets.forEach(ticketId => {
        const ticket = entryTickets.find(t => t.id === ticketId);
        if (ticket) allTickets.add(ticket.name);
      });
    });
    allTickets.forEach(ticket => {
      text += `✅ ${ticket}\n`;
    });

    // Meals
    const allMeals = new Set();
    itinerary.dayPlans.forEach(dayPlan => {
      dayPlan.meals.forEach(mealId => {
        const meal = meals.find(m => m.id === mealId);
        if (meal) allMeals.add(`${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place}`);
      });
    });
    allMeals.forEach(meal => {
      text += `✅ ${meal}\n`;
    });

    text += `\n*EXCLUSIONS:*\n`;
    text += `❌ Airfare\n`;
    text += `❌ Visa\n`;
    text += `❌ Any meal not mentioned in the itinerary\n`;
    text += `❌ Anything not mentioned in inclusions\n\n`;

    text += `*TOTAL COST:*\n`;
    text += `💵 ${formatCurrency(itinerary.finalPrice, 'USD')}\n`;
    text += `💰 ${formatCurrency(convertToIDR(itinerary.finalPrice, itinerary.exchangeRate), 'IDR')}\n\n`;
    text += `Thank you for choosing our travel services! 🌟`;

    return text;
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('Starting PDF generation...');
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      console.log('jsPDF loaded');

      // Add letterhead header
      addLetterheadHeader(doc);
      console.log('Letterhead header added');

      let yPosition = MARGINS.contentStart;

      // Document title
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      yPosition = addDocumentTitle(doc, 'TRAVEL ITINERARY', `Generated on ${today}`, yPosition);

      // Client Information Box
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

      // Day-by-day itinerary
      itinerary.dayPlans.forEach(dayPlan => {
        const dayContent: { title: string; items: string[] }[] = [];

        // Sightseeing
        const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
        if (selectedSightseeing.length > 0) {
          dayContent.push({
            title: 'Sightseeing',
            items: selectedSightseeing.map(s => s.description ? `${s.name} - ${s.description}` : s.name)
          });
        }

        // Activities
        const selectedActivities = dayPlan.activities.map((a: any) => {
          const activity = activities.find(act => act.id === a.activityId);
          const option = activity?.options.find(opt => opt.id === a.optionId);
          return { activity, option };
        }).filter((item: any) => item.activity && item.option);

        if (selectedActivities.length > 0) {
          dayContent.push({
            title: 'Activities',
            items: selectedActivities.map((item: any) => `${item.activity?.name} - ${item.option?.name}`)
          });
        }

        // Entry Tickets
        const selectedTickets = entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
        if (selectedTickets.length > 0) {
          dayContent.push({
            title: 'Entry Tickets',
            items: selectedTickets.map(t => t.name)
          });
        }

        // Meals
        const selectedMeals = dayPlan.meals.map((m: any) => {
          const meal = meals.find(meal => meal.id === m.mealId);
          return meal;
        }).filter(Boolean);

        if (selectedMeals.length > 0) {
          dayContent.push({
            title: 'Meals',
            items: selectedMeals.map((m: any) => `${m.mealType} at ${m.placeName}`)
          });
        }

        // Hotel
        if (dayPlan.hotel) {
          const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
          const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
          if (hotel && roomType) {
            dayContent.push({
              title: 'Accommodation',
              items: [`${hotel.name} - ${roomType.name}`]
            });
          }
        }

        yPosition = addDayPlanBox(doc, dayPlan.day, dayContent, yPosition);
      });

      // Total pricing only
      const pricingItems = [{
        label: 'TOTAL PACKAGE PRICE',
        usd: formatCurrency(itinerary.finalPrice, 'USD'),
        idr: formatCurrency(convertToIDR(itinerary.finalPrice, itinerary.exchangeRate), 'IDR')
      }];

      yPosition = addPricingBox(doc, pricingItems, yPosition);

      // Inclusions and Exclusions
      const inclusions = [
        'Accommodation as per itinerary',
        'Transportation in private vehicle',
        'All entry tickets and permits',
        'Meals as mentioned in itinerary',
        'Professional English-speaking guide',
        'All applicable taxes'
      ];

      // Add activities to inclusions
      const allActivitiesForInclusions = new Set<string>();
      itinerary.dayPlans.forEach(dayPlan => {
        dayPlan.activities.forEach((a: any) => {
          const activity = activities.find(act => act.id === a.activityId);
          const option = activity?.options.find(opt => opt.id === a.optionId);
          if (activity && option) {
            allActivitiesForInclusions.add(`${activity.name} - ${option.name}`);
          }
        });
      });

      if (allActivitiesForInclusions.size > 0) {
        inclusions.push('**Activities:**');
        allActivitiesForInclusions.forEach(activityStr => {
          inclusions.push(`  ${activityStr}`);
        });
      }

      const exclusions = [
        'International/domestic airfare',
        'Travel insurance',
        'Personal expenses and tips',
        'Meals not mentioned in itinerary',
        'Visa fees and documentation',
        'Emergency medical expenses'
      ];

      yPosition = addInclusionsExclusions(doc, inclusions, exclusions, yPosition);

      // Finalize with footers
      console.log('Finalizing PDF with footers...');
      finalizeLetterheadPDF(doc);

      // Generate filename with client name and date
      const today = new Date().toISOString().split('T')[0];
      const filename = `${itinerary.client.name.replace(/\s+/g, '_')}_Itinerary_${today}.pdf`;

      console.log('Saving PDF:', filename);
      doc.save(filename);
      console.log('PDF saved successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const copyToClipboard = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text).then(() => {
      alert('Itinerary copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const openWhatsApp = () => {
    const text = generateWhatsAppText();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${itinerary.client.countryCode}${itinerary.client.whatsapp}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const renderDayPlanSummary = (dayPlan: any) => {
    const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
    const selectedActivities = dayPlan.activities.map((a: any) => {
      const activity = activities.find(act => act.id === a.activityId);
      const option = activity?.options.find(opt => opt.id === a.optionId);
      return { activity, option };
    }).filter((item: any) => item.activity && item.option);
    
    let hotel = null;
    if (dayPlan.hotel) {
      const hotelData = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
      const roomType = hotelData?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
      if (hotelData && roomType) {
        hotel = { hotel: hotelData, roomType };
      }
    }
    
    const selectedTickets = entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
    const selectedMeals = meals.filter(m => dayPlan.meals.includes(m.id));
    
    return {
      sightseeing: selectedSightseeing,
      activities: selectedActivities,
      hotel,
      tickets: selectedTickets,
      meals: selectedMeals
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Final Itinerary Summary
          </h1>
          <p className="text-slate-600 text-lg">
            Complete travel package ready to share with your client
          </p>
        </div>

        <div className="p-8">
          {/* Client Details Header */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Travel Package for {itinerary.client.name}</h3>
              <div className="text-right">
                <div className="space-y-1">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {formatCurrency(itinerary.finalPrice, 'USD')}
                  </div>
                  <div className="text-lg md:text-xl font-bold text-blue-600">
                    {formatCurrency(convertToIDR(itinerary.finalPrice, itinerary.exchangeRate), 'IDR')}
                  </div>
                  <div className="text-xs md:text-sm text-slate-600">Total Package Price</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Contact</div>
                  <div className="text-slate-900">{itinerary.client.countryCode} {itinerary.client.whatsapp}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Duration</div>
                  <div className="text-slate-900">{itinerary.client.numberOfDays} days</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Passengers</div>
                  <div className="text-slate-900">{itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} pax</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-slate-700">Transport</div>
                  <div className="text-slate-900">{itinerary.client.transportationMode}</div>
                </div>
              </div>
            </div>

            {!itinerary.client.travelDates.isFlexible && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm font-medium text-slate-700">Travel Dates</div>
                <div className="text-slate-900">
                  {new Date(itinerary.client.travelDates.startDate).toLocaleDateString()} to{' '}
                  {new Date(itinerary.client.travelDates.endDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Itinerary */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <h3 className="text-lg font-bold text-slate-900">Detailed Day-by-Day Itinerary</h3>
            
            {itinerary.dayPlans.map((dayPlan) => {
              const summary = renderDayPlanSummary(dayPlan);
              
              return (
                <div key={dayPlan.day} className="border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Day {dayPlan.day}
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {/* Sightseeing */}
                      {summary.sightseeing.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-slate-900 flex items-center mb-3">
                            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                            Sightseeing Spots
                          </h5>
                          <div className="space-y-3">
                            {summary.sightseeing.map((sight: any) => (
                              <div key={sight.id} className="ml-2">
                                <div className="font-bold text-slate-900 text-base">{sight.name}</div>
                                <div className="text-slate-600 text-sm mt-1">{sight.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Activities */}
                      {summary.activities.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-slate-900 flex items-center mb-2">
                            <Camera className="h-4 w-4 mr-2 text-blue-600" />
                            Activities
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.activities.map((item: any, index: number) => (
                              <li key={index} className="flex items-center">
                                <span className="text-blue-600 mr-2">•</span>
                                <span className="font-medium">{item.activity?.name}</span>
                                <span className="mx-2">-</span>
                                <span>{item.option?.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {/* Hotel */}
                      {summary.hotel && (
                        <div>
                          <h5 className="font-semibold text-slate-900 flex items-center mb-2">
                            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                            Accommodation
                          </h5>
                          <div className="text-sm text-slate-700 ml-6">
                            <div className="font-medium">{summary.hotel.hotel.name}</div>
                            <div className="text-slate-600">{summary.hotel.roomType.name}</div>
                            <div className="text-slate-600">{summary.hotel.hotel.place}</div>
                          </div>
                        </div>
                      )}

                      {/* Entry Tickets */}
                      {summary.tickets.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-slate-900 flex items-center mb-2">
                            <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                            Entry Tickets
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.tickets.map((ticket: any) => (
                              <li key={ticket.id}>• {ticket.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Meals */}
                      {summary.meals.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-slate-900 flex items-center mb-2">
                            <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                            Meals Included
                          </h5>
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

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-green-50 rounded-xl p-4 md:p-6">
              <h4 className="font-bold text-green-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Package Inclusions
              </h4>
              <ul className="space-y-2 text-sm">
                {(() => {
                  const transport = transportations.find(t => t.vehicleName === itinerary.client.transportationMode);
                  if (transport) {
                    if (transport.type === 'cab') {
                      return <li className="flex items-start"><span className="text-green-600 mr-2">✓</span>Private cab for all transfers and sightseeing as per the itinerary</li>;
                    } else {
                      return <li className="flex items-start"><span className="text-green-600 mr-2">✓</span>{itinerary.client.numberOfDays} days {transport.vehicleName} rental</li>;
                    }
                  }
                })()}
                
                {/* Hotels */}
                {(() => {
                  const hotelStays = new Map();
                  itinerary.dayPlans.forEach(dayPlan => {
                    if (dayPlan.hotel) {
                      const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
                      const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
                      if (hotel && roomType) {
                        const key = `${hotel.id}-${roomType.id}`;
                        if (hotelStays.has(key)) {
                          hotelStays.get(key).nights++;
                        } else {
                          hotelStays.set(key, { hotel, roomType, nights: 1 });
                        }
                      }
                    }
                  });

                  return Array.from(hotelStays.values()).map(({ hotel, roomType, nights }, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {nights} night{nights > 1 ? 's' : ''} stay at {hotel.name} in {roomType.name}
                    </li>
                  ));
                })()}

                {/* Activities */}
                {(() => {
                  const allActivities = new Set();
                  itinerary.dayPlans.forEach(dayPlan => {
                    dayPlan.activities.forEach((a: any) => {
                      const activity = activities.find(act => act.id === a.activityId);
                      const option = activity?.options.find(opt => opt.id === a.optionId);
                      if (activity && option) {
                        allActivities.add(`${activity.name} - ${option.name}`);
                      }
                    });
                  });
                  return Array.from(allActivities).map((activity: any, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {activity}
                    </li>
                  ));
                })()}

                {/* Entry tickets */}
                {(() => {
                  const allTickets = new Set();
                  itinerary.dayPlans.forEach(dayPlan => {
                    dayPlan.entryTickets.forEach(ticketId => {
                      const ticket = entryTickets.find(t => t.id === ticketId);
                      if (ticket) allTickets.add(ticket.name);
                    });
                  });
                  return Array.from(allTickets).map((ticket: any, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {ticket}
                    </li>
                  ));
                })()}

                {/* Meals */}
                {(() => {
                  const allMeals = new Set();
                  itinerary.dayPlans.forEach(dayPlan => {
                    dayPlan.meals.forEach(mealId => {
                      const meal = meals.find(m => m.id === mealId);
                      if (meal) allMeals.add(`${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place}`);
                    });
                  });
                  return Array.from(allMeals).map((meal: any, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      {meal}
                    </li>
                  ));
                })()}
              </ul>
            </div>

            <div className="bg-red-50 rounded-xl p-4 md:p-6">
              <h4 className="font-bold text-red-900 mb-4">Package Exclusions</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start"><span className="text-red-600 mr-2">✗</span>Airfare</li>
                <li className="flex items-start"><span className="text-red-600 mr-2">✗</span>Visa</li>
                <li className="flex items-start"><span className="text-red-600 mr-2">✗</span>Any meal not mentioned in the itinerary</li>
                <li className="flex items-start"><span className="text-red-600 mr-2">✗</span>Anything not mentioned in inclusions</li>
              </ul>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-4 md:p-6 text-center mb-6 md:mb-8">
            <h3 className="text-2xl font-bold mb-2">Total Package Price</h3>
            <div className="space-y-2 mb-4">
              <div className="text-3xl md:text-4xl font-bold">
                {formatCurrency(itinerary.finalPrice, 'USD')}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-green-100">
                {formatCurrency(convertToIDR(itinerary.finalPrice, itinerary.exchangeRate), 'IDR')}
              </div>
            </div>
            <p className="text-green-100">
              Complete travel package for {itinerary.client.numberOfPax.adults + itinerary.client.numberOfPax.children} passengers
            </p>
            {itinerary.profitMargin > 0 && (
              <div className="mt-4 pt-4 border-t border-green-400 border-opacity-50">
                <div className="text-sm space-y-2 md:space-y-0 md:grid md:grid-cols-2 gap-4 max-w-md mx-auto">
                  <div>
                    <div className="font-medium">Base Cost:</div>
                    <div>{formatCurrency(itinerary.totalBaseCost, 'USD')}</div>
                    <div className="text-xs">{formatCurrency(convertToIDR(itinerary.totalBaseCost, itinerary.exchangeRate), 'IDR')}</div>
                  </div>
                  <div>
                    <div className="font-medium">Your Profit:</div>
                    <div>{formatCurrency(itinerary.profitMargin, 'USD')}</div>
                    <div className="text-xs">{formatCurrency(convertToIDR(itinerary.profitMargin, itinerary.exchangeRate), 'IDR')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Cost Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 md:mb-8">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Detailed Cost Breakdown</h3>
              <p className="text-slate-600 text-sm">Complete breakdown of all costs included in this package</p>
            </div>
            
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Transportation */}
              {costBreakdown.transportation > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    Transportation
                  </h4>
                  <div className="ml-11">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700 text-sm md:text-base">
                        {itinerary.client.numberOfDays} days {itinerary.client.transportationMode} rental
                      </span>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{formatCurrency(costBreakdown.transportation, 'USD')}</div>
                        <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(costBreakdown.transportation, itinerary.exchangeRate), 'IDR')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hotels */}
              {costBreakdown.hotels.length > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    Accommodation
                  </h4>
                  <div className="ml-11 space-y-2">
                    {costBreakdown.hotels.map((hotel, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-slate-700 flex-1 mr-4">
                          <div className="font-medium">{hotel.name} - {hotel.roomType}</div>
                          <div className="text-sm text-slate-500">
                            {hotel.nights} night{hotel.nights > 1 ? 's' : ''} × {formatCurrency(hotel.pricePerNight, 'USD')}/night
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(hotel.total, 'USD')}</div>
                          <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(hotel.total, itinerary.exchangeRate), 'IDR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sightseeing Vehicle Costs */}
              {costBreakdown.sightseeing.length > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-teal-100 p-2 rounded-lg mr-3">
                      <MapPin className="h-4 w-4 text-teal-600" />
                    </div>
                    Sightseeing Transportation
                  </h4>
                  <div className="ml-11 space-y-2">
                    {costBreakdown.sightseeing.map((sight, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-slate-700 flex-1 mr-4">
                          <div className="font-medium">{sight.name}</div>
                          <div className="text-sm text-slate-500">
                            Vehicle cost for {totalPax} passengers × {sight.days} day{sight.days > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(sight.vehicleCost, 'USD')}</div>
                          <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(sight.vehicleCost, itinerary.exchangeRate), 'IDR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {costBreakdown.activities.length > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-orange-100 p-2 rounded-lg mr-3">
                      <Camera className="h-4 w-4 text-orange-600" />
                    </div>
                    Activities
                  </h4>
                  <div className="ml-11 space-y-2">
                    {costBreakdown.activities.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-slate-700 flex-1 mr-4">
                          <div className="font-medium">{activity.name} - {activity.option}</div>
                          <div className="text-sm text-slate-500">
                            {formatCurrency(activity.cost, 'USD')} for {activity.costForHowMany} {activity.costForHowMany === 1 ? 'person' : 'people'} × {Math.ceil(totalPax / activity.costForHowMany)} group{Math.ceil(totalPax / activity.costForHowMany) > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(activity.totalCost, 'USD')}</div>
                          <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(activity.totalCost, itinerary.exchangeRate), 'IDR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entry Tickets */}
              {costBreakdown.entryTickets.length > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                      <Ticket className="h-4 w-4 text-indigo-600" />
                    </div>
                    Entry Tickets
                  </h4>
                  <div className="ml-11 space-y-2">
                    {costBreakdown.entryTickets.map((ticket, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-slate-700 flex-1 mr-4">
                          <div className="font-medium">{ticket.name}</div>
                          <div className="text-sm text-slate-500">
                            {formatCurrency(ticket.costPerPerson, 'USD')}/person × {totalPax} passengers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(ticket.totalCost, 'USD')}</div>
                          <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(ticket.totalCost, itinerary.exchangeRate), 'IDR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meals */}
              {costBreakdown.meals.length > 0 && (
                <div className="border-b border-slate-200 pb-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <Utensils className="h-4 w-4 text-green-600" />
                    </div>
                    Meals
                  </h4>
                  <div className="ml-11 space-y-2">
                    {costBreakdown.meals.map((meal, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="text-slate-700 flex-1 mr-4">
                          <div className="font-medium">{meal.type} at {meal.place}</div>
                          <div className="text-sm text-slate-500">
                            {formatCurrency(meal.costPerPerson, 'USD')}/person × {totalPax} passengers
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">{formatCurrency(meal.totalCost, 'USD')}</div>
                          <div className="text-xs text-slate-600">{formatCurrency(convertToIDR(meal.totalCost, itinerary.exchangeRate), 'IDR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-slate-900">Subtotal (Base Cost):</span>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">{formatCurrency(itinerary.totalBaseCost, 'USD')}</div>
                      <div className="text-sm text-slate-600">{formatCurrency(convertToIDR(itinerary.totalBaseCost, itinerary.exchangeRate), 'IDR')}</div>
                    </div>
                  </div>
                  {itinerary.profitMargin > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-700">Agent Commission/Profit:</span>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{formatCurrency(itinerary.profitMargin, 'USD')}</div>
                        <div className="text-sm text-slate-600">{formatCurrency(convertToIDR(itinerary.profitMargin, itinerary.exchangeRate), 'IDR')}</div>
                      </div>
                    </div>
                  )}
                  <div className="border-t border-slate-300 pt-2">
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-slate-900">Total Package Price:</span>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{formatCurrency(itinerary.finalPrice, 'USD')}</div>
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(convertToIDR(itinerary.finalPrice, itinerary.exchangeRate), 'IDR')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-4 md:mb-6">
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-5 w-5 mr-2" />
              Copy Itinerary for WhatsApp
            </button>
            <button
              onClick={openWhatsApp}
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Send via WhatsApp
            </button>
          </div>

          <div className="flex justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Previous Step
            </button>
            <button
              onClick={onStartNew}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Create New Itinerary
              <Calendar className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSummary;