import { supabase } from './supabase';
import {
  Client, Transportation, Hotel, RoomType, Sightseeing, Activity, ActivityOption,
  EntryTicket, Meal, Itinerary, DayPlan, FixedItinerary, FollowUpRecord, Area
} from '../types';
import { Database } from '../types/database';

export interface SalesPerson {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

type Profiles = Database['public']['Tables']['profiles']['Row'];
type ClientsRow = Database['public']['Tables']['clients']['Row'];
type ClientsInsert = Database['public']['Tables']['clients']['Insert'];
type TransportationsRow = Database['public']['Tables']['transportations']['Row'];
type HotelsRow = Database['public']['Tables']['hotels']['Row'];
type RoomTypesRow = Database['public']['Tables']['room_types']['Row'];
type SightseeingsRow = Database['public']['Tables']['sightseeings']['Row'];
type ActivitiesRow = Database['public']['Tables']['activities']['Row'];
type ActivityOptionsRow = Database['public']['Tables']['activity_options']['Row'];
type EntryTicketsRow = Database['public']['Tables']['entry_tickets']['Row'];
type MealsRow = Database['public']['Tables']['meals']['Row'];
type AreasRow = Database['public']['Tables']['areas']['Row'];
type ItinerariesRow = Database['public']['Tables']['itineraries']['Row'];
type ItinerariesInsert = Database['public']['Tables']['itineraries']['Insert'];
type DayPlansRow = Database['public']['Tables']['day_plans']['Row'];
type DayPlansInsert = Database['public']['Tables']['day_plans']['Insert'];
type FixedItinerariesRow = Database['public']['Tables']['fixed_itineraries']['Row'];
type FixedItinerariesInsert = Database['public']['Tables']['fixed_itineraries']['Insert'];
type FollowUpRecordsRow = Database['public']['Tables']['follow_up_records']['Row'];
type FollowUpRecordsInsert = Database['public']['Tables']['follow_up_records']['Insert'];

// --- Converters from DB Row to App Type ---

export const fromDbClient = (row: ClientsRow): Client => ({
  id: row.id,
  name: row.name,
  whatsapp: row.whatsapp,
  countryCode: row.country_code,
  travelDates: {
    startDate: row.travel_dates_start_date || '',
    endDate: row.travel_dates_end_date || '',
    isFlexible: row.travel_dates_is_flexible,
    flexibleMonth: row.travel_dates_flexible_month || ''
  },
  numberOfPax: {
    adults: row.number_of_pax_adults,
    children: row.number_of_pax_children
  },
  numberOfDays: row.number_of_days,
  transportationMode: row.transportation_mode,
  createdAt: row.created_at,
  createdBy: row.created_by || undefined,
  followUpStatus: row.follow_up_status_status ? {
    status: row.follow_up_status_status as any,
    updatedAt: row.follow_up_status_updated_at || '',
    remarks: row.follow_up_status_remarks || '',
    nextFollowUpDate: row.next_follow_up_date || undefined,
    nextFollowUpTime: row.next_follow_up_time || undefined
  } : undefined,
  nextFollowUpDate: row.next_follow_up_date || undefined,
  nextFollowUpTime: row.next_follow_up_time || undefined
});

export const toDbClient = (client: Client): ClientsInsert => ({
  id: client.id,
  name: client.name,
  whatsapp: client.whatsapp,
  country_code: client.countryCode,
  travel_dates_start_date: client.travelDates.startDate || null,
  travel_dates_end_date: client.travelDates.endDate || null,
  travel_dates_is_flexible: client.travelDates.isFlexible,
  travel_dates_flexible_month: client.travelDates.flexibleMonth || null,
  number_of_pax_adults: client.numberOfPax.adults,
  number_of_pax_children: client.numberOfPax.children,
  number_of_days: client.numberOfDays,
  transportation_mode: client.transportationMode,
  created_at: client.createdAt,
  created_by: client.createdBy || null,
  follow_up_status_status: client.followUpStatus?.status || null,
  follow_up_status_updated_at: client.followUpStatus?.updatedAt || null,
  follow_up_status_remarks: client.followUpStatus?.remarks || null,
  next_follow_up_date: client.nextFollowUpDate || null,
  next_follow_up_time: client.nextFollowUpTime || null
});

export const fromDbTransportation = (row: TransportationsRow): Transportation => ({
  id: row.id,
  type: row.type as any,
  vehicleName: row.vehicle_name,
  costPerDay: row.cost_per_day,
  minOccupancy: row.min_occupancy || 1,
  maxOccupancy: row.max_occupancy || 1,
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined
});

export const toDbTransportation = (t: Transportation) => ({
  id: t.id,
  type: t.type,
  vehicle_name: t.vehicleName,
  cost_per_day: t.costPerDay,
  min_occupancy: t.minOccupancy,
  max_occupancy: t.maxOccupancy,
  area_id: t.areaId || null,
  area_name: t.areaName || null
});

export const fromDbHotel = (row: HotelsRow & { room_types?: RoomTypesRow[] }): Hotel => ({
  id: row.id,
  name: row.name,
  place: row.place,
  starCategory: row.star_category as any,
  roomTypes: row.room_types ? row.room_types.map(fromDbRoomType) : []
});

export const toDbHotel = (h: Hotel) => ({
  id: h.id,
  name: h.name,
  place: h.place,
  star_category: h.starCategory
});

export const fromDbRoomType = (row: RoomTypesRow): RoomType => ({
  id: row.id,
  name: row.name,
  peakSeasonPrice: row.peak_season_price,
  seasonPrice: row.season_price,
  offSeasonPrice: row.off_season_price
});

export const toDbRoomType = (rt: RoomType, hotelId: string) => ({
  id: rt.id,
  hotel_id: hotelId,
  name: rt.name,
  peak_season_price: rt.peakSeasonPrice,
  season_price: rt.seasonPrice,
  off_season_price: rt.offSeasonPrice
});

export const fromDbSightseeing = (row: SightseeingsRow): Sightseeing => ({
  id: row.id,
  name: row.name,
  displayName: row.display_name || undefined,
  description: row.description,
  transportationMode: row.transportation_mode as any,
  vehicleCosts: row.vehicle_costs || undefined,
  entryTicketIds: row.entry_ticket_ids || undefined,
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined
});

export const toDbSightseeing = (s: Sightseeing) => {
  console.log('DEBUG toDbSightseeing - Input displayName:', s.displayName);
  const dbData = {
    id: s.id,
    name: s.name,
    display_name: s.displayName !== undefined && s.displayName !== '' ? s.displayName : null,
    description: s.description,
    transportation_mode: s.transportationMode,
    vehicle_costs: s.vehicleCosts || null,
    entry_ticket_ids: s.entryTicketIds || null,
    area_id: s.areaId || null,
    area_name: s.areaName || null
  };
  console.log('DEBUG toDbSightseeing - Output display_name:', dbData.display_name);
  return dbData;
};

export const fromDbActivity = (row: ActivitiesRow & { activity_options?: ActivityOptionsRow[] }): Activity => ({
  id: row.id,
  name: row.name,
  location: row.location,
  options: row.activity_options ? row.activity_options.map(fromDbActivityOption) : [],
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined
});

export const toDbActivity = (a: Activity) => ({
  id: a.id,
  name: a.name,
  location: a.location,
  area_id: a.areaId || null,
  area_name: a.areaName || null
});

export const fromDbActivityOption = (row: ActivityOptionsRow): ActivityOption => ({
  id: row.id,
  name: row.name,
  cost: row.cost,
  costForHowMany: row.cost_for_how_many
});

export const toDbActivityOption = (ao: ActivityOption, activityId: string) => ({
  id: ao.id,
  activity_id: activityId,
  name: ao.name,
  cost: ao.cost,
  cost_for_how_many: ao.costForHowMany
});

export const fromDbEntryTicket = (row: EntryTicketsRow): EntryTicket => ({
  id: row.id,
  name: row.name,
  adultCost: row.adult_cost,
  childCost: row.child_cost,
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined
});

export const toDbEntryTicket = (et: EntryTicket) => ({
  id: et.id,
  name: et.name,
  adult_cost: et.adultCost,
  child_cost: et.childCost,
  area_id: et.areaId || null,
  area_name: et.areaName || null
});

export const fromDbMeal = (row: MealsRow): Meal => ({
  id: row.id,
  type: row.type as any,
  place: row.place,
  cost: row.cost,
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined
});

export const toDbMeal = (m: Meal) => ({
  id: m.id,
  type: m.type,
  place: m.place,
  cost: m.cost,
  area_id: m.areaId || null,
  area_name: m.areaName || null
});

export const fromDbArea = (row: AreasRow): Area => ({
  id: row.id,
  name: row.name,
  description: row.description,
  created_at: row.created_at,
  updated_at: row.updated_at
});

export const fromDbDayPlan = (row: DayPlansRow): DayPlan => ({
  day: row.day,
  areaId: row.area_id || undefined,
  areaName: row.area_name || undefined,
  sightseeing: row.sightseeing_ids || [],
  hotel: row.hotel_id && row.room_type_id && row.hotel_place ? {
    place: row.hotel_place,
    hotelId: row.hotel_id,
    roomTypeId: row.room_type_id
  } : null,
  activities: (row.activities_data as any) || [],
  entryTickets: row.entry_ticket_ids || [],
  meals: row.meal_ids || []
});

export const toDbDayPlan = (dp: DayPlan, itineraryId: string): DayPlansInsert => ({
  itinerary_id: itineraryId,
  day: dp.day,
  area_id: dp.areaId || null,
  area_name: dp.areaName || null,
  sightseeing_ids: dp.sightseeing,
  hotel_place: dp.hotel?.place || null,
  hotel_id: dp.hotel?.hotelId || null,
  room_type_id: dp.hotel?.roomTypeId || null,
  activities_data: dp.activities as any,
  entry_ticket_ids: dp.entryTickets,
  meal_ids: dp.meals
});

export const fromDbItinerary = (row: ItinerariesRow & { clients?: ClientsRow } & { day_plans?: DayPlansRow[] }): Itinerary => ({
  id: row.id,
  client: row.clients ? fromDbClient(row.clients) : {} as Client,
  dayPlans: row.day_plans ? row.day_plans.map(fromDbDayPlan) : [],
  totalBaseCost: row.total_base_cost,
  profitMargin: row.profit_margin,
  finalPrice: row.final_price,
  exchangeRate: row.exchange_rate,
  version: row.version,
  lastUpdated: row.last_updated,
  updatedBy: row.updated_by,
  changeLog: []
});

export const toDbItinerary = (i: Itinerary): ItinerariesInsert => ({
  id: i.id,
  client_id: i.client.id,
  total_base_cost: i.totalBaseCost,
  profit_margin: i.profitMargin,
  final_price: i.finalPrice,
  exchange_rate: i.exchangeRate,
  version: i.version,
  last_updated: i.lastUpdated,
  updated_by: i.updatedBy
});

export const fromDbFixedItinerary = (row: FixedItinerariesRow): FixedItinerary => ({
  id: row.id,
  name: row.name,
  numberOfDays: row.number_of_days,
  transportationMode: row.transportation_mode,
  baseCost: row.base_cost,
  inclusions: row.inclusions,
  exclusions: row.exclusions,
  dayPlans: (row.day_plans_data as any) || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  createdBy: row.created_by
});

export const toDbFixedItinerary = (fi: FixedItinerary): FixedItinerariesInsert => ({
  id: fi.id,
  name: fi.name,
  number_of_days: fi.numberOfDays,
  transportation_mode: fi.transportationMode,
  base_cost: fi.baseCost,
  inclusions: fi.inclusions,
  exclusions: fi.exclusions,
  day_plans_data: fi.dayPlans as any,
  created_at: fi.createdAt,
  updated_at: fi.updatedAt,
  created_by: fi.createdBy
});

export const fromDbFollowUpRecord = (row: FollowUpRecordsRow): FollowUpRecord => ({
  id: row.id,
  status: row.status as any,
  remarks: row.remarks,
  updatedAt: row.updated_at,
  nextFollowUpDate: row.next_follow_up_date || undefined,
  nextFollowUpTime: row.next_follow_up_time || undefined,
  updatedBy: row.updated_by
});

export const toDbFollowUpRecord = (fur: FollowUpRecord): FollowUpRecordsInsert => ({
  id: fur.id,
  client_id: fur.id, // This should be clientId but FollowUpRecord type needs updating
  status: fur.status,
  remarks: fur.remarks,
  updated_at: fur.updatedAt,
  next_follow_up_date: fur.nextFollowUpDate || null,
  next_follow_up_time: fur.nextFollowUpTime || null,
  updated_by: fur.updatedBy
});

// --- Supabase Data Operations ---

let lastFetchTime = 0;
let fetchPromise: Promise<any> | null = null;
const FETCH_THROTTLE_MS = 1000;

export const fetchAllData = async () => {
  if (!supabase) return null;

  const now = Date.now();
  if (fetchPromise) {
    console.log('Fetch already in progress, returning existing promise');
    return fetchPromise;
  }

  if (now - lastFetchTime < FETCH_THROTTLE_MS) {
    console.log('Fetch throttled, skipping');
    return null;
  }

  lastFetchTime = now;
  console.log('Fetching all data from Supabase...');

  fetchPromise = (async () => {
    try {
      const [
        { data: clientsData, error: clientsError },
        { data: transportationsData, error: transportationsError },
        { data: hotelsData, error: hotelsError },
        { data: sightseeingsData, error: sightseeingsError },
        { data: activitiesData, error: activitiesError },
        { data: entryTicketsData, error: entryTicketsError },
        { data: mealsData, error: mealsError },
        { data: areasData, error: areasError },
        { data: itinerariesData, error: itinerariesError },
        { data: fixedItinerariesData, error: fixedItinerariesError }
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('transportations').select('*'),
        supabase.from('hotels').select('*, room_types(*)'),
        supabase.from('sightseeings').select('*'),
        supabase.from('activities').select('*, activity_options(*)'),
        supabase.from('entry_tickets').select('*'),
        supabase.from('meals').select('*'),
        supabase.from('areas').select('*'),
        supabase.from('itineraries').select('*, clients(*), day_plans(*)'),
        supabase.from('fixed_itineraries').select('*')
      ]);

      if (clientsError) throw clientsError;
      if (transportationsError) throw transportationsError;
      if (hotelsError) throw hotelsError;
      if (sightseeingsError) throw sightseeingsError;
      if (activitiesError) throw activitiesError;
      if (entryTicketsError) throw entryTicketsError;
      if (mealsError) throw mealsError;
      if (areasError) throw areasError;
      if (itinerariesError) throw itinerariesError;
      if (fixedItinerariesError) throw fixedItinerariesError;

      console.log('Data fetched successfully');
      return {
        clients: clientsData?.map(fromDbClient) || [],
        transportations: transportationsData?.map(fromDbTransportation) || [],
        hotels: hotelsData?.map(fromDbHotel) || [],
        sightseeings: sightseeingsData?.map(fromDbSightseeing) || [],
        activities: activitiesData?.map(fromDbActivity) || [],
        entryTickets: entryTicketsData?.map(fromDbEntryTicket) || [],
        meals: mealsData?.map(fromDbMeal) || [],
        areas: areasData?.map(fromDbArea) || [],
        itineraries: itinerariesData?.map(fromDbItinerary) || [],
        fixedItineraries: fixedItinerariesData?.map(fromDbFixedItinerary) || []
      };
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw error;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
};

export const insertClient = async (client: Client) => {
  if (!supabase) {
    console.error('insertClient: Supabase not initialized!');
    throw new Error('Supabase is not configured');
  }
  const dbData = toDbClient(client);
  console.log('=== INSERT CLIENT TO SUPABASE ===');
  console.log('Client ID:', dbData.id);
  console.log('Insert data:', JSON.stringify(dbData, null, 2));
  console.log('created_by field:', dbData.created_by);

  const { data, error } = await supabase.from('clients').insert(dbData).select().single();

  if (error) {
    console.error('=== INSERT CLIENT ERROR ===');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error.details);
    console.error('Error hint:', error.hint);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to insert client: ${error.message}`);
  }

  console.log('=== INSERT CLIENT SUCCESS ===');
  console.log('Returned data:', data);
  return fromDbClient(data);
};

export const updateClient = async (client: Client) => {
  if (!supabase) return null;
  const updateData = toDbClient(client);
  console.log('Updating client:', client.id, updateData);
  const { data, error } = await supabase.from('clients').update(updateData).eq('id', client.id).select().single();
  if (error) {
    console.error('Update client error:', error);
    throw error;
  }
  console.log('Update client success:', data);
  return fromDbClient(data);
};

export const deleteClient = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
};

export const insertTransportation = async (t: Transportation) => {
  if (!supabase) return null;
  const dbData = toDbTransportation(t);
  const { id, ...insertData } = dbData;
  const { data, error } = await supabase.from('transportations').insert(insertData).select().single();
  if (error) throw error;
  return fromDbTransportation(data);
};

export const updateTransportation = async (t: Transportation) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('transportations').update(toDbTransportation(t)).eq('id', t.id).select().single();
  if (error) throw error;
  return fromDbTransportation(data);
};

export const deleteTransportation = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('transportations').delete().eq('id', id);
  if (error) throw error;
};

export const insertHotel = async (h: Hotel) => {
  if (!supabase) return null;
  const dbHotel = toDbHotel(h);
  const { id, ...hotelInsertData } = dbHotel;
  const { data: hotelData, error: hotelError } = await supabase.from('hotels').insert(hotelInsertData).select().single();
  if (hotelError) throw hotelError;

  if (h.roomTypes.length > 0) {
    const roomTypesToInsert = h.roomTypes.map(rt => {
      const { id, ...roomData } = toDbRoomType(rt, hotelData.id);
      return roomData;
    });
    const { error: roomTypesError } = await supabase.from('room_types').insert(roomTypesToInsert);
    if (roomTypesError) throw roomTypesError;
  }

  return fromDbHotel({ ...hotelData, room_types: h.roomTypes.map(rt => toDbRoomType(rt, hotelData.id)) });
};

export const updateHotel = async (h: Hotel) => {
  if (!supabase) return null;
  const { data: hotelData, error: hotelError } = await supabase.from('hotels').update(toDbHotel(h)).eq('id', h.id).select().single();
  if (hotelError) throw hotelError;

  // Delete existing room types and insert new ones
  const { error: deleteError } = await supabase.from('room_types').delete().eq('hotel_id', h.id);
  if (deleteError) throw deleteError;

  if (h.roomTypes.length > 0) {
    const roomTypesToInsert = h.roomTypes.map(rt => toDbRoomType(rt, h.id));
    const { error: insertError } = await supabase.from('room_types').insert(roomTypesToInsert);
    if (insertError) throw insertError;
  }
  
  return fromDbHotel({ ...hotelData, room_types: h.roomTypes.map(rt => toDbRoomType(rt, h.id)) });
};

export const deleteHotel = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('hotels').delete().eq('id', id);
  if (error) throw error;
};

export const insertSightseeing = async (s: Sightseeing) => {
  if (!supabase) return null;
  const dbData = toDbSightseeing(s);
  const { id, ...insertData } = dbData;
  console.log('DEBUG insertSightseeing - Data being inserted:', insertData);
  const { data, error } = await supabase.from('sightseeings').insert(insertData).select().single();
  if (error) {
    console.error('DEBUG insertSightseeing - Error:', error);
    throw error;
  }
  console.log('DEBUG insertSightseeing - Data returned from DB:', data);
  return fromDbSightseeing(data);
};

export const updateSightseeing = async (s: Sightseeing) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('sightseeings').update(toDbSightseeing(s)).eq('id', s.id).select().single();
  if (error) throw error;
  return fromDbSightseeing(data);
};

export const deleteSightseeing = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('sightseeings').delete().eq('id', id);
  if (error) throw error;
};

export const insertActivity = async (a: Activity) => {
  if (!supabase) return null;
  const dbActivity = toDbActivity(a);
  const { id, ...activityInsertData } = dbActivity;
  const { data: activityData, error: activityError } = await supabase.from('activities').insert(activityInsertData).select().single();
  if (activityError) throw activityError;

  console.log('Activity inserted, ID:', activityData.id);
  console.log('Number of options to insert:', a.options.length);

  if (a.options.length > 0) {
    const optionsToInsert = a.options.map(ao => {
      const { id, ...optionData } = toDbActivityOption(ao, activityData.id);
      return optionData;
    });
    console.log('Options to insert:', JSON.stringify(optionsToInsert, null, 2));
    const { data: insertedOptions, error: optionsError } = await supabase.from('activity_options').insert(optionsToInsert).select();
    if (optionsError) {
      console.error('Error inserting activity options:', optionsError);
      throw optionsError;
    }
    console.log('Options inserted successfully:', insertedOptions?.length);
  }

  return fromDbActivity({ ...activityData, activity_options: a.options.map(ao => toDbActivityOption(ao, activityData.id)) });
};

export const updateActivity = async (a: Activity) => {
  if (!supabase) return null;
  const { data: activityData, error: activityError } = await supabase.from('activities').update(toDbActivity(a)).eq('id', a.id).select().single();
  if (activityError) throw activityError;

  const { error: deleteError } = await supabase.from('activity_options').delete().eq('activity_id', a.id);
  if (deleteError) throw deleteError;

  if (a.options.length > 0) {
    const optionsToInsert = a.options.map(ao => toDbActivityOption(ao, a.id));
    const { error: insertError } = await supabase.from('activity_options').insert(optionsToInsert);
    if (insertError) throw insertError;
  }
  
  return fromDbActivity({ ...activityData, activity_options: a.options.map(ao => toDbActivityOption(ao, a.id)) });
};

export const deleteActivity = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
};

export const insertEntryTicket = async (et: EntryTicket) => {
  if (!supabase) return null;
  const dbData = toDbEntryTicket(et);
  const { id, ...insertData } = dbData;
  const { data, error } = await supabase.from('entry_tickets').insert(insertData).select().single();
  if (error) throw error;
  return fromDbEntryTicket(data);
};

export const updateEntryTicket = async (et: EntryTicket) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('entry_tickets').update(toDbEntryTicket(et)).eq('id', et.id).select().single();
  if (error) throw error;
  return fromDbEntryTicket(data);
};

export const deleteEntryTicket = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('entry_tickets').delete().eq('id', id);
  if (error) throw error;
};

export const insertMeal = async (m: Meal) => {
  if (!supabase) return null;
  const dbData = toDbMeal(m);
  const { id, ...insertData } = dbData;
  const { data, error } = await supabase.from('meals').insert(insertData).select().single();
  if (error) throw error;
  return fromDbMeal(data);
};

export const updateMeal = async (m: Meal) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('meals').update(toDbMeal(m)).eq('id', m.id).select().single();
  if (error) throw error;
  return fromDbMeal(data);
};

export const deleteMeal = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
};

export const insertItinerary = async (i: Itinerary) => {
  if (!supabase) {
    console.error('insertItinerary: Supabase not initialized!');
    throw new Error('Supabase is not configured');
  }

  const dbItinerary = toDbItinerary(i);
  const { id, ...itineraryInsertData } = dbItinerary;

  console.log('=== INSERT ITINERARY TO SUPABASE ===');
  console.log('Itinerary ID:', id);
  console.log('Client ID:', itineraryInsertData.client_id);
  console.log('Insert data:', JSON.stringify(itineraryInsertData, null, 2));

  // Check if client exists
  const { data: clientCheck, error: clientCheckError } = await supabase
    .from('clients')
    .select('id, created_by')
    .eq('id', itineraryInsertData.client_id)
    .maybeSingle();

  console.log('Client check:', clientCheck);
  console.log('Current user:', (await supabase.auth.getUser()).data.user?.id);

  if (clientCheckError) {
    console.error('Error checking client:', clientCheckError);
  }

  if (!clientCheck) {
    console.error('CLIENT NOT FOUND IN DATABASE!');
    throw new Error(`Client ${itineraryInsertData.client_id} does not exist in database`);
  }

  if (clientCheck.created_by !== (await supabase.auth.getUser()).data.user?.id) {
    console.error('CLIENT CREATED_BY MISMATCH!');
    console.error('Client created_by:', clientCheck.created_by);
    console.error('Current user:', (await supabase.auth.getUser()).data.user?.id);
  }

  const { data: itineraryData, error: itineraryError } = await supabase
    .from('itineraries')
    .insert(itineraryInsertData)
    .select()
    .single();

  if (itineraryError) {
    console.error('=== INSERT ITINERARY ERROR ===');
    console.error('Error code:', itineraryError.code);
    console.error('Error message:', itineraryError.message);
    console.error('Error details:', itineraryError.details);
    console.error('Error hint:', itineraryError.hint);
    throw new Error(`Failed to insert itinerary: ${itineraryError.message}`);
  }

  if (i.dayPlans.length > 0) {
    const dayPlansToInsert = i.dayPlans.map(dp => toDbDayPlan(dp, itineraryData.id));
    const { error: dayPlansError } = await supabase.from('day_plans').insert(dayPlansToInsert);
    if (dayPlansError) throw dayPlansError;
  }

  return fromDbItinerary({ ...itineraryData, day_plans: i.dayPlans.map(dp => toDbDayPlan(dp, itineraryData.id)) });
};

export const updateItinerary = async (i: Itinerary) => {
  if (!supabase) return null;
  const { data: itineraryData, error: itineraryError } = await supabase.from('itineraries').update(toDbItinerary(i)).eq('id', i.id).select().single();
  if (itineraryError) throw itineraryError;

  const { error: deleteError } = await supabase.from('day_plans').delete().eq('itinerary_id', i.id);
  if (deleteError) throw deleteError;

  if (i.dayPlans.length > 0) {
    const dayPlansToInsert = i.dayPlans.map(dp => toDbDayPlan(dp, i.id));
    const { error: insertError } = await supabase.from('day_plans').insert(dayPlansToInsert);
    if (insertError) throw insertError;
  }
  
  return fromDbItinerary({ ...itineraryData, day_plans: i.dayPlans.map(dp => toDbDayPlan(dp, i.id)) });
};

export const deleteItinerary = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('itineraries').delete().eq('id', id);
  if (error) throw error;
};

export const insertFixedItinerary = async (fi: FixedItinerary) => {
  if (!supabase) return null;
  const dbData = toDbFixedItinerary(fi);
  const { id, ...insertData } = dbData;
  const { data, error } = await supabase.from('fixed_itineraries').insert(insertData).select().single();
  if (error) throw error;
  return fromDbFixedItinerary(data);
};

export const updateFixedItinerary = async (fi: FixedItinerary) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('fixed_itineraries').update(toDbFixedItinerary(fi)).eq('id', fi.id).select().single();
  if (error) throw error;
  return fromDbFixedItinerary(data);
};

export const deleteFixedItinerary = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('fixed_itineraries').delete().eq('id', id);
  if (error) throw error;
};

export const insertFollowUpRecord = async (fur: FollowUpRecord) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from('follow_up_records').insert(toDbFollowUpRecord(fur)).select().single();
  if (error) throw error;
  return fromDbFollowUpRecord(data);
};

export const fetchAllSalesPersons = async (): Promise<SalesPerson[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('sales_persons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const insertSalesPerson = async (
  salesPerson: Omit<SalesPerson, 'id' | 'created_at' | 'updated_at'> & { raw_password?: string }
): Promise<SalesPerson | null> => {
  if (!supabase) return null;

  console.log('insertSalesPerson called with:', { ...salesPerson, raw_password: '***' });

  // If raw_password is provided, create Supabase Auth user
  if (salesPerson.raw_password) {
    console.log('Creating Supabase auth user for:', salesPerson.email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: salesPerson.email,
      password: salesPerson.raw_password,
      options: {
        data: {
          full_name: salesPerson.full_name,
          role: 'sales',
          company_name: salesPerson.company_name
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
    if (!authData.user) {
      console.error('No user data returned from signup');
      throw new Error('Failed to create auth user');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Note: Profile is automatically created by the handle_new_user() trigger
    // The trigger reads role='sales' from raw_user_meta_data
    // Then auto_create_sales_person() trigger creates the sales_persons entry

    // Wait for both profile and sales_persons entry to be created
    console.log('Waiting for profile and sales_persons entry creation...');
    let recordCreated = false;
    for (let i = 0; i < 15; i++) {
      const { data: salesPersonRecord } = await supabase
        .from('sales_persons')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (salesPersonRecord) {
        recordCreated = true;
        console.log('Sales person created successfully:', salesPersonRecord);
        return salesPersonRecord;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (!recordCreated) {
      console.error('Sales person creation timeout');
      throw new Error('Sales person creation timeout - please try again');
    }
  }

  return null;
};

export const updateSalesPerson = async (salesPerson: Partial<SalesPerson> & { id: string }): Promise<SalesPerson | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('sales_persons')
    .update(salesPerson)
    .eq('id', salesPerson.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteSalesPerson = async (id: string): Promise<void> => {
  if (!supabase) return;

  // Delete the auth user first - this will cascade to sales_persons due to ON DELETE CASCADE
  const { error: authError } = await supabase.auth.admin.deleteUser(id);

  if (authError) {
    console.error('Error deleting auth user:', authError);
    // If auth deletion fails, try deleting from sales_persons directly
    const { error: salesError } = await supabase
      .from('sales_persons')
      .delete()
      .eq('id', id);

    if (salesError) throw salesError;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const fetchAllAgentRegistrations = async (): Promise<any[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('agent_registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const insertAgentRegistration = async (agent: {
  company_name: string;
  company_logo?: string;
  address: string;
  email: string;
  phone_no: string;
  username: string;
  password_hash: string;
}): Promise<any> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('agent_registrations')
    .insert([agent])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const approveAgentRegistration = async (agentId: string, adminId: string): Promise<any> => {
  if (!supabase) return null;

  const { data: agent, error: fetchError } = await supabase
    .from('agent_registrations')
    .select('*')
    .eq('id', agentId)
    .single();

  if (fetchError) throw fetchError;
  if (!agent) throw new Error('Agent registration not found');

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: agent.email,
    password: agent.password_hash,
    options: {
      data: {
        full_name: agent.username,
        role: 'agent',
        company_name: agent.company_name
      }
    }
  });

  if (authError) throw authError;

  const { data, error: updateError } = await supabase
    .from('agent_registrations')
    .update({
      status: 'approved',
      approved_by: adminId,
      approved_at: new Date().toISOString()
    })
    .eq('id', agentId)
    .select()
    .single();

  if (updateError) throw updateError;
  return data;
};

export const rejectAgentRegistration = async (agentId: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('agent_registrations')
    .update({ status: 'rejected' })
    .eq('id', agentId);

  if (error) throw error;
};

export const deleteAgentRegistration = async (agentId: string): Promise<void> => {
  if (!supabase) return;
  const { error } = await supabase
    .from('agent_registrations')
    .delete()
    .eq('id', agentId);

  if (error) throw error;
};

export interface OperationsPerson {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const insertOperationsPerson = async (
  operationsPerson: Omit<OperationsPerson, 'id' | 'created_at' | 'updated_at'> & { raw_password?: string }
): Promise<OperationsPerson | null> => {
  if (!supabase) return null;

  console.log('insertOperationsPerson called with:', { ...operationsPerson, raw_password: '***' });

  // If raw_password is provided, create Supabase Auth user
  if (operationsPerson.raw_password) {
    console.log('Creating Supabase auth user for:', operationsPerson.email);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: operationsPerson.email,
      password: operationsPerson.raw_password,
      options: {
        data: {
          full_name: operationsPerson.full_name,
          role: 'operations',
          company_name: operationsPerson.company_name,
          phone_number: operationsPerson.phone_number
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }
    if (!authData.user) {
      console.error('No user data returned from signup');
      throw new Error('Failed to create auth user');
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Note: Profile is automatically created by the handle_new_user() trigger
    // Then auto_create_operations_person() trigger creates the operations_persons entry

    // Wait for both profile and operations_persons entry to be created
    console.log('Waiting for profile and operations_persons entry creation...');
    let recordCreated = false;
    for (let i = 0; i < 15; i++) {
      const { data: operationsPersonRecord } = await supabase
        .from('operations_persons')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (operationsPersonRecord) {
        recordCreated = true;
        console.log('Operations person created successfully:', operationsPersonRecord);
        return operationsPersonRecord;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (!recordCreated) {
      console.error('Operations person creation timeout');
      throw new Error('Operations person creation timeout - please try again');
    }
  }

  return null;
};

export const fetchAllOperationsPersons = async (): Promise<OperationsPerson[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('operations_persons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};