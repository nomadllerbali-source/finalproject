import { DayPlan, Client, Hotel, RoomType, Sightseeing, Activity, EntryTicket, Meal, Transportation } from '../types';

export const getSeasonalPrice = (
  roomType: RoomType,
  startDate: string
): number => {
  const date = new Date(startDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Peak season: Dec 20 - Jan 5
  if ((month === 12 && day >= 20) || (month === 1 && day <= 5)) {
    return roomType.peakSeasonPrice;
  }
  
  // Season: July 1 - Aug 31
  if (month === 7 || month === 8) {
    return roomType.seasonPrice;
  }
  
  // Off-season: all other dates
  return roomType.offSeasonPrice;
};

export const getVehicleCostByPax = (
  sightseeing: Sightseeing,
  totalPax: number
): number => {
  if (!sightseeing.vehicleCosts) return 0;

  if (totalPax <= 6) return sightseeing.vehicleCosts.avanza;
  if (totalPax <= 12) return sightseeing.vehicleCosts.hiace;
  if (totalPax <= 27) return sightseeing.vehicleCosts.miniBus;
  if (totalPax <= 32) return sightseeing.vehicleCosts.bus32;
  return sightseeing.vehicleCosts.bus39;
};

export const calculateItineraryCost = (
  client: Client,
  dayPlans: DayPlan[],
  hotels: Hotel[],
  sightseeings: Sightseeing[],
  activities: Activity[],
  entryTickets: EntryTicket[],
  meals: Meal[],
  transportations: Transportation[]
): number => {
  let totalCost = 0;
  const totalPax = client.numberOfPax.adults + client.numberOfPax.children;

  // Transportation cost (if self-drive)
  const transportation = transportations.find(t => t.vehicleName === client.transportationMode);
  if (transportation && transportation.type !== 'cab') {
    totalCost += transportation.costPerDay * client.numberOfDays;
  }

  dayPlans.forEach(dayPlan => {
    // Hotel cost
    if (dayPlan.hotel) {
      const hotel = hotels.find(h => h.id === dayPlan.hotel!.hotelId);
      if (hotel) {
        const roomType = hotel.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
        if (roomType) {
          const seasonalPrice = getSeasonalPrice(roomType, client.travelDates.startDate);
          totalCost += seasonalPrice;
        }
      }
    }

    // Sightseeing vehicle costs (for cab mode)
    const transportMode = client.transportationMode.toLowerCase();
    if (transportMode.includes('cab') || transportMode === 'private cab service') {
      dayPlan.sightseeing.forEach(sightseeingId => {
        const sightseeing = sightseeings.find(s => s.id === sightseeingId);
        if (sightseeing && sightseeing.transportationMode === 'cab') {
          totalCost += getVehicleCostByPax(sightseeing, totalPax);
        }
      });
    } else {
      // For self-drive modes, add a base sightseeing cost per location
      dayPlan.sightseeing.forEach(sightseeingId => {
        const sightseeing = sightseeings.find(s => s.id === sightseeingId);
        if (sightseeing) {
          // Add a standard cost for self-drive sightseeing (fuel, parking, etc.)
          if (sightseeing.transportationMode === 'self-drive-car') {
            totalCost += 15; // Base cost for car sightseeing
          } else if (sightseeing.transportationMode === 'self-drive-scooter') {
            totalCost += 8; // Base cost for scooter sightseeing
          }
        }
      });
    }

    // Activities cost
    dayPlan.activities.forEach(activity => {
      const activityData = activities.find(a => a.id === activity.activityId);
      if (activityData) {
        const option = activityData.options.find(o => o.id === activity.optionId);
        if (option) {
          // Calculate cost based on how many people the option covers
          if (option.costForHowMany >= totalPax) {
            // If option covers all passengers or more, charge once
            totalCost += option.cost;
          } else {
            // If option covers fewer passengers, multiply by number of passengers
            const groupsNeeded = Math.ceil(totalPax / option.costForHowMany);
            totalCost += option.cost * groupsNeeded;
          }
        }
      }
    });

    // Entry tickets cost
    dayPlan.entryTickets.forEach(ticketId => {
      const ticket = entryTickets.find(t => t.id === ticketId);
      if (ticket) {
        totalCost += ticket.cost * totalPax;
      }
    });

    // Meals cost
    dayPlan.meals.forEach(mealId => {
      const meal = meals.find(m => m.id === mealId);
      if (meal) {
        totalCost += meal.cost * totalPax;
      }
    });
  });

  return totalCost;
};

export const convertToINR = (usdAmount: number, exchangeRate: number = 83): number => {
  return usdAmount * exchangeRate;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'INR' = 'USD'): string => {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }
  return `$${amount.toFixed(2)}`;
};
// Helper function to recalculate itinerary costs when data changes
export const recalculateItineraryCosts = (
  itinerary: any,
  hotels: any[],
  sightseeings: any[],
  activities: any[],
  entryTickets: any[],
  meals: any[],
  transportations: any[]
): { updatedBaseCost: number; updatedFinalPrice: number } => {
  const updatedBaseCost = calculateItineraryCost(
    itinerary.client,
    itinerary.dayPlans,
    hotels,
    sightseeings,
    activities,
    entryTickets,
    meals,
    transportations
  );
  
  const updatedFinalPrice = updatedBaseCost + (itinerary.profitMargin || 0);
  
  return { updatedBaseCost, updatedFinalPrice };
};

// Helper function to check if costs need updating
export const shouldUpdateCosts = (
  storedBaseCost: number,
  calculatedBaseCost: number,
  tolerance: number = 0.01
): boolean => {
  return Math.abs(storedBaseCost - calculatedBaseCost) > tolerance;
};