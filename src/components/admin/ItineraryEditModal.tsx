import React, { useState, useEffect } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateItineraryCost } from '../../utils/calculations';
import { generateUUID } from '../../utils/uuid';
import { X, Save, MapPin, Building2, Camera, Ticket, Utensils, DollarSign, Search, Check, ChevronRight, ChevronLeft, Edit, Users, Calendar, Phone, Clock } from 'lucide-react';
import ViewOnlyClientDetails from './ViewOnlyClientDetails';

interface ItineraryEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

type ViewMode = 'client-details' | 'day-planning' | 'edit-client';
type PlanningStep = 'sightseeing' | 'hotel' | 'activities' | 'tickets' | 'meals';

const ItineraryEditModal: React.FC<ItineraryEditModalProps> = ({ client, onClose, onSave }) => {
  const { state, updateItinerary, getLatestItinerary } = useData();
  const { state: authState } = useAuth();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;

  const [viewMode, setViewMode] = useState<ViewMode>('client-details');
  const [editableClient, setEditableClient] = useState<Client>(client);
  const [numberOfDays, setNumberOfDays] = useState(client.numberOfDays);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [profitMargin, setProfitMargin] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(83);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentStep, setCurrentStep] = useState<PlanningStep>('sightseeing');
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [searchTerms, setSearchTerms] = useState<Record<PlanningStep, string>>({
    sightseeing: '',
    hotel: '',
    activities: '',
    tickets: '',
    meals: ''
  });

  const latestItinerary = getLatestItinerary(client.id);

  const currentBaseCost = React.useMemo(() => {
    if (dayPlans.length === 0) return latestItinerary?.totalBaseCost || 0;
    return calculateItineraryCost(
      { ...editableClient, numberOfDays },
      dayPlans,
      hotels,
      sightseeings,
      activities,
      entryTickets,
      meals,
      transportations
    );
  }, [editableClient, numberOfDays, dayPlans, hotels, sightseeings, activities, entryTickets, meals, transportations, latestItinerary]);

  const finalPrice = currentBaseCost + profitMargin;

  useEffect(() => {
    let initialDayPlans: DayPlan[];

    if (latestItinerary && latestItinerary.dayPlans.length > 0) {
      initialDayPlans = Array.from({ length: numberOfDays }, (_, index) => {
        const dayNumber = index + 1;
        const existingDay = latestItinerary.dayPlans.find(dp => dp.day === dayNumber);

        return existingDay || {
          day: dayNumber,
          sightseeing: [],
          hotel: null,
          activities: [],
          entryTickets: [],
          meals: []
        };
      });
    } else {
      initialDayPlans = Array.from({ length: numberOfDays }, (_, index) => ({
        day: index + 1,
        sightseeing: [],
        hotel: null,
        activities: [],
        entryTickets: [],
        meals: []
      }));
    }

    setDayPlans(initialDayPlans);
  }, [numberOfDays, latestItinerary]);

  useEffect(() => {
    if (latestItinerary) {
      setProfitMargin(latestItinerary.profitMargin);
      setExchangeRate(latestItinerary.exchangeRate);
    }
  }, [latestItinerary]);

  const filteredSightseeing = sightseeings.filter(sight => {
    const transportMode = editableClient.transportationMode.toLowerCase();
    if (transportMode.includes('cab')) return sight.transportationMode === 'cab';
    if (transportMode.includes('car')) return sight.transportationMode === 'self-drive-car';
    if (transportMode.includes('scooter')) return sight.transportationMode === 'self-drive-scooter';
    return true;
  });

  const uniquePlaces = [...new Set(hotels.map(hotel => hotel.place))];
  const countryCodes = [
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+61', country: 'AU' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
    { code: '+65', country: 'SG' },
    { code: '+60', country: 'MY' },
    { code: '+62', country: 'ID' },
  ];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const updateSearchTerm = (step: PlanningStep, term: string) => {
    setSearchTerms(prev => ({ ...prev, [step]: term }));
  };

  const clearSearch = (step: PlanningStep) => {
    setSearchTerms(prev => ({ ...prev, [step]: '' }));
  };

  const getAvailableItemsForDay = (currentDayIndex: number) => {
    const previousDays = dayPlans.slice(0, currentDayIndex);

    const selectedSightseeingIds = new Set<string>();
    previousDays.forEach(day => {
      day.sightseeing.forEach(id => selectedSightseeingIds.add(id));
    });

    const selectedActivityIds = new Set<string>();
    previousDays.forEach(day => {
      day.activities.forEach(activity => selectedActivityIds.add(activity.activityId));
    });

    const selectedTicketIds = new Set<string>();
    previousDays.forEach(day => {
      day.entryTickets.forEach(id => selectedTicketIds.add(id));
    });

    return {
      availableSightseeing: filteredSightseeing.filter(sight => !selectedSightseeingIds.has(sight.id)),
      selectedActivityIds,
      selectedTicketIds
    };
  };

  const getFilteredSightseeing = (dayIndex: number) => {
    const { availableSightseeing } = getAvailableItemsForDay(dayIndex);
    const searchTerm = searchTerms.sightseeing.toLowerCase();
    return availableSightseeing.filter(sight =>
      sight.name.toLowerCase().includes(searchTerm) ||
      sight.description.toLowerCase().includes(searchTerm)
    );
  };

  const getFilteredActivities = (dayIndex: number) => {
    const { selectedActivityIds } = getAvailableItemsForDay(dayIndex);
    const searchTerm = searchTerms.activities.toLowerCase();
    return activities.filter(activity =>
      !selectedActivityIds.has(activity.id) &&
      (activity.name.toLowerCase().includes(searchTerm) ||
       activity.location.toLowerCase().includes(searchTerm))
    );
  };

  const getFilteredTickets = (dayIndex: number, sightseeingIds: string[]) => {
    const { selectedTicketIds } = getAvailableItemsForDay(dayIndex);
    const searchTerm = searchTerms.tickets.toLowerCase();
    return entryTickets.filter(ticket =>
      sightseeingIds.includes(ticket.sightseeingId) &&
      !selectedTicketIds.has(ticket.id) &&
      ticket.name.toLowerCase().includes(searchTerm)
    );
  };

  const getFilteredMeals = (mealType: string) => {
    const searchTerm = searchTerms.meals.toLowerCase();
    return meals.filter(meal =>
      meal.type === mealType &&
      meal.place.toLowerCase().includes(searchTerm)
    );
  };

  const getFilteredHotels = (place: string) => {
    const searchTerm = searchTerms.hotel.toLowerCase();
    return getHotelsForPlace(place).filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm)
    );
  };

  const updateDayPlan = (dayIndex: number, field: keyof DayPlan, value: any) => {
    const updatedPlans = [...dayPlans];
    updatedPlans[dayIndex] = { ...updatedPlans[dayIndex], [field]: value };
    setDayPlans(updatedPlans);
  };

  const getHotelsForPlace = (place: string) => {
    return hotels.filter(hotel => hotel.place === place);
  };

  const getRoomTypesForHotel = (hotelId: string) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.roomTypes : [];
  };

  const handleActivitySelection = (dayIndex: number, activityId: string) => {
    const currentActivities = dayPlans[dayIndex].activities;
    const exists = currentActivities.find(a => a.activityId === activityId);

    if (exists) {
      const updated = currentActivities.filter(a => a.activityId !== activityId);
      updateDayPlan(dayIndex, 'activities', updated);
    } else {
      const activity = activities.find(a => a.id === activityId);
      if (activity && activity.options.length > 0) {
        const updated = [...currentActivities, {
          activityId,
          optionId: activity.options[0].id
        }];
        updateDayPlan(dayIndex, 'activities', updated);
      }
    }
  };

  const updateActivityOption = (dayIndex: number, activityId: string, optionId: string) => {
    const currentActivities = [...dayPlans[dayIndex].activities];
    const activityIndex = currentActivities.findIndex(a => a.activityId === activityId);
    if (activityIndex !== -1) {
      currentActivities[activityIndex].optionId = optionId;
      updateDayPlan(dayIndex, 'activities', currentActivities);
    }
  };

  const getStepIcon = (step: PlanningStep) => {
    switch (step) {
      case 'sightseeing': return <MapPin className="h-5 w-5" />;
      case 'hotel': return <Building2 className="h-5 w-5" />;
      case 'activities': return <Camera className="h-5 w-5" />;
      case 'tickets': return <Ticket className="h-5 w-5" />;
      case 'meals': return <Utensils className="h-5 w-5" />;
    }
  };

  const getStepTitle = (step: PlanningStep) => {
    switch (step) {
      case 'sightseeing': return 'Select Sightseeing Spots';
      case 'hotel': return 'Choose Hotel Accommodation';
      case 'activities': return 'Add Activities & Experiences';
      case 'tickets': return 'Select Entry Tickets';
      case 'meals': return 'Choose Meals';
    }
  };

  const getStepColor = (step: PlanningStep) => {
    switch (step) {
      case 'sightseeing': return 'blue';
      case 'hotel': return 'purple';
      case 'activities': return 'green';
      case 'tickets': return 'orange';
      case 'meals': return 'red';
    }
  };

  const isStepComplete = (dayIndex: number, step: PlanningStep) => {
    const dayPlan = dayPlans[dayIndex];
    if (!dayPlan) return false;

    switch (step) {
      case 'sightseeing': return dayPlan.sightseeing.length > 0;
      case 'hotel': return dayPlan.hotel !== null;
      case 'activities': return true;
      case 'tickets': return true;
      case 'meals': return true;
    }
  };

  const canProceedToNextStep = (dayIndex: number, step: PlanningStep) => {
    switch (step) {
      case 'sightseeing': return dayPlans[dayIndex]?.sightseeing.length > 0;
      case 'hotel': return true;
      case 'activities': return true;
      case 'tickets': return true;
      case 'meals': return true;
    }
  };

  const getNextStep = (currentStep: PlanningStep): PlanningStep | null => {
    const steps: PlanningStep[] = ['sightseeing', 'hotel', 'activities', 'tickets', 'meals'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  };

  const getPreviousStep = (currentStep: PlanningStep): PlanningStep | null => {
    const steps: PlanningStep[] = ['sightseeing', 'hotel', 'activities', 'tickets', 'meals'];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex > 0 ? steps[currentIndex - 1] : null;
  };

  const handleNextStep = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const handlePreviousStep = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const calculateDays = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 7;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedDates = { ...editableClient.travelDates, [field]: value };
    if (updatedDates.startDate && updatedDates.endDate) {
      const newDays = calculateDays(updatedDates.startDate, updatedDates.endDate);
      setNumberOfDays(newDays);
      setEditableClient({
        ...editableClient,
        travelDates: updatedDates,
        numberOfDays: newDays
      });
    } else {
      setEditableClient({
        ...editableClient,
        travelDates: updatedDates
      });
    }
  };

  const handleSaveClientDetails = () => {
    setViewMode('client-details');
  };

  const handleSaveAllChanges = async () => {
    const updatedItinerary: Itinerary = {
      id: latestItinerary?.id || generateUUID(),
      client: { ...editableClient, numberOfDays },
      dayPlans,
      totalBaseCost: currentBaseCost,
      profitMargin: profitMargin,
      finalPrice: finalPrice,
      exchangeRate: exchangeRate,
      version: (latestItinerary?.version || 0) + 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: authState.user?.id || 'admin',
      changeLog: [
        ...(latestItinerary?.changeLog || []),
        {
          id: generateUUID(),
          version: (latestItinerary?.version || 0) + 1,
          changeType: numberOfDays !== client.numberOfDays ? 'days_modified' : 'general_edit',
          description: numberOfDays !== client.numberOfDays
            ? `Days changed from ${client.numberOfDays} to ${numberOfDays}`
            : 'Itinerary details updated',
          timestamp: new Date().toISOString(),
          updatedBy: authState.user?.id || 'admin'
        }
      ]
    };

    await updateItinerary(
      updatedItinerary,
      numberOfDays !== client.numberOfDays ? 'days_modified' : 'general_edit',
      numberOfDays !== client.numberOfDays
        ? `Days changed from ${client.numberOfDays} to ${numberOfDays}`
        : 'Itinerary details updated'
    );

    const updatedClient: Client = {
      ...editableClient,
      numberOfDays
    };
    onSave(updatedClient);
  };

  const renderStepContent = () => {
    const dayPlan = dayPlans[currentDay - 1];
    const dayIndex = currentDay - 1;

    if (!dayPlan) return null;

    switch (currentStep) {
      case 'sightseeing':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Select Sightseeing Spots</h4>
              <p className="text-blue-700 text-sm">Choose the places you want to visit on Day {currentDay}. You can select multiple locations.</p>
            </div>

            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sightseeing spots..."
                value={searchTerms.sightseeing}
                onChange={(e) => updateSearchTerm('sightseeing', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerms.sightseeing && (
                <button
                  onClick={() => clearSearch('sightseeing')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {getFilteredSightseeing(dayIndex).map(sight => (
                <label key={sight.id} className="flex items-start space-x-3 p-4 border-2 border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={dayPlan.sightseeing.includes(sight.id)}
                    onChange={(e) => {
                      const current = dayPlan.sightseeing;
                      const updated = e.target.checked
                        ? [...current, sight.id]
                        : current.filter(id => id !== sight.id);
                      updateDayPlan(dayIndex, 'sightseeing', updated);
                    }}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{sight.name}</div>
                    <div className="text-sm text-slate-600 mt-1">{sight.description}</div>
                    <div className="text-xs text-blue-600 mt-2 capitalize">
                      Transportation: {sight.transportationMode.replace('-', ' ')}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {getFilteredSightseeing(dayIndex).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>
                  {searchTerms.sightseeing
                    ? 'No sightseeing spots match your search.'
                    : 'All available sightseeing spots for this transportation mode have been selected in previous days.'
                  }
                </p>
              </div>
            )}
          </div>
        );

      case 'hotel':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-900 mb-2">Choose Hotel Accommodation</h4>
              <p className="text-purple-700 text-sm">Select where you want to stay on Day {currentDay}. You can skip this if no accommodation is needed.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Place/Location
                </label>
                <select
                  value={dayPlan.hotel?.place || ''}
                  onChange={(e) => {
                    const place = e.target.value;
                    if (place) {
                      updateDayPlan(dayIndex, 'hotel', { place, hotelId: '', roomTypeId: '' });
                    } else {
                      updateDayPlan(dayIndex, 'hotel', null);
                    }
                  }}
                  className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">No hotel needed</option>
                  {uniquePlaces.map(place => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
              </div>

              {dayPlan.hotel?.place && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hotel Name
                  </label>
                  {dayPlan.hotel.place && (
                    <div className="relative mb-2">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search hotels..."
                        value={searchTerms.hotel}
                        onChange={(e) => updateSearchTerm('hotel', e.target.value)}
                        className="w-full pl-9 pr-9 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {searchTerms.hotel && (
                        <button
                          onClick={() => clearSearch('hotel')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                  <select
                    value={dayPlan.hotel.hotelId}
                    onChange={(e) => {
                      updateDayPlan(dayIndex, 'hotel', {
                        ...dayPlan.hotel!,
                        hotelId: e.target.value,
                        roomTypeId: ''
                      });
                    }}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select hotel</option>
                    {getFilteredHotels(dayPlan.hotel.place).map(hotel => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {dayPlan.hotel?.hotelId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={dayPlan.hotel.roomTypeId}
                    onChange={(e) => {
                      updateDayPlan(dayIndex, 'hotel', {
                        ...dayPlan.hotel!,
                        roomTypeId: e.target.value
                      });
                    }}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select room type</option>
                    {getRoomTypesForHotel(dayPlan.hotel.hotelId).map(roomType => (
                      <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 'activities':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-900 mb-2">Add Activities & Experiences</h4>
              <p className="text-green-700 text-sm">Select activities for Day {currentDay}. These are optional but add value to the experience.</p>
            </div>

            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerms.activities}
                onChange={(e) => updateSearchTerm('activities', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              {searchTerms.activities && (
                <button
                  onClick={() => clearSearch('activities')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {getFilteredActivities(dayIndex).map(activity => {
                const isSelected = dayPlan.activities.some(a => a.activityId === activity.id);
                const selectedOption = dayPlan.activities.find(a => a.activityId === activity.id);

                return (
                  <div key={activity.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-green-300 transition-all">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleActivitySelection(dayIndex, activity.id)}
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-slate-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-slate-900">{activity.name}</span>
                        <div className="text-sm text-slate-600">{activity.location}</div>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="mt-3 ml-8">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Choose Option:
                        </label>
                        <select
                          value={selectedOption?.optionId || ''}
                          onChange={(e) => updateActivityOption(dayIndex, activity.id, e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          {activity.options.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name} - ${option.cost} (for {option.costForHowMany} {option.costForHowMany === 1 ? 'person' : 'people'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {getFilteredActivities(dayIndex).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Camera className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>
                  {searchTerms.activities
                    ? 'No activities match your search.'
                    : 'All available activities have been used in previous days.'
                  }
                </p>
              </div>
            )}
          </div>
        );

      case 'tickets':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-orange-900 mb-2">Select Entry Tickets</h4>
              <p className="text-orange-700 text-sm">Choose entry tickets for the sightseeing spots selected for Day {currentDay}.</p>
            </div>

            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search entry tickets..."
                value={searchTerms.tickets}
                onChange={(e) => updateSearchTerm('tickets', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {searchTerms.tickets && (
                <button
                  onClick={() => clearSearch('tickets')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {getFilteredTickets(dayIndex, dayPlan.sightseeing).map(ticket => (
                <label key={ticket.id} className="flex items-center space-x-3 p-4 border-2 border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={dayPlan.entryTickets.includes(ticket.id)}
                    onChange={(e) => {
                      const current = dayPlan.entryTickets;
                      const updated = e.target.checked
                        ? [...current, ticket.id]
                        : current.filter(id => id !== ticket.id);
                      updateDayPlan(dayIndex, 'entryTickets', updated);
                    }}
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{ticket.name}</div>
                    <div className="text-sm text-slate-600">${ticket.cost} per person</div>
                  </div>
                </label>
              ))}
            </div>

            {getFilteredTickets(dayIndex, dayPlan.sightseeing).length === 0 && dayPlan.sightseeing.length > 0 && (
              <div className="text-center py-8 text-slate-500">
                <Ticket className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>
                  {searchTerms.tickets
                    ? 'No entry tickets match your search.'
                    : 'All available entry tickets for selected sightseeing spots have been used in previous days.'
                  }
                </p>
              </div>
            )}

            {dayPlan.sightseeing.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Ticket className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                <p>Select sightseeing spots first to see available entry tickets</p>
              </div>
            )}
          </div>
        );

      case 'meals':
        return (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-red-900 mb-2">Choose Meals</h4>
              <p className="text-red-700 text-sm">Select meal options for Day {currentDay}. You can choose multiple meals for different times of the day.</p>
            </div>

            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search restaurants/places..."
                value={searchTerms.meals}
                onChange={(e) => updateSearchTerm('meals', e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              {searchTerms.meals && (
                <button
                  onClick={() => clearSearch('meals')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="space-y-6">
              {['breakfast', 'lunch', 'dinner'].map(mealType => {
                const availableMeals = getFilteredMeals(mealType);

                return (
                  <div key={mealType}>
                    <h5 className="text-base font-semibold text-slate-900 mb-3 capitalize flex items-center">
                      <Utensils className="h-4 w-4 mr-2 text-red-600" />
                      {mealType}
                    </h5>
                    <div className="space-y-2">
                      {availableMeals.map(meal => (
                        <label key={meal.id} className="flex items-start space-x-3 p-3 border-2 border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-300 cursor-pointer transition-all">
                          <input
                            type="checkbox"
                            checked={dayPlan.meals.includes(meal.id)}
                            onChange={(e) => {
                              const current = dayPlan.meals;
                              const updated = e.target.checked
                                ? [...current, meal.id]
                                : current.filter(id => id !== meal.id);
                              updateDayPlan(dayIndex, 'meals', updated);
                            }}
                            className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900">{meal.place}</div>
                            <div className="text-sm text-slate-600">${meal.cost} per person</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {searchTerms.meals &&
               ['breakfast', 'lunch', 'dinner'].every(mealType => getFilteredMeals(mealType).length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <Utensils className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>No restaurants match your search.</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (viewMode === 'client-details') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit Itinerary - {client.name}</h3>
                <p className="text-slate-500 text-sm">Review client details before editing day plans</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <ViewOnlyClientDetails
              client={editableClient}
              onEdit={() => setViewMode('edit-client')}
              onContinue={() => setViewMode('day-planning')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'edit-client') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit Client Details</h3>
                <p className="text-slate-500 text-sm">Modify client information</p>
              </div>
              <button
                onClick={() => setViewMode('client-details')}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={editableClient.name}
                  onChange={(e) => setEditableClient({ ...editableClient, name: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={editableClient.email || ''}
                  onChange={(e) => setEditableClient({ ...editableClient, email: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client's email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp Number *
                </label>
                <div className="flex space-x-3">
                  <select
                    value={editableClient.countryCode}
                    onChange={(e) => setEditableClient({ ...editableClient, countryCode: e.target.value })}
                    className="w-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} ({country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={editableClient.whatsapp}
                    onChange={(e) => setEditableClient({ ...editableClient, whatsapp: e.target.value })}
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Travel Dates
              </h3>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="flexible-edit"
                  checked={editableClient.travelDates.isFlexible}
                  onChange={(e) => setEditableClient({
                    ...editableClient,
                    travelDates: { ...editableClient.travelDates, isFlexible: e.target.checked }
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="flexible-edit" className="text-sm font-medium text-slate-700">
                  Flexible dates (month only)
                </label>
              </div>

              {editableClient.travelDates.isFlexible ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Month
                  </label>
                  <select
                    value={editableClient.travelDates.flexibleMonth}
                    onChange={(e) => setEditableClient({
                      ...editableClient,
                      travelDates: { ...editableClient.travelDates, flexibleMonth: e.target.value }
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={editableClient.travelDates.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={editableClient.travelDates.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Number of Passengers
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Adults
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editableClient.numberOfPax.adults}
                    onChange={(e) => setEditableClient({
                      ...editableClient,
                      numberOfPax: { ...editableClient.numberOfPax, adults: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editableClient.numberOfPax.children}
                    onChange={(e) => setEditableClient({
                      ...editableClient,
                      numberOfPax: { ...editableClient.numberOfPax, children: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                Trip Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Days
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={numberOfDays}
                      onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!editableClient.travelDates.isFlexible && editableClient.travelDates.startDate && editableClient.travelDates.endDate}
                    />
                    <Clock className="h-5 w-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  {!editableClient.travelDates.isFlexible && editableClient.travelDates.startDate && editableClient.travelDates.endDate && (
                    <p className="text-xs text-slate-500 mt-1">Auto-calculated from dates</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transportation Mode *
                  </label>
                  <select
                    value={editableClient.transportationMode}
                    onChange={(e) => setEditableClient({ ...editableClient, transportationMode: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select transportation</option>
                    {transportations.map(transport => (
                      <option key={transport.id} value={transport.vehicleName}>
                        {transport.vehicleName} ({transport.type.replace('-', ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setViewMode('client-details')}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClientDetails}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
              >
                Save & Continue
              </button>
            </div>
          </div>
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
              <h3 className="text-lg font-semibold text-slate-900">Edit Itinerary - {client.name}</h3>
              <p className="text-slate-500 text-sm">
                {latestItinerary
                  ? `Version ${latestItinerary.version} • Last updated: ${new Date(latestItinerary.lastUpdated).toLocaleString()}`
                  : 'Creating new itinerary'
                }
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
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Live Cost Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Exchange Rate (USD to INR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 83)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profit Margin (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-4 text-center w-full">
                  <div className="text-sm font-medium mb-1">Updated Total</div>
                  <div className="text-xl font-bold">${finalPrice.toFixed(2)}</div>
                  <div className="text-sm text-green-100">₹{(finalPrice * exchangeRate).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-600">
              Base Cost: ${currentBaseCost.toFixed(2)} • Profit: ${profitMargin.toFixed(2)} • Total: ${finalPrice.toFixed(2)}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Day {currentDay} of {numberOfDays} for {client.name}
                </h3>
                <p className="text-slate-600 mt-1">
                  Current Step: {getStepTitle(currentStep)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-900">Select Day to Edit</h4>
              <div className="text-sm text-slate-600">
                Click any day to jump directly to it
              </div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {Array.from({ length: numberOfDays }, (_, index) => {
                const day = index + 1;
                const isCompleted = completedDays.includes(day);
                const isCurrent = day === currentDay;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setCurrentDay(day);
                      setCurrentStep('sightseeing');
                    }}
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all hover:scale-110 cursor-pointer
                      ${isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }
                    `}
                    title={`Edit Day ${day}`}
                  >
                    {isCompleted ? '✓' : day}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <label className="text-sm font-medium text-slate-700">Quick Jump:</label>
              <select
                value={currentDay}
                onChange={(e) => {
                  setCurrentDay(parseInt(e.target.value));
                  setCurrentStep('sightseeing');
                }}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {Array.from({ length: numberOfDays }, (_, index) => {
                  const day = index + 1;
                  return (
                    <option key={day} value={day}>
                      Day {day} {completedDays.includes(day) ? '(Completed)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Day {currentDay} Planning Steps</h4>
              <div className="flex items-center space-x-2 overflow-x-auto">
                {(['sightseeing', 'hotel', 'activities', 'tickets', 'meals'] as PlanningStep[]).map((step, index) => {
                  const isCurrentStep = step === currentStep;
                  const isCompleted = isStepComplete(currentDay - 1, step);
                  const stepColor = getStepColor(step);

                  return (
                    <div key={step} className="flex items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all
                        ${isCurrentStep
                          ? `bg-${stepColor}-600 text-white ring-2 ring-${stepColor}-200`
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                        }
                      `}>
                        {isCompleted ? <Check className="h-5 w-5" /> : getStepIcon(step)}
                      </div>
                      <div className="ml-2 min-w-0">
                        <div className={`text-xs font-medium ${
                          isCurrentStep ? 'text-slate-900' : 'text-slate-500'
                        }`}>
                          {step.charAt(0).toUpperCase() + step.slice(1)}
                        </div>
                      </div>
                      {index < 4 && (
                        <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className={`bg-gradient-to-r from-${getStepColor(currentStep)}-50 to-${getStepColor(currentStep)}-100 px-6 py-4`}>
              <h4 className="text-lg font-semibold text-slate-900 flex items-center">
                {getStepIcon(currentStep)}
                <span className="ml-2">{getStepTitle(currentStep)}</span>
              </h4>
            </div>

            <div className="p-6 bg-white">
              {renderStepContent()}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-200 sticky bottom-0 bg-white">
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('client-details')}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back to Details
              </button>
              {(currentStep !== 'sightseeing' || currentDay > 1) && (
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-2 inline" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {currentStep !== 'meals' ? (
                <button
                  onClick={handleNextStep}
                  disabled={!canProceedToNextStep(currentDay - 1, currentStep)}
                  className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                    canProceedToNextStep(currentDay - 1, currentStep)
                      ? `bg-gradient-to-r from-${getStepColor(currentStep)}-600 to-${getStepColor(currentStep)}-700 text-white hover:from-${getStepColor(currentStep)}-700 hover:to-${getStepColor(currentStep)}-800 transform hover:scale-105`
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveAllChanges}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save All Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditModal;
