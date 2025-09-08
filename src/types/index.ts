// Base Types
export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  countryCode: string;
  travelDates: {
    startDate: string;
    endDate: string;
    isFlexible: boolean;
    flexibleMonth: string;
  };
  numberOfPax: {
    adults: number;
    children: number;
  };
  numberOfDays: number;
  transportationMode: string;
  createdAt: string;
  createdBy?: string;
  followUpStatus?: FollowUpStatus;
  followUpHistory?: FollowUpRecord[];
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
}

export interface FollowUpStatus {
  status: 'itinerary-created' | 'itinerary-sent' | '1st-follow-up' | '2nd-follow-up' | '3rd-follow-up' | '4th-follow-up' | 'itinerary-edited' | 'updated-itinerary-sent' | 'advance-paid-confirmed' | 'dead';
  updatedAt: string;
  remarks: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
}

export interface FollowUpRecord {
  id: string;
  clientId?: string;
  status: FollowUpStatus['status'];
  remarks: string;
  updatedAt: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  updatedBy: string;
}

export interface Transportation {
  id: string;
  type: 'cab' | 'self-drive-car' | 'self-drive-scooter';
  vehicleName: string;
  costPerDay: number;
}

export interface RoomType {
  id: string;
  name: string;
  peakSeasonPrice: number;
  seasonPrice: number;
  offSeasonPrice: number;
}

export interface Hotel {
  id: string;
  name: string;
  place: string;
  starCategory: '3-star' | '4-star' | '5-star';
  roomTypes: RoomType[];
}

export interface VehicleCost {
  avanza: number;
  hiace: number;
  miniBus: number;
  bus32: number;
  bus39: number;
}

export interface Sightseeing {
  id: string;
  name: string;
  description: string;
  transportationMode: 'cab' | 'self-drive-car' | 'self-drive-scooter';
  vehicleCosts?: VehicleCost;
}

export interface ActivityOption {
  id: string;
  name: string;
  cost: number;
  costForHowMany: number;
}

export interface Activity {
  id: string;
  name: string;
  location: string;
  options: ActivityOption[];
}

export interface EntryTicket {
  id: string;
  name: string;
  cost: number;
  sightseeingId: string;
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  place: string;
  cost: number;
}

export interface DayPlan {
  day: number;
  sightseeing: string[];
  hotel: {
    place: string;
    hotelId: string;
    roomTypeId: string;
  } | null;
  activities: {
    activityId: string;
    optionId: string;
  }[];
  entryTickets: string[];
  meals: string[];
}

export interface Itinerary {
  client: Client;
  dayPlans: DayPlan[];
  totalBaseCost: number;
  profitMargin: number;
  finalPrice: number;
  exchangeRate: number;
  id: string;
  version: number;
  lastUpdated: string;
  updatedBy: string;
  changeLog: ItineraryChange[];
}

export interface ItineraryChange {
  id: string;
  version: number;
  changeType: 'created' | 'days_modified' | 'activities_changed' | 'hotels_changed' | 'pricing_updated' | 'general_edit';
  description: string;
  timestamp: string;
  updatedBy: string;
  previousData?: any;
  newData?: any;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'agent' | 'sales';
  company_name: string | null;
}

export interface FixedItinerary {
  id: string;
  name: string;
  numberOfDays: number;
  transportationMode: string;
  baseCost: number;
  inclusions: string;
  exclusions: string;
  dayPlans: DayPlan[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}