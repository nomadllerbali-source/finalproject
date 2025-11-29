import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  Client, Transportation, Hotel, Sightseeing, Activity, EntryTicket, 
  Meal, Itinerary, ItineraryChange, FixedItinerary
} from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  fetchAllData, insertClient, updateClient, deleteClient,
  insertTransportation, updateTransportation, deleteTransportation,
  insertHotel, updateHotel, deleteHotel,
  insertSightseeing, updateSightseeing, deleteSightseeing,
  insertActivity, updateActivity, deleteActivity,
  insertEntryTicket, updateEntryTicket, deleteEntryTicket,
  insertMeal, updateMeal, deleteMeal,
  insertItinerary, updateItinerary, deleteItinerary,
  insertFixedItinerary, updateFixedItinerary, deleteFixedItinerary,
  insertFollowUpRecord
} from '../lib/supabaseHelpers';

interface DataState {
  clients: Client[];
  transportations: Transportation[];
  hotels: Hotel[];
  sightseeings: Sightseeing[];
  activities: Activity[];
  entryTickets: EntryTicket[];
  meals: Meal[];
  itineraries: Itinerary[];
  fixedItineraries: FixedItinerary[];
}

type DataAction = 
  | { type: 'SET_DATA'; payload: Partial<DataState> }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string }
  | { type: 'ADD_TRANSPORTATION'; payload: Transportation }
  | { type: 'UPDATE_TRANSPORTATION'; payload: Transportation }
  | { type: 'DELETE_TRANSPORTATION'; payload: string }
  | { type: 'ADD_HOTEL'; payload: Hotel }
  | { type: 'UPDATE_HOTEL'; payload: Hotel }
  | { type: 'DELETE_HOTEL'; payload: string }
  | { type: 'ADD_SIGHTSEEING'; payload: Sightseeing }
  | { type: 'UPDATE_SIGHTSEEING'; payload: Sightseeing }
  | { type: 'DELETE_SIGHTSEEING'; payload: string }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string }
  | { type: 'ADD_ENTRY_TICKET'; payload: EntryTicket }
  | { type: 'UPDATE_ENTRY_TICKET'; payload: EntryTicket }
  | { type: 'DELETE_ENTRY_TICKET'; payload: string }
  | { type: 'ADD_MEAL'; payload: Meal }
  | { type: 'UPDATE_MEAL'; payload: Meal }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'ADD_ITINERARY'; payload: Itinerary }
  | { type: 'UPDATE_ITINERARY'; payload: Itinerary }
  | { type: 'DELETE_ITINERARY'; payload: string }
  | { type: 'ADD_FIXED_ITINERARY'; payload: FixedItinerary }
  | { type: 'UPDATE_FIXED_ITINERARY'; payload: FixedItinerary }
  | { type: 'DELETE_FIXED_ITINERARY'; payload: string };

// Demo data
const demoTransportations: Transportation[] = [
  { id: '1', type: 'cab', vehicleName: 'Private Cab Service', costPerDay: 0 },
  { id: '2', type: 'self-drive-car', vehicleName: 'Toyota Avanza', costPerDay: 45 },
  { id: '3', type: 'self-drive-car', vehicleName: 'Honda Brio', costPerDay: 35 },
  { id: '4', type: 'self-drive-scooter', vehicleName: 'Honda Vario', costPerDay: 8 },
  { id: '5', type: 'self-drive-scooter', vehicleName: 'Yamaha NMAX', costPerDay: 12 },
  { id: '6', type: 'self-drive-car', vehicleName: 'Toyota Innova', costPerDay: 55 },
  { id: '7', type: 'self-drive-car', vehicleName: 'Mitsubishi Pajero', costPerDay: 75 },
  { id: '8', type: 'self-drive-car', vehicleName: 'Daihatsu Terios', costPerDay: 38 },
  { id: '9', type: 'self-drive-scooter', vehicleName: 'Yamaha Aerox', costPerDay: 12 },
  { id: '10', type: 'self-drive-scooter', vehicleName: 'Honda ADV 150', costPerDay: 15 },
  { id: '11', type: 'self-drive-scooter', vehicleName: 'Vespa Primavera', costPerDay: 18 },
  { id: '12', type: 'cab', vehicleName: 'Luxury Car Service', costPerDay: 0 }
];

const demoHotels: Hotel[] = [
  {
    id: '1',
    name: 'Ubud Palace Resort',
    place: 'Ubud',
    starCategory: '5-star',
    roomTypes: [
      { id: '1-1', name: 'Deluxe Garden View', peakSeasonPrice: 180, seasonPrice: 150, offSeasonPrice: 120 },
      { id: '1-2', name: 'Premium Pool View', peakSeasonPrice: 220, seasonPrice: 180, offSeasonPrice: 150 },
      { id: '1-3', name: 'Royal Suite', peakSeasonPrice: 350, seasonPrice: 280, offSeasonPrice: 220 }
    ]
  },
  {
    id: '2',
    name: 'Seminyak Beach Hotel',
    place: 'Seminyak',
    starCategory: '4-star',
    roomTypes: [
      { id: '2-1', name: 'Superior Room', peakSeasonPrice: 120, seasonPrice: 100, offSeasonPrice: 80 },
      { id: '2-2', name: 'Ocean View Room', peakSeasonPrice: 160, seasonPrice: 130, offSeasonPrice: 110 }
    ]
  },
  {
    id: '3',
    name: 'Kuta Beach Resort',
    place: 'Kuta',
    starCategory: '3-star',
    roomTypes: [
      { id: '3-1', name: 'Standard Room', peakSeasonPrice: 80, seasonPrice: 65, offSeasonPrice: 50 },
      { id: '3-2', name: 'Beach View Room', peakSeasonPrice: 110, seasonPrice: 90, offSeasonPrice: 70 }
    ]
  },
  {
    id: '4',
    name: 'Sanur Sunrise Hotel',
    place: 'Sanur',
    starCategory: '4-star',
    roomTypes: [
      { id: '4-1', name: 'Garden Room', peakSeasonPrice: 100, seasonPrice: 85, offSeasonPrice: 70 },
      { id: '4-2', name: 'Beachfront Suite', peakSeasonPrice: 180, seasonPrice: 150, offSeasonPrice: 120 }
    ]
  },
  {
    id: '5',
    name: 'Lovina Beach Resort',
    place: 'Lovina',
    starCategory: '4-star',
    roomTypes: [
      { id: '5-1', name: 'Ocean View Room', peakSeasonPrice: 140, seasonPrice: 115, offSeasonPrice: 90 },
      { id: '5-2', name: 'Dolphin Suite', peakSeasonPrice: 200, seasonPrice: 165, offSeasonPrice: 130 }
    ]
  },
  {
    id: '6',
    name: 'Amed Beach Villa',
    place: 'Amed',
    starCategory: '3-star',
    roomTypes: [
      { id: '6-1', name: 'Garden Villa', peakSeasonPrice: 90, seasonPrice: 75, offSeasonPrice: 60 },
      { id: '6-2', name: 'Sea View Villa', peakSeasonPrice: 130, seasonPrice: 105, offSeasonPrice: 85 }
    ]
  },
  {
    id: '7',
    name: 'Munduk Mountain Resort',
    place: 'Munduk',
    starCategory: '4-star',
    roomTypes: [
      { id: '7-1', name: 'Mountain View Room', peakSeasonPrice: 120, seasonPrice: 100, offSeasonPrice: 80 },
      { id: '7-2', name: 'Lake View Suite', peakSeasonPrice: 170, seasonPrice: 140, offSeasonPrice: 115 }
    ]
  },
  {
    id: '8',
    name: 'Sidemen Valley Lodge',
    place: 'Sidemen',
    starCategory: '3-star',
    roomTypes: [
      { id: '8-1', name: 'Valley View Room', peakSeasonPrice: 85, seasonPrice: 70, offSeasonPrice: 55 }
    ]
  },
  {
    id: '9',
    name: 'Candidasa Beach Hotel',
    place: 'Candidasa',
    starCategory: '4-star',
    roomTypes: [
      { id: '9-1', name: 'Beach Front Room', peakSeasonPrice: 150, seasonPrice: 125, offSeasonPrice: 100 }
    ]
  },
  {
    id: '10',
    name: 'Pemuteran Bay Resort',
    place: 'Pemuteran',
    starCategory: '5-star',
    roomTypes: [
      { id: '10-1', name: 'Luxury Ocean Suite', peakSeasonPrice: 280, seasonPrice: 230, offSeasonPrice: 180 }
    ]
  },
  {
    id: '11',
    name: 'Tabanan Rice Field Resort',
    place: 'Tabanan',
    starCategory: '4-star',
    roomTypes: [
      { id: '11-1', name: 'Rice Field View Room', peakSeasonPrice: 110, seasonPrice: 90, offSeasonPrice: 75 }
    ]
  },
  {
    id: '12',
    name: 'Denpasar City Hotel',
    place: 'Denpasar',
    starCategory: '3-star',
    roomTypes: [
      { id: '12-1', name: 'Standard City Room', peakSeasonPrice: 70, seasonPrice: 60, offSeasonPrice: 45 },
      { id: '12-2', name: 'Executive Room', peakSeasonPrice: 95, seasonPrice: 80, offSeasonPrice: 65 }
    ]
  }
];

const demoSightseeings: Sightseeing[] = [
  {
    id: '1',
    name: 'Tanah Lot Temple',
    description: 'Iconic sea temple perched on a rock formation',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 45, hiace: 65, miniBus: 85, bus32: 120, bus39: 140 }
  },
  {
    id: '2',
    name: 'Uluwatu Temple',
    description: 'Clifftop temple with stunning sunset views',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 50, hiace: 70, miniBus: 90, bus32: 125, bus39: 145 }
  },
  {
    id: '3',
    name: 'Besakih Temple',
    description: 'Mother temple of Bali with panoramic mountain views',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 80, hiace: 110, miniBus: 140, bus32: 180, bus39: 210 }
  },
  {
    id: '4',
    name: 'Jatiluwih Rice Terraces',
    description: 'UNESCO World Heritage rice terraces',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 70, hiace: 95, miniBus: 125, bus32: 160, bus39: 185 }
  },
  {
    id: '5',
    name: 'Nusa Penida Day Trip',
    description: 'Island adventure with pristine beaches and cliffs',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 120, hiace: 150, miniBus: 180, bus32: 220, bus39: 250 }
  },
  {
    id: '6',
    name: 'Lovina Dolphin Watching',
    description: 'Early morning dolphin watching tour',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 90, hiace: 120, miniBus: 150, bus32: 190, bus39: 220 }
  },
  {
    id: '7',
    name: 'Banyumala Twin Waterfalls',
    description: 'Hidden twin waterfalls with crystal clear pools',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 60, hiace: 85, miniBus: 110, bus32: 145, bus39: 170 }
  },
  {
    id: '8',
    name: 'Tegallalang Rice Terraces',
    description: 'Famous Instagram-worthy rice terraces with swing',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 35, hiace: 50, miniBus: 70, bus32: 95, bus39: 115 }
  },
  {
    id: '9',
    name: 'Tirta Empul Temple',
    description: 'Holy spring water temple for purification rituals',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 55, hiace: 75, miniBus: 95, bus32: 125, bus39: 145 }
  },
  {
    id: '10',
    name: 'Goa Gajah Elephant Cave',
    description: 'Ancient archaeological site with intricate stone carvings',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 40, hiace: 60, miniBus: 80, bus32: 105, bus39: 125 }
  },
  {
    id: '11',
    name: 'Gunung Kawi Temple',
    description: 'Ancient rock-cut temple complex in lush valley',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 50, hiace: 70, miniBus: 90, bus32: 120, bus39: 140 }
  },
  {
    id: '12',
    name: 'Batukaru Temple',
    description: 'Peaceful mountain temple surrounded by forest',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 75, hiace: 100, miniBus: 130, bus32: 165, bus39: 190 }
  },
  {
    id: '13',
    name: 'Jembrana Beach Drive',
    description: 'Scenic coastal drive with black sand beaches',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 85, hiace: 115, miniBus: 145, bus32: 185, bus39: 215 }
  },
  {
    id: '14',
    name: 'Bangli Traditional Villages',
    description: 'Cultural village tour with traditional crafts',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 65, hiace: 90, miniBus: 115, bus32: 150, bus39: 175 }
  },
  {
    id: '15',
    name: 'Klungkung Royal Palace',
    description: 'Historical palace with traditional Balinese architecture',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 55, hiace: 75, miniBus: 95, bus32: 125, bus39: 145 }
  },
  {
    id: '16',
    name: 'Buleleng Waterfall Circuit',
    description: 'Multiple waterfalls tour in northern Bali',
    transportationMode: 'cab',
    vehicleCosts: { avanza: 95, hiace: 125, miniBus: 155, bus32: 195, bus39: 225 }
  },
  // Self-drive car versions
  {
    id: '17',
    name: 'Tanah Lot Temple',
    description: 'Iconic sea temple perched on a rock formation',
    transportationMode: 'self-drive-car'
  },
  {
    id: '18',
    name: 'Uluwatu Temple',
    description: 'Clifftop temple with stunning sunset views',
    transportationMode: 'self-drive-car'
  },
  {
    id: '19',
    name: 'Besakih Temple',
    description: 'Mother temple of Bali with panoramic mountain views',
    transportationMode: 'self-drive-car'
  },
  {
    id: '20',
    name: 'Jatiluwih Rice Terraces',
    description: 'UNESCO World Heritage rice terraces',
    transportationMode: 'self-drive-car'
  },
  {
    id: '21',
    name: 'Tegallalang Rice Terraces',
    description: 'Famous Instagram-worthy rice terraces with swing',
    transportationMode: 'self-drive-car'
  },
  {
    id: '22',
    name: 'Tirta Empul Temple',
    description: 'Holy spring water temple for purification rituals',
    transportationMode: 'self-drive-car'
  },
  {
    id: '23',
    name: 'Goa Gajah Elephant Cave',
    description: 'Ancient archaeological site with intricate stone carvings',
    transportationMode: 'self-drive-car'
  },
  {
    id: '24',
    name: 'Gunung Kawi Temple',
    description: 'Ancient rock-cut temple complex in lush valley',
    transportationMode: 'self-drive-car'
  },
  // Self-drive scooter versions
  {
    id: '25',
    name: 'Tanah Lot Temple',
    description: 'Iconic sea temple perched on a rock formation',
    transportationMode: 'self-drive-scooter'
  },
  {
    id: '26',
    name: 'Uluwatu Temple',
    description: 'Clifftop temple with stunning sunset views',
    transportationMode: 'self-drive-scooter'
  },
  {
    id: '27',
    name: 'Tegallalang Rice Terraces',
    description: 'Famous Instagram-worthy rice terraces with swing',
    transportationMode: 'self-drive-scooter'
  },
  {
    id: '28',
    name: 'Tirta Empul Temple',
    description: 'Holy spring water temple for purification rituals',
    transportationMode: 'self-drive-scooter'
  }
];

const demoActivities: Activity[] = [
  {
    id: '1',
    name: 'Bali Swing',
    location: 'Ubud',
    options: [
      { id: '1-1', name: 'Single Swing', cost: 25, costForHowMany: 1 },
      { id: '1-2', name: 'Couple Swing', cost: 40, costForHowMany: 2 }
    ]
  },
  {
    id: '2',
    name: 'ATV Ride',
    location: 'Ubud',
    options: [
      { id: '2-1', name: 'Single ATV', cost: 35, costForHowMany: 1 },
      { id: '2-2', name: 'Tandem ATV', cost: 55, costForHowMany: 2 }
    ]
  },
  {
    id: '3',
    name: 'White Water Rafting',
    location: 'Ubud',
    options: [
      { id: '3-1', name: 'Ayung River Rafting', cost: 45, costForHowMany: 1 },
      { id: '3-2', name: 'Telaga Waja Rafting', cost: 55, costForHowMany: 1 }
    ]
  },
  {
    id: '4',
    name: 'Snorkeling',
    location: 'Amed',
    options: [
      { id: '4-1', name: 'Half Day Snorkeling', cost: 30, costForHowMany: 1 },
      { id: '4-2', name: 'Full Day with Lunch', cost: 65, costForHowMany: 1 }
    ]
  },
  {
    id: '5',
    name: 'Mount Batur Sunrise Hike',
    location: 'Kintamani',
    options: [
      { id: '5-1', name: 'Standard Hike with Breakfast', cost: 55, costForHowMany: 1 },
      { id: '5-2', name: 'Private Guide Hike', cost: 85, costForHowMany: 1 }
    ]
  },
  {
    id: '6',
    name: 'Yoga Class',
    location: 'Ubud',
    options: [
      { id: '6-1', name: 'Group Morning Session', cost: 20, costForHowMany: 1 },
      { id: '6-2', name: 'Private Instruction', cost: 80, costForHowMany: 2 }
    ]
  },
  {
    id: '7',
    name: 'Batik Making Workshop',
    location: 'Ubud',
    options: [
      { id: '7-1', name: 'Basic Workshop', cost: 35, costForHowMany: 1 },
      { id: '7-2', name: 'Advanced with Take-home', cost: 65, costForHowMany: 1 }
    ]
  },
  {
    id: '8',
    name: 'Silver Jewelry Making',
    location: 'Celuk',
    options: [
      { id: '8-1', name: 'Basic Ring Making', cost: 45, costForHowMany: 1 },
      { id: '8-2', name: 'Custom Jewelry Design', cost: 85, costForHowMany: 1 }
    ]
  },
  {
    id: '9',
    name: 'Wood Carving Class',
    location: 'Mas',
    options: [
      { id: '9-1', name: 'Small Sculpture', cost: 40, costForHowMany: 1 },
      { id: '9-2', name: 'Large Art Piece', cost: 75, costForHowMany: 1 }
    ]
  },
  {
    id: '10',
    name: 'Kite Flying',
    location: 'Sanur',
    options: [
      { id: '10-1', name: 'Traditional Kite Experience', cost: 25, costForHowMany: 1 },
      { id: '10-2', name: 'Kite Making & Flying', cost: 45, costForHowMany: 1 }
    ]
  },
  {
    id: '11',
    name: 'Fishing Trip',
    location: 'Sanur',
    options: [
      { id: '11-1', name: 'Traditional Fishing', cost: 50, costForHowMany: 1 },
      { id: '11-2', name: 'Deep Sea Fishing', cost: 120, costForHowMany: 4 }
    ]
  },
  {
    id: '12',
    name: 'Photography Tour',
    location: 'Various',
    options: [
      { id: '12-1', name: 'Sunrise Photography Tour', cost: 75, costForHowMany: 2 },
      { id: '12-2', name: 'Full Day Workshop', cost: 150, costForHowMany: 4 }
    ]
  },
  {
    id: '13',
    name: 'Meditation Retreat',
    location: 'Ubud',
    options: [
      { id: '13-1', name: 'Half Day Session', cost: 60, costForHowMany: 1 },
      { id: '13-2', name: 'Full Day Retreat', cost: 120, costForHowMany: 1 }
    ]
  },
  {
    id: '14',
    name: 'Surfing Lessons',
    location: 'Kuta',
    options: [
      { id: '14-1', name: 'Beginner Lesson', cost: 40, costForHowMany: 1 },
      { id: '14-2', name: 'Advanced Coaching', cost: 70, costForHowMany: 1 }
    ]
  },
  {
    id: '15',
    name: 'Horseback Riding',
    location: 'Canggu',
    options: [
      { id: '15-1', name: 'Beach Ride', cost: 55, costForHowMany: 1 },
      { id: '15-2', name: 'Sunset Ride', cost: 75, costForHowMany: 1 }
    ]
  },
  {
    id: '16',
    name: 'Traditional Dance Class',
    location: 'Ubud',
    options: [
      { id: '16-1', name: 'Balinese Dance Lesson', cost: 35, costForHowMany: 1 },
      { id: '16-2', name: 'Private Performance', cost: 150, costForHowMany: 6 }
    ]
  },
  {
    id: '17',
    name: 'Jungle Trekking',
    location: 'Munduk',
    options: [
      { id: '17-1', name: 'Half Day Trek', cost: 45, costForHowMany: 1 },
      { id: '17-2', name: 'Full Day Adventure', cost: 85, costForHowMany: 1 }
    ]
  }
];

const demoEntryTickets: EntryTicket[] = [
  { id: '1', name: 'Tanah Lot Temple Entry', cost: 5, sightseeingId: '1' },
  { id: '2', name: 'Uluwatu Temple Entry', cost: 6, sightseeingId: '2' },
  { id: '3', name: 'Kecak Fire Dance Show', cost: 15, sightseeingId: '2' },
  { id: '4', name: 'Besakih Temple Entry', cost: 8, sightseeingId: '3' },
  { id: '5', name: 'Jatiluwih Rice Terraces Entry', cost: 4, sightseeingId: '4' },
  { id: '6', name: 'Nusa Penida Fast Boat', cost: 35, sightseeingId: '5' },
  { id: '7', name: 'Kelingking Beach Access', cost: 3, sightseeingId: '5' },
  { id: '8', name: 'Dolphin Watching Boat', cost: 25, sightseeingId: '6' },
  { id: '9', name: 'Banyumala Waterfall Entry', cost: 6, sightseeingId: '7' },
  { id: '10', name: 'Tegallalang Rice Terraces Entry', cost: 5, sightseeingId: '8' },
  { id: '11', name: 'Bali Swing Experience', cost: 20, sightseeingId: '8' },
  { id: '12', name: 'Tirta Empul Temple Entry', cost: 8, sightseeingId: '9' },
  { id: '13', name: 'Holy Water Blessing Ceremony', cost: 15, sightseeingId: '9' },
  { id: '14', name: 'Goa Gajah Elephant Cave Entry', cost: 7, sightseeingId: '10' },
  { id: '15', name: 'Gunung Kawi Temple Entry', cost: 9, sightseeingId: '11' },
  { id: '16', name: 'Batukaru Temple Entry', cost: 6, sightseeingId: '12' },
  { id: '17', name: 'Klungkung Palace Entry', cost: 8, sightseeingId: '15' },
  { id: '18', name: 'Traditional Art Gallery', cost: 5, sightseeingId: '15' }
];

const demoMeals: Meal[] = [
  { id: '1', type: 'breakfast', place: 'Hotel Restaurant', cost: 12 },
  { id: '2', type: 'lunch', place: 'Local Warung', cost: 15 },
  { id: '3', type: 'dinner', place: 'Sunset Restaurant', cost: 25 }
];

const demoFixedItineraries: FixedItinerary[] = [
  {
    id: '1',
    name: 'Bali Highlights - 5 Days',
    numberOfDays: 5,
    transportationMode: 'Private Cab Service',
    baseCost: 850,
    inclusions: `• 5 days private cab transportation with driver
• 4 nights accommodation in 4-star hotels
• Daily breakfast at hotels
• Sightseeing tours: Tanah Lot, Uluwatu, Tegallalang Rice Terraces, Tirta Empul Temple
• Entry tickets to all mentioned attractions
• Professional English-speaking driver/guide
• Fuel, parking, and toll charges
• 24/7 customer support`,
    exclusions: `• International/domestic flights
• Travel insurance
• Lunch and dinner (except where mentioned)
• Personal expenses and shopping
• Tips and gratuities
• Activities not mentioned in inclusions
• Visa fees and documentation
• Emergency medical expenses`,
    dayPlans: [
      {
        day: 1,
        sightseeing: ['1'],
        hotel: { place: 'Seminyak', hotelId: '2', roomTypeId: '2-1' },
        activities: [],
        entryTickets: ['1'],
        meals: ['1']
      },
      {
        day: 2,
        sightseeing: ['2'],
        hotel: { place: 'Seminyak', hotelId: '2', roomTypeId: '2-1' },
        activities: [],
        entryTickets: ['2'],
        meals: ['1']
      },
      {
        day: 3,
        sightseeing: ['8'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-1' },
        activities: [{ activityId: '1', optionId: '1-1' }],
        entryTickets: ['10', '11'],
        meals: ['1']
      },
      {
        day: 4,
        sightseeing: ['9'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-1' },
        activities: [],
        entryTickets: ['12', '13'],
        meals: ['1']
      },
      {
        day: 5,
        sightseeing: [],
        hotel: null,
        activities: [],
        entryTickets: [],
        meals: ['1']
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Bali Adventure - 7 Days',
    numberOfDays: 7,
    transportationMode: 'Toyota Avanza',
    baseCost: 1200,
    inclusions: `• 7 days self-drive Toyota Avanza rental
• 6 nights accommodation in mixed 3-4 star hotels
• Daily breakfast at hotels
• Comprehensive sightseeing: Tanah Lot, Uluwatu, Besakih Temple, Jatiluwih Rice Terraces
• Adventure activities: Bali Swing, ATV Ride, White Water Rafting
• Entry tickets to all attractions
• Fuel allowance and insurance
• GPS navigation system
• 24/7 roadside assistance`,
    exclusions: `• International/domestic flights
• Travel insurance beyond vehicle coverage
• Lunch and dinner
• Personal expenses and shopping
• Tips and gratuities
• Additional fuel beyond allowance
• Traffic violation fines
• Visa fees and documentation
• Emergency medical expenses`,
    dayPlans: [
      {
        day: 1,
        sightseeing: ['17'],
        hotel: { place: 'Kuta', hotelId: '3', roomTypeId: '3-1' },
        activities: [],
        entryTickets: ['1'],
        meals: ['1']
      },
      {
        day: 2,
        sightseeing: ['18'],
        hotel: { place: 'Kuta', hotelId: '3', roomTypeId: '3-1' },
        activities: [],
        entryTickets: ['2'],
        meals: ['1']
      },
      {
        day: 3,
        sightseeing: ['21'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-2' },
        activities: [{ activityId: '1', optionId: '1-2' }],
        entryTickets: ['10', '11'],
        meals: ['1']
      },
      {
        day: 4,
        sightseeing: ['22'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-2' },
        activities: [{ activityId: '2', optionId: '2-1' }],
        entryTickets: ['12', '13'],
        meals: ['1']
      },
      {
        day: 5,
        sightseeing: ['19'],
        hotel: { place: 'Sanur', hotelId: '4', roomTypeId: '4-1' },
        activities: [{ activityId: '3', optionId: '3-1' }],
        entryTickets: ['4'],
        meals: ['1']
      },
      {
        day: 6,
        sightseeing: ['20'],
        hotel: { place: 'Sanur', hotelId: '4', roomTypeId: '4-1' },
        activities: [],
        entryTickets: [],
        meals: ['1']
      },
      {
        day: 7,
        sightseeing: [],
        hotel: null,
        activities: [],
        entryTickets: [],
        meals: ['1']
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'Bali Cultural Experience - 3 Days',
    numberOfDays: 3,
    transportationMode: 'Honda Vario',
    baseCost: 320,
    inclusions: `• 3 days Honda Vario scooter rental
• 2 nights accommodation in 3-star hotel
• Daily breakfast
• Cultural sightseeing: Tegallalang Rice Terraces, Tirta Empul Temple
• Traditional activities: Batik Making Workshop, Wood Carving Class
• Entry tickets to cultural sites
• Helmet and safety gear
• Basic insurance coverage`,
    exclusions: `• International/domestic flights
• Travel insurance beyond basic coverage
• Lunch and dinner
• Personal expenses and shopping
• Tips and gratuities
• Fuel costs
• Traffic violation fines
• Visa fees and documentation
• Emergency medical expenses`,
    dayPlans: [
      {
        day: 1,
        sightseeing: ['27'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-1' },
        activities: [{ activityId: '7', optionId: '7-1' }],
        entryTickets: ['10', '11'],
        meals: ['1']
      },
      {
        day: 2,
        sightseeing: ['28'],
        hotel: { place: 'Ubud', hotelId: '1', roomTypeId: '1-1' },
        activities: [{ activityId: '9', optionId: '9-1' }],
        entryTickets: ['12', '13'],
        meals: ['1']
      },
      {
        day: 3,
        sightseeing: [],
        hotel: null,
        activities: [],
        entryTickets: [],
        meals: ['1']
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin'
  }
];

const initialState: DataState = {
  clients: [],
  transportations: demoTransportations,
  hotels: demoHotels,
  sightseeings: demoSightseeings,
  activities: demoActivities,
  entryTickets: demoEntryTickets,
  meals: demoMeals,
  itineraries: [],
  fixedItineraries: demoFixedItineraries
};

const dataReducer = (state: DataState, action: DataAction): DataState => {
  let newState: DataState;
  
  switch (action.type) {
    case 'SET_DATA':
      newState = { ...state, ...action.payload };
      break;
    case 'ADD_CLIENT':
      newState = { ...state, clients: [...state.clients, action.payload] };
      break;
    case 'UPDATE_CLIENT':
      newState = {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        )
      };
      break;
    case 'DELETE_CLIENT':
      newState = {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };
      break;
    case 'ADD_TRANSPORTATION':
      newState = { ...state, transportations: [...state.transportations, action.payload] };
      break;
    case 'UPDATE_TRANSPORTATION':
      newState = {
        ...state,
        transportations: state.transportations.map(transport =>
          transport.id === action.payload.id ? action.payload : transport
        )
      };
      break;
    case 'DELETE_TRANSPORTATION':
      newState = {
        ...state,
        transportations: state.transportations.filter(transport => transport.id !== action.payload)
      };
      break;
    case 'ADD_HOTEL':
      newState = { ...state, hotels: [...state.hotels, action.payload] };
      break;
    case 'UPDATE_HOTEL':
      newState = {
        ...state,
        hotels: state.hotels.map(hotel =>
          hotel.id === action.payload.id ? action.payload : hotel
        )
      };
      break;
    case 'DELETE_HOTEL':
      newState = {
        ...state,
        hotels: state.hotels.filter(hotel => hotel.id !== action.payload)
      };
      break;
    case 'ADD_SIGHTSEEING':
      newState = { ...state, sightseeings: [...state.sightseeings, action.payload] };
      break;
    case 'UPDATE_SIGHTSEEING':
      newState = {
        ...state,
        sightseeings: state.sightseeings.map(sight =>
          sight.id === action.payload.id ? action.payload : sight
        )
      };
      break;
    case 'DELETE_SIGHTSEEING':
      newState = {
        ...state,
        sightseeings: state.sightseeings.filter(sight => sight.id !== action.payload)
      };
      break;
    case 'ADD_ACTIVITY':
      newState = { ...state, activities: [...state.activities, action.payload] };
      break;
    case 'UPDATE_ACTIVITY':
      newState = {
        ...state,
        activities: state.activities.map(activity =>
          activity.id === action.payload.id ? action.payload : activity
        )
      };
      break;
    case 'DELETE_ACTIVITY':
      newState = {
        ...state,
        activities: state.activities.filter(activity => activity.id !== action.payload)
      };
      break;
    case 'ADD_ENTRY_TICKET':
      newState = { ...state, entryTickets: [...state.entryTickets, action.payload] };
      break;
    case 'UPDATE_ENTRY_TICKET':
      newState = {
        ...state,
        entryTickets: state.entryTickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        )
      };
      break;
    case 'DELETE_ENTRY_TICKET':
      newState = {
        ...state,
        entryTickets: state.entryTickets.filter(ticket => ticket.id !== action.payload)
      };
      break;
    case 'ADD_MEAL':
      newState = { ...state, meals: [...state.meals, action.payload] };
      break;
    case 'UPDATE_MEAL':
      newState = {
        ...state,
        meals: state.meals.map(meal =>
          meal.id === action.payload.id ? action.payload : meal
        )
      };
      break;
    case 'DELETE_MEAL':
      newState = {
        ...state,
        meals: state.meals.filter(meal => meal.id !== action.payload)
      };
      break;
    case 'ADD_ITINERARY':
      newState = { ...state, itineraries: [...state.itineraries, action.payload] };
      break;
    case 'UPDATE_ITINERARY':
      newState = {
        ...state,
        itineraries: state.itineraries.map(itinerary =>
          itinerary.id === action.payload.id ? action.payload : itinerary
        )
      };
      break;
    case 'DELETE_ITINERARY':
      newState = {
        ...state,
        itineraries: state.itineraries.filter(itinerary => itinerary.id !== action.payload)
      };
      break;
    case 'ADD_FIXED_ITINERARY':
      newState = { ...state, fixedItineraries: [...state.fixedItineraries, action.payload] };
      break;
    case 'UPDATE_FIXED_ITINERARY':
      newState = {
        ...state,
        fixedItineraries: state.fixedItineraries.map(itinerary =>
          itinerary.id === action.payload.id ? action.payload : itinerary
        )
      };
      break;
    case 'DELETE_FIXED_ITINERARY':
      newState = {
        ...state,
        fixedItineraries: state.fixedItineraries.filter(itinerary => itinerary.id !== action.payload)
      };
      break;
    default:
      return state;
  }

  // Save to localStorage whenever state changes
  if (!isSupabaseConfigured()) {
    try {
      localStorage.setItem('appData', JSON.stringify(newState));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  return newState;
};

const DataContext = createContext<{
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  updateItinerary: (itinerary: Itinerary, changeType: ItineraryChange['changeType'], description: string) => Promise<void>;
  getLatestItinerary: (clientId: string) => Itinerary | null;
  addClient: (client: Client) => Promise<void>;
  updateClientData: (client: Client) => Promise<void>;
  deleteClientData: (clientId: string) => Promise<void>;
  addTransportation: (transportation: Transportation) => Promise<void>;
  updateTransportationData: (transportation: Transportation) => Promise<void>;
  deleteTransportationData: (transportationId: string) => Promise<void>;
  addHotel: (hotel: Hotel) => Promise<void>;
  updateHotelData: (hotel: Hotel) => Promise<void>;
  deleteHotelData: (hotelId: string) => Promise<void>;
  addSightseeing: (sightseeing: Sightseeing) => Promise<void>;
  updateSightseeingData: (sightseeing: Sightseeing) => Promise<void>;
  deleteSightseeingData: (sightseeingId: string) => Promise<void>;
  addActivity: (activity: Activity) => Promise<void>;
  updateActivityData: (activity: Activity) => Promise<void>;
  deleteActivityData: (activityId: string) => Promise<void>;
  addEntryTicket: (entryTicket: EntryTicket) => Promise<void>;
  updateEntryTicketData: (entryTicket: EntryTicket) => Promise<void>;
  deleteEntryTicketData: (entryTicketId: string) => Promise<void>;
  addMeal: (meal: Meal) => Promise<void>;
  updateMealData: (meal: Meal) => Promise<void>;
  deleteMealData: (mealId: string) => Promise<void>;
  addItinerary: (itinerary: Itinerary) => Promise<void>;
  updateItineraryData: (itinerary: Itinerary) => Promise<void>;
  deleteItineraryData: (itineraryId: string) => Promise<void>;
  addFixedItinerary: (fixedItinerary: FixedItinerary) => Promise<void>;
  updateFixedItineraryData: (fixedItinerary: FixedItinerary) => Promise<void>;
  deleteFixedItineraryData: (fixedItineraryId: string) => Promise<void>;
} | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = (event: any) => {
      if (event.detail) {
        dispatch({ type: 'SET_DATA', payload: event.detail });
      }
    };

    window.addEventListener('refreshData', handleDataRefresh);
    
    // Also listen for storage changes to sync across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appData' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          dispatch({ type: 'SET_DATA', payload: newData });
        } catch (error) {
          console.error('Error parsing storage data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('refreshData', handleDataRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load data from Supabase on mount
  useEffect(() => {
    let isLoading = false;

    const loadInitialData = async () => {
      if (isLoading) {
        console.log('Data load already in progress, skipping...');
        return;
      }

      if (isSupabaseConfigured()) {
        isLoading = true;
        try {
          console.log('Loading initial data from Supabase...');
          const data = await fetchAllData();
          if (data) {
            console.log('Activities loaded:', data.activities.length);
            data.activities.forEach(a => {
              console.log(`Activity: ${a.name}, Options: ${a.options?.length || 0}`);
            });
            dispatch({ type: 'SET_DATA', payload: data });
            console.log('Initial data loaded successfully');
          } else {
            // If no data from Supabase, use demo data
            dispatch({ type: 'SET_DATA', payload: initialState });
          }
        } catch (error) {
          console.error('Error fetching data from Supabase:', error);
          // Use demo data if Supabase fetch fails
          dispatch({ type: 'SET_DATA', payload: initialState });
        } finally {
          isLoading = false;
        }
      } else {
        // Only use localStorage if Supabase is NOT configured
        const savedData = localStorage.getItem('appData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            // Merge with demo data to ensure we have all the new demo items
            const mergedData = {
              clients: parsedData.clients || [],
              transportations: [...demoTransportations, ...(parsedData.transportations || [])].filter((item, index, self) =>
                index === self.findIndex(t => t.id === item.id)
              ),
              hotels: [...demoHotels, ...(parsedData.hotels || [])].filter((item, index, self) =>
                index === self.findIndex(h => h.id === item.id)
              ),
              sightseeings: [...demoSightseeings, ...(parsedData.sightseeings || [])].filter((item, index, self) =>
                index === self.findIndex(s => s.id === item.id)
              ),
              activities: [...demoActivities, ...(parsedData.activities || [])].filter((item, index, self) =>
                index === self.findIndex(a => a.id === item.id)
              ),
              entryTickets: [...demoEntryTickets, ...(parsedData.entryTickets || [])].filter((item, index, self) =>
                index === self.findIndex(e => e.id === item.id)
              ),
              meals: [...demoMeals, ...(parsedData.meals || [])].filter((item, index, self) =>
                index === self.findIndex(m => m.id === item.id)
              ),
              itineraries: parsedData.itineraries || [],
              fixedItineraries: [...demoFixedItineraries, ...(parsedData.fixedItineraries || [])].filter((item, index, self) =>
                index === self.findIndex(f => f.id === item.id)
              )
            };
            dispatch({ type: 'SET_DATA', payload: mergedData });
          } catch (error) {
            console.error('Error loading data from localStorage:', error);
            dispatch({ type: 'SET_DATA', payload: initialState });
          }
        } else {
          dispatch({ type: 'SET_DATA', payload: initialState });
        }
      }
    };
    
    loadInitialData();

    // Listen for data refresh events
    const handleDataRefresh = (event: any) => {
      if (event.detail) {
        dispatch({ type: 'SET_DATA', payload: event.detail });
      }
    };
    window.addEventListener('refreshData', handleDataRefresh);

    // Listen for storage changes to sync across tabs/components (only for demo mode)
    const handleStorageChange = (e: StorageEvent) => {
      if (!isSupabaseConfigured() && e.key === 'appData' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          dispatch({ type: 'SET_DATA', payload: newData });
        } catch (error) {
          console.error('Error parsing storage data:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('refreshData', handleDataRefresh);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // CRUD operations that work with both Supabase and localStorage
  const addClient = async (client: Client) => {
    if (isSupabaseConfigured()) {
      try {
        const newClient = await insertClient(client);
        if (newClient) {
          dispatch({ type: 'ADD_CLIENT', payload: newClient });
        }
      } catch (error) {
        console.error('Error adding client to Supabase:', error);
        throw error;
      }
    } else {
      dispatch({ type: 'ADD_CLIENT', payload: client });
    }
  };

  const updateClientData = async (client: Client) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedClient = await updateClient(client);
        if (updatedClient) {
          dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
        }
      } catch (error) {
        console.error('Error updating client in Supabase:', error);
        throw error;
      }
    } else {
      dispatch({ type: 'UPDATE_CLIENT', payload: client });
    }
  };

  const deleteClientData = async (clientId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteClient(clientId);
        dispatch({ type: 'DELETE_CLIENT', payload: clientId });
      } catch (error) {
        console.error('Error deleting client from Supabase:', error);
        throw error;
      }
    } else {
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
    }
  };

  const addTransportation = async (transportation: Transportation) => {
    if (isSupabaseConfigured()) {
      try {
        const newTransportation = await insertTransportation(transportation);
        if (newTransportation) dispatch({ type: 'ADD_TRANSPORTATION', payload: newTransportation });
      } catch (error) {
        console.error('Error adding transportation to Supabase:', error);
        dispatch({ type: 'ADD_TRANSPORTATION', payload: transportation });
      }
    } else {
      dispatch({ type: 'ADD_TRANSPORTATION', payload: transportation });
    }
  };

  const updateTransportationData = async (transportation: Transportation) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedTransportation = await updateTransportation(transportation);
        if (updatedTransportation) dispatch({ type: 'UPDATE_TRANSPORTATION', payload: updatedTransportation });
      } catch (error) {
        console.error('Error updating transportation in Supabase:', error);
        dispatch({ type: 'UPDATE_TRANSPORTATION', payload: transportation });
      }
    } else {
      dispatch({ type: 'UPDATE_TRANSPORTATION', payload: transportation });
    }
  };

  const deleteTransportationData = async (transportationId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteTransportation(transportationId);
        dispatch({ type: 'DELETE_TRANSPORTATION', payload: transportationId });
      } catch (error) {
        console.error('Error deleting transportation from Supabase:', error);
        dispatch({ type: 'DELETE_TRANSPORTATION', payload: transportationId });
      }
    } else {
      dispatch({ type: 'DELETE_TRANSPORTATION', payload: transportationId });
    }
  };

  const addHotel = async (hotel: Hotel) => {
    if (isSupabaseConfigured()) {
      try {
        const newHotel = await insertHotel(hotel);
        if (newHotel) dispatch({ type: 'ADD_HOTEL', payload: newHotel });
      } catch (error) {
        console.error('Error adding hotel to Supabase:', error);
        dispatch({ type: 'ADD_HOTEL', payload: hotel });
      }
    } else {
      dispatch({ type: 'ADD_HOTEL', payload: hotel });
    }
  };

  const updateHotelData = async (hotel: Hotel) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedHotel = await updateHotel(hotel);
        if (updatedHotel) dispatch({ type: 'UPDATE_HOTEL', payload: updatedHotel });
      } catch (error) {
        console.error('Error updating hotel in Supabase:', error);
        dispatch({ type: 'UPDATE_HOTEL', payload: hotel });
      }
    } else {
      dispatch({ type: 'UPDATE_HOTEL', payload: hotel });
    }
  };

  const deleteHotelData = async (hotelId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteHotel(hotelId);
        dispatch({ type: 'DELETE_HOTEL', payload: hotelId });
      } catch (error) {
        console.error('Error deleting hotel from Supabase:', error);
        dispatch({ type: 'DELETE_HOTEL', payload: hotelId });
      }
    } else {
      dispatch({ type: 'DELETE_HOTEL', payload: hotelId });
    }
  };

  const addSightseeing = async (sightseeing: Sightseeing) => {
    if (isSupabaseConfigured()) {
      try {
        const newSightseeing = await insertSightseeing(sightseeing);
        if (newSightseeing) dispatch({ type: 'ADD_SIGHTSEEING', payload: newSightseeing });
      } catch (error) {
        console.error('Error adding sightseeing to Supabase:', error);
        dispatch({ type: 'ADD_SIGHTSEEING', payload: sightseeing });
      }
    } else {
      dispatch({ type: 'ADD_SIGHTSEEING', payload: sightseeing });
    }
  };

  const updateSightseeingData = async (sightseeing: Sightseeing) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedSightseeing = await updateSightseeing(sightseeing);
        if (updatedSightseeing) dispatch({ type: 'UPDATE_SIGHTSEEING', payload: updatedSightseeing });
      } catch (error) {
        console.error('Error updating sightseeing in Supabase:', error);
        dispatch({ type: 'UPDATE_SIGHTSEEING', payload: sightseeing });
      }
    } else {
      dispatch({ type: 'UPDATE_SIGHTSEEING', payload: sightseeing });
    }
  };

  const deleteSightseeingData = async (sightseeingId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteSightseeing(sightseeingId);
        dispatch({ type: 'DELETE_SIGHTSEEING', payload: sightseeingId });
      } catch (error) {
        console.error('Error deleting sightseeing from Supabase:', error);
        dispatch({ type: 'DELETE_SIGHTSEEING', payload: sightseeingId });
      }
    } else {
      dispatch({ type: 'DELETE_SIGHTSEEING', payload: sightseeingId });
    }
  };

  const addActivity = async (activity: Activity) => {
    if (isSupabaseConfigured()) {
      try {
        console.log('Adding activity:', activity.name, 'with options:', activity.options.length);
        const newActivity = await insertActivity(activity);
        console.log('Received activity from DB:', newActivity?.name, 'with options:', newActivity?.options?.length || 0);
        if (newActivity) dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
      } catch (error) {
        console.error('Error adding activity to Supabase:', error);
        dispatch({ type: 'ADD_ACTIVITY', payload: activity });
      }
    } else {
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
    }
  };

  const updateActivityData = async (activity: Activity) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedActivity = await updateActivity(activity);
        if (updatedActivity) dispatch({ type: 'UPDATE_ACTIVITY', payload: updatedActivity });
      } catch (error) {
        console.error('Error updating activity in Supabase:', error);
        dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
      }
    } else {
      dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
    }
  };

  const deleteActivityData = async (activityId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteActivity(activityId);
        dispatch({ type: 'DELETE_ACTIVITY', payload: activityId });
      } catch (error) {
        console.error('Error deleting activity from Supabase:', error);
        dispatch({ type: 'DELETE_ACTIVITY', payload: activityId });
      }
    } else {
      dispatch({ type: 'DELETE_ACTIVITY', payload: activityId });
    }
  };

  const addEntryTicket = async (entryTicket: EntryTicket) => {
    if (isSupabaseConfigured()) {
      try {
        const newEntryTicket = await insertEntryTicket(entryTicket);
        if (newEntryTicket) dispatch({ type: 'ADD_ENTRY_TICKET', payload: newEntryTicket });
      } catch (error) {
        console.error('Error adding entry ticket to Supabase:', error);
        dispatch({ type: 'ADD_ENTRY_TICKET', payload: entryTicket });
      }
    } else {
      dispatch({ type: 'ADD_ENTRY_TICKET', payload: entryTicket });
    }
  };

  const updateEntryTicketData = async (entryTicket: EntryTicket) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedEntryTicket = await updateEntryTicket(entryTicket);
        if (updatedEntryTicket) dispatch({ type: 'UPDATE_ENTRY_TICKET', payload: updatedEntryTicket });
      } catch (error) {
        console.error('Error updating entry ticket in Supabase:', error);
        dispatch({ type: 'UPDATE_ENTRY_TICKET', payload: entryTicket });
      }
    } else {
      dispatch({ type: 'UPDATE_ENTRY_TICKET', payload: entryTicket });
    }
  };

  const deleteEntryTicketData = async (entryTicketId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteEntryTicket(entryTicketId);
        dispatch({ type: 'DELETE_ENTRY_TICKET', payload: entryTicketId });
      } catch (error) {
        console.error('Error deleting entry ticket from Supabase:', error);
        dispatch({ type: 'DELETE_ENTRY_TICKET', payload: entryTicketId });
      }
    } else {
      dispatch({ type: 'DELETE_ENTRY_TICKET', payload: entryTicketId });
    }
  };

  const addMeal = async (meal: Meal) => {
    if (isSupabaseConfigured()) {
      try {
        const newMeal = await insertMeal(meal);
        if (newMeal) dispatch({ type: 'ADD_MEAL', payload: newMeal });
      } catch (error) {
        console.error('Error adding meal to Supabase:', error);
        dispatch({ type: 'ADD_MEAL', payload: meal });
      }
    } else {
      dispatch({ type: 'ADD_MEAL', payload: meal });
    }
  };

  const updateMealData = async (meal: Meal) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedMeal = await updateMeal(meal);
        if (updatedMeal) dispatch({ type: 'UPDATE_MEAL', payload: updatedMeal });
      } catch (error) {
        console.error('Error updating meal in Supabase:', error);
        dispatch({ type: 'UPDATE_MEAL', payload: meal });
      }
    } else {
      dispatch({ type: 'UPDATE_MEAL', payload: meal });
    }
  };

  const deleteMealData = async (mealId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteMeal(mealId);
        dispatch({ type: 'DELETE_MEAL', payload: mealId });
      } catch (error) {
        console.error('Error deleting meal from Supabase:', error);
        dispatch({ type: 'DELETE_MEAL', payload: mealId });
      }
    } else {
      dispatch({ type: 'DELETE_MEAL', payload: mealId });
    }
  };

  const addItinerary = async (itinerary: Itinerary) => {
    if (isSupabaseConfigured()) {
      try {
        const newItinerary = await insertItinerary(itinerary);
        if (newItinerary) dispatch({ type: 'ADD_ITINERARY', payload: newItinerary });
      } catch (error) {
        console.error('Error adding itinerary to Supabase:', error);
        dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      }
    } else {
      dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
    }
  };

  const updateItineraryData = async (itinerary: Itinerary) => {
    if (isSupabaseConfigured()) {
      try {
        // Check if itinerary exists in state
        const existingItinerary = state.itineraries.find(i => i.id === itinerary.id);

        if (existingItinerary) {
          // Update existing itinerary
          const updatedItinerary = await updateItinerary(itinerary);
          if (updatedItinerary) dispatch({ type: 'UPDATE_ITINERARY', payload: updatedItinerary });
        } else {
          // Insert new itinerary
          const newItinerary = await insertItinerary(itinerary);
          if (newItinerary) dispatch({ type: 'ADD_ITINERARY', payload: newItinerary });
        }
      } catch (error) {
        console.error('Error updating itinerary in Supabase:', error);
        // Fallback to local update
        const existingItinerary = state.itineraries.find(i => i.id === itinerary.id);
        if (existingItinerary) {
          dispatch({ type: 'UPDATE_ITINERARY', payload: itinerary });
        } else {
          dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
        }
      }
    } else {
      const existingItinerary = state.itineraries.find(i => i.id === itinerary.id);
      if (existingItinerary) {
        dispatch({ type: 'UPDATE_ITINERARY', payload: itinerary });
      } else {
        dispatch({ type: 'ADD_ITINERARY', payload: itinerary });
      }
    }
  };

  const deleteItineraryData = async (itineraryId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteItinerary(itineraryId);
        dispatch({ type: 'DELETE_ITINERARY', payload: itineraryId });
      } catch (error) {
        console.error('Error deleting itinerary from Supabase:', error);
        dispatch({ type: 'DELETE_ITINERARY', payload: itineraryId });
      }
    } else {
      dispatch({ type: 'DELETE_ITINERARY', payload: itineraryId });
    }
  };

  const addFixedItinerary = async (fixedItinerary: FixedItinerary) => {
    if (isSupabaseConfigured()) {
      try {
        const newFixedItinerary = await insertFixedItinerary(fixedItinerary);
        if (newFixedItinerary) dispatch({ type: 'ADD_FIXED_ITINERARY', payload: newFixedItinerary });
      } catch (error) {
        console.error('Error adding fixed itinerary to Supabase:', error);
        dispatch({ type: 'ADD_FIXED_ITINERARY', payload: fixedItinerary });
      }
    } else {
      dispatch({ type: 'ADD_FIXED_ITINERARY', payload: fixedItinerary });
    }
  };

  const updateFixedItineraryData = async (fixedItinerary: FixedItinerary) => {
    if (isSupabaseConfigured()) {
      try {
        const updatedFixedItinerary = await updateFixedItinerary(fixedItinerary);
        if (updatedFixedItinerary) dispatch({ type: 'UPDATE_FIXED_ITINERARY', payload: updatedFixedItinerary });
      } catch (error) {
        console.error('Error updating fixed itinerary in Supabase:', error);
        dispatch({ type: 'UPDATE_FIXED_ITINERARY', payload: fixedItinerary });
      }
    } else {
      dispatch({ type: 'UPDATE_FIXED_ITINERARY', payload: fixedItinerary });
    }
  };

  const deleteFixedItineraryData = async (fixedItineraryId: string) => {
    if (isSupabaseConfigured()) {
      try {
        await deleteFixedItinerary(fixedItineraryId);
        dispatch({ type: 'DELETE_FIXED_ITINERARY', payload: fixedItineraryId });
      } catch (error) {
        console.error('Error deleting fixed itinerary from Supabase:', error);
        dispatch({ type: 'DELETE_FIXED_ITINERARY', payload: fixedItineraryId });
      }
    } else {
      dispatch({ type: 'DELETE_FIXED_ITINERARY', payload: fixedItineraryId });
    }
  };

  const updateItineraryWithChangeLog = async (
    itinerary: Itinerary,
    changeType: ItineraryChange['changeType'],
    description: string
  ): Promise<void> => {
    try {
      const change: ItineraryChange = {
        id: Date.now().toString(),
        version: itinerary.version,
        changeType,
        description,
        timestamp: new Date().toISOString(),
        updatedBy: itinerary.updatedBy
      };

      const updatedItinerary: Itinerary = {
        ...itinerary,
        changeLog: [...(itinerary.changeLog || []), change]
      };

      if (isSupabaseConfigured()) {
        await updateItineraryData(updatedItinerary);
      } else {
        const existingIndex = state.itineraries.findIndex(i => i.client.id === itinerary.client.id);
        if (existingIndex >= 0) {
          dispatch({ type: 'UPDATE_ITINERARY', payload: updatedItinerary });
        } else {
          dispatch({ type: 'ADD_ITINERARY', payload: updatedItinerary });
        }
      }
    } catch (error) {
      console.error('Error updating itinerary with change log:', error);
      throw error;
    }
  };

  const getLatestItinerary = (clientId: string): Itinerary | null => {
    const clientItineraries = state.itineraries.filter(i => i.client.id === clientId);
    if (clientItineraries.length === 0) return null;

    // Return the itinerary with the highest version number
    return clientItineraries.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    );
  };

  const refreshAllData = async () => {
    if (isSupabaseConfigured()) {
      try {
        console.log('Refreshing all data from Supabase...');
        const data = await fetchAllData();
        if (data) {
          dispatch({ type: 'SET_DATA', payload: data });
          console.log('Data refreshed successfully');
        }
      } catch (error) {
        console.error('Error refreshing data from Supabase:', error);
        throw error;
      }
    }
  };

  return (
    <DataContext.Provider value={{
      state,
      dispatch,
      updateItinerary: updateItineraryWithChangeLog,
      getLatestItinerary,
      refreshAllData,
      addClient,
      updateClientData,
      deleteClientData,
      addTransportation,
      updateTransportationData,
      deleteTransportationData,
      addHotel,
      updateHotelData,
      deleteHotelData,
      addSightseeing,
      updateSightseeingData,
      deleteSightseeingData,
      addActivity,
      updateActivityData,
      deleteActivityData,
      addEntryTicket,
      updateEntryTicketData,
      deleteEntryTicketData,
      addMeal,
      updateMealData,
      deleteMealData,
      addItinerary,
      updateItineraryData,
      deleteItineraryData,
      addFixedItinerary,
      updateFixedItineraryData,
      deleteFixedItineraryData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};