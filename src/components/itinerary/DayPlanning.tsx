import React, { useState, useEffect } from 'react';
import { Client, DayPlan, Hotel, Sightseeing, Activity, EntryTicket, Meal, Area } from '../../types';
import { useData } from '../../contexts/DataContext';
import { Calendar, MapPin, Building2, Camera, Ticket, Utensils, ChevronRight, ChevronLeft, Check, Search, X, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DayPlanningProps {
  client: Client;
  onNext: (dayPlans: DayPlan[]) => void;
  onBack: () => void;
  isAgent?: boolean;
  isFixedItinerary?: boolean;
  initialDayPlans?: DayPlan[];
}

type PlanningStep = 'sightseeing' | 'hotel' | 'activities' | 'tickets' | 'meals';

const DayPlanning: React.FC<DayPlanningProps> = ({ client, onNext, onBack, isAgent = false, isFixedItinerary = false, initialDayPlans }) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals } = state;

  const [areas, setAreas] = useState<Area[]>([]);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentStep, setCurrentStep] = useState<PlanningStep>('sightseeing');
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [sameAsYesterday, setSameAsYesterday] = useState<Record<number, boolean>>({});
  const [searchTerms, setSearchTerms] = useState<Record<PlanningStep, string>>({
    sightseeing: '',
    hotel: '',
    activities: '',
    tickets: '',
    meals: ''
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  useEffect(() => {
    if (initialDayPlans && initialDayPlans.length > 0) {
      setDayPlans(initialDayPlans);
    } else {
      const newDayPlans: DayPlan[] = Array.from({ length: client.numberOfDays }, (_, index) => ({
        day: index + 1,
        sightseeing: [],
        hotel: null,
        activities: [],
        entryTickets: [],
        meals: []
      }));
      setDayPlans(newDayPlans);
    }
  }, [client.numberOfDays, initialDayPlans]);

  // Filter sightseeing based on transportation mode
  const filteredSightseeing = sightseeings.filter(sight => {
    const transportMode = client.transportationMode;
    if (!transportMode) return true;
    return sight.transportationMode === transportMode;
  });

  const updateSearchTerm = (step: PlanningStep, term: string) => {
    setSearchTerms(prev => ({ ...prev, [step]: term }));
  };

  const clearSearch = (step: PlanningStep) => {
    setSearchTerms(prev => ({ ...prev, [step]: '' }));
  };

  // Get available items for current day (excluding already selected items from previous days)
  const getAvailableItemsForDay = (currentDayIndex: number) => {
    const previousDays = dayPlans.slice(0, currentDayIndex);
    
    // Get already selected sightseeing IDs from previous days
    const selectedSightseeingIds = new Set<string>();
    previousDays.forEach(day => {
      day.sightseeing.forEach(id => selectedSightseeingIds.add(id));
    });
    
    // Get already selected activity IDs from previous days
    const selectedActivityIds = new Set<string>();
    previousDays.forEach(day => {
      day.activities.forEach(activity => selectedActivityIds.add(activity.activityId));
    });
    
    // Get already selected entry ticket IDs from previous days
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

  // Filter functions for search
  const getFilteredSightseeing = (dayIndex: number) => {
    const { availableSightseeing } = getAvailableItemsForDay(dayIndex);
    const currentDayPlan = dayPlans[dayIndex];
    const searchTerm = searchTerms.sightseeing.toLowerCase();

    return availableSightseeing.filter(sight => {
      const matchesArea = !currentDayPlan?.areaId || sight.areaId === currentDayPlan.areaId;
      const matchesSearch = sight.name.toLowerCase().includes(searchTerm) ||
        sight.description.toLowerCase().includes(searchTerm);
      return matchesArea && matchesSearch;
    });
  };

  const getFilteredActivities = (dayIndex: number) => {
    const { selectedActivityIds } = getAvailableItemsForDay(dayIndex);
    const currentDayPlan = dayPlans[dayIndex];
    const searchTerm = searchTerms.activities.toLowerCase();

    return activities.filter(activity => {
      const matchesArea = !currentDayPlan?.areaId || activity.areaId === currentDayPlan.areaId;
      const matchesSearch = activity.name.toLowerCase().includes(searchTerm) ||
        activity.location.toLowerCase().includes(searchTerm);
      return !selectedActivityIds.has(activity.id) && matchesArea && matchesSearch;
    });
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

  const getFilteredMeals = (mealType: string, dayIndex: number) => {
    const currentDayPlan = dayPlans[dayIndex];
    const searchTerm = searchTerms.meals.toLowerCase();

    return meals.filter(meal => {
      const matchesArea = !currentDayPlan?.areaId || meal.areaId === currentDayPlan.areaId;
      const matchesSearch = meal.place.toLowerCase().includes(searchTerm);
      return meal.type === mealType && matchesArea && matchesSearch;
    });
  };

  const getFilteredHotels = (place: string) => {
    const searchTerm = searchTerms.hotel.toLowerCase();
    return getHotelsForPlace(place).filter(hotel =>
      hotel.name.toLowerCase().includes(searchTerm)
    );
  };

  // Get activities available for current day (all activities, excluding already selected)
  const getAvailableActivitiesForDay = (dayIndex: number) => {
    const { selectedActivityIds } = getAvailableItemsForDay(dayIndex);
    return activities.filter(activity => !selectedActivityIds.has(activity.id));
  };

  // Get entry tickets available for current day
  const getAvailableTicketsForDay = (dayIndex: number, sightseeingIds: string[]) => {
    const { selectedTicketIds } = getAvailableItemsForDay(dayIndex);
    return entryTickets.filter(ticket => 
      sightseeingIds.includes(ticket.sightseeingId) && 
      !selectedTicketIds.has(ticket.id)
    );
  };

  // Get unique places for hotel selection
  const uniquePlaces = [...new Set(hotels.map(hotel => hotel.place))];

  const updateDayPlan = (dayIndex: number, field: keyof DayPlan, value: any) => {
    const updatedPlans = [...dayPlans];
    updatedPlans[dayIndex] = { ...updatedPlans[dayIndex], [field]: value };
    setDayPlans(updatedPlans);
  };

  const handleSameAsYesterday = (dayIndex: number, checked: boolean) => {
    setSameAsYesterday(prev => ({ ...prev, [dayIndex]: checked }));

    if (checked && dayIndex > 0) {
      const previousDayHotel = dayPlans[dayIndex - 1]?.hotel;
      if (previousDayHotel) {
        updateDayPlan(dayIndex, 'hotel', {
          place: previousDayHotel.place,
          hotelId: previousDayHotel.hotelId,
          roomTypeId: previousDayHotel.roomTypeId
        });
      }
    } else if (!checked) {
      updateDayPlan(dayIndex, 'hotel', null);
    }
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
      if (activity) {
        const updated = [...currentActivities, {
          activityId,
          optionId: activity.options && activity.options.length > 0 ? activity.options[0].id : ''
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
      case 'activities': return true; // Activities are optional
      case 'tickets': return true; // Tickets are optional
      case 'meals': return true; // Meals are optional
    }
  };

  const canProceedToNextStep = (dayIndex: number, step: PlanningStep) => {
    switch (step) {
      case 'sightseeing': return dayPlans[dayIndex]?.sightseeing.length > 0;
      case 'hotel': return true; // Hotel is optional, can proceed
      case 'activities': return true; // Activities are optional
      case 'tickets': return true; // Tickets are optional
      case 'meals': return true; // Meals are optional
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
    } else {
      // Completed all steps for this day
      setCompletedDays(prev => [...prev, currentDay]);
      if (currentDay < client.numberOfDays) {
        setCurrentDay(currentDay + 1);
        setCurrentStep('sightseeing');
      }
    }
  };

  const handlePreviousStep = () => {
    const prevStep = getPreviousStep(currentStep);
    if (prevStep) {
      setCurrentStep(prevStep);
    } else if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
      setCurrentStep('meals'); // Go to last step of previous day
    }
  };

  const handleNextDay = () => {
    if (currentDay < client.numberOfDays) {
      setCompletedDays(prev => [...prev, currentDay]);
      setCurrentDay(currentDay + 1);
      setCurrentStep('sightseeing');
    }
  };

  const handlePreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
      setCurrentStep('sightseeing');
    }
  };

  const canProceedToReview = () => {
    return completedDays.length === client.numberOfDays || 
           (currentDay === client.numberOfDays && currentStep === 'meals');
  };

  const handleSubmit = () => {
    // Ensure all days have at least sightseeing selected
    const allDaysValid = dayPlans.every(dayPlan => dayPlan.sightseeing.length > 0);
    if (!allDaysValid) {
      alert('Please select at least one sightseeing spot for each day before proceeding to review.');
      return;
    }
    onNext(dayPlans);
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

            {/* Area Filter */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-teal-900 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Filter by Area (Optional)
              </label>
              <select
                value={dayPlan.areaId || ''}
                onChange={(e) => {
                  const selectedArea = areas.find(a => a.id === e.target.value);
                  const updatedDayPlans = [...dayPlans];
                  updatedDayPlans[dayIndex] = {
                    ...updatedDayPlans[dayIndex],
                    areaId: e.target.value,
                    areaName: selectedArea?.name || ''
                  };
                  setDayPlans(updatedDayPlans);
                }}
                className="w-full p-3 border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                <option value="">All Areas - Show All Sightseeing</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
              <p className="text-sm text-teal-700 mt-2">
                {dayPlan.areaId
                  ? `Showing sightseeing spots in ${dayPlan.areaName}. Change to "All Areas" to see more options.`
                  : 'Showing all available sightseeing spots from all areas.'}
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sightseeing spots by name or description..."
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

            {/* Selected Sightseeing */}
            {dayPlan.sightseeing.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Selected Sightseeing ({dayPlan.sightseeing.length})
                </h4>
                <div className="space-y-2">
                  {dayPlan.sightseeing.map(sId => {
                    const sight = sightseeings.find(s => s.id === sId);
                    if (!sight) return null;
                    return (
                      <div key={sId} className="flex items-center justify-between bg-white p-2 rounded">
                        <div className="flex-1">
                          <span className="font-medium text-green-900">{sight.name}</span>
                          <span className="text-sm text-green-600 ml-2">({sight.areaName})</span>
                        </div>
                        <button
                          onClick={() => {
                            const updated = dayPlan.sightseeing.filter(id => id !== sId);
                            updateDayPlan(dayIndex, 'sightseeing', updated);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
                    <div className="flex items-center gap-3 mt-2">
                      <div className="text-xs text-teal-600 font-medium flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {sight.areaName}
                      </div>
                      <div className="text-xs text-blue-600 capitalize">
                        {sight.transportationMode.replace('-', ' ')}
                      </div>
                    </div>
                  </div>
                </label>
              ))}

              {getFilteredSightseeing(dayIndex).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                  <p>
                    {searchTerms.sightseeing
                      ? 'No sightseeing spots match your search.'
                      : dayPlan.areaId
                      ? `All available sightseeing spots in ${dayPlan.areaName} have been selected. Try selecting "All Areas" to see more options.`
                      : 'All available sightseeing spots for this transportation mode have been selected in previous days.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'hotel':
        const previousDayHotel = dayIndex > 0 ? dayPlans[dayIndex - 1]?.hotel : null;
        const canUseSameAsYesterday = dayIndex > 0 && previousDayHotel !== null;
        const isSameAsYesterdayChecked = sameAsYesterday[dayIndex] || false;

        return (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-purple-900 mb-2">Choose Hotel Accommodation</h4>
              <p className="text-purple-700 text-sm">Select where you want to stay on Day {currentDay}. You can skip this if no accommodation is needed.</p>
            </div>

            {/* Same as Yesterday Option */}
            {dayIndex > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={`same-as-yesterday-${dayIndex}`}
                    checked={isSameAsYesterdayChecked}
                    disabled={!canUseSameAsYesterday}
                    onChange={(e) => handleSameAsYesterday(dayIndex, e.target.checked)}
                    className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`same-as-yesterday-${dayIndex}`}
                      className={`font-semibold text-slate-900 flex items-center cursor-pointer ${!canUseSameAsYesterday ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Copy className="h-4 w-4 mr-2 text-blue-600" />
                      Same hotel as Day {dayIndex}
                    </label>
                    {canUseSameAsYesterday ? (
                      <div className="mt-2 bg-white rounded-lg p-3 border border-blue-200">
                        <p className="text-sm text-slate-600 mb-2">Previous day's hotel:</p>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">Place:</span>{' '}
                            <span className="text-slate-900">{previousDayHotel.place}</span>
                          </div>
                          {previousDayHotel.hotelId && (
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Hotel:</span>{' '}
                              <span className="text-slate-900">
                                {hotels.find(h => h.id === previousDayHotel.hotelId)?.name || 'Unknown'}
                              </span>
                            </div>
                          )}
                          {previousDayHotel.roomTypeId && previousDayHotel.hotelId && (
                            <div className="text-sm">
                              <span className="font-medium text-slate-700">Room Type:</span>{' '}
                              <span className="text-slate-900">
                                {hotels.find(h => h.id === previousDayHotel.hotelId)
                                  ?.roomTypes.find(rt => rt.id === previousDayHotel.roomTypeId)?.name || 'Unknown'}
                              </span>
                            </div>
                          )}
                        </div>
                        {isSameAsYesterdayChecked && (
                          <p className="text-xs text-green-600 mt-2 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Hotel automatically copied from Day {dayIndex}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1">
                        No hotel was selected on Day {dayIndex}. Please choose a hotel manually.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Place/Location
                </label>
                <select
                  value={dayPlan.hotel?.place || ''}
                  disabled={isSameAsYesterdayChecked}
                  onChange={(e) => {
                    const place = e.target.value;
                    if (place) {
                      updateDayPlan(dayIndex, 'hotel', { place, hotelId: '', roomTypeId: '' });
                    } else {
                      updateDayPlan(dayIndex, 'hotel', null);
                    }
                  }}
                  className={`w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    isSameAsYesterdayChecked ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                  }`}
                >
                  <option value="">No hotel needed</option>
                  {uniquePlaces.map(place => (
                    <option key={place} value={place}>{place}</option>
                  ))}
                </select>
                {isSameAsYesterdayChecked && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <Copy className="h-3 w-3 mr-1" />
                    Uncheck "Same hotel as Day {dayIndex}" to change this selection
                  </p>
                )}
              </div>

              {dayPlan.hotel?.place && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hotel Name
                  </label>
                  {dayPlan.hotel.place && !isSameAsYesterdayChecked && (
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
                    disabled={isSameAsYesterdayChecked}
                    onChange={(e) => {
                      updateDayPlan(dayIndex, 'hotel', {
                        ...dayPlan.hotel!,
                        hotelId: e.target.value,
                        roomTypeId: ''
                      });
                    }}
                    className={`w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      isSameAsYesterdayChecked ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="">Select hotel</option>
                    {getFilteredHotels(dayPlan.hotel.place).map(hotel => (
                      <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                    ))}
                  </select>
                  {isSameAsYesterdayChecked && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Copy className="h-3 w-3 mr-1" />
                      Uncheck "Same hotel as Day {dayIndex}" to change this selection
                    </p>
                  )}
                </div>
              )}

              {dayPlan.hotel?.hotelId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Room Type
                  </label>
                  <select
                    value={dayPlan.hotel.roomTypeId}
                    disabled={isSameAsYesterdayChecked}
                    onChange={(e) => {
                      updateDayPlan(dayIndex, 'hotel', {
                        ...dayPlan.hotel!,
                        roomTypeId: e.target.value
                      });
                    }}
                    className={`w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      isSameAsYesterdayChecked ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                    }`}
                  >
                    <option value="">Select room type</option>
                    {getRoomTypesForHotel(dayPlan.hotel.hotelId).map(roomType => (
                      <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                    ))}
                  </select>
                  {isSameAsYesterdayChecked && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center">
                      <Copy className="h-3 w-3 mr-1" />
                      Uncheck "Same hotel as Day {dayIndex}" to change this selection
                    </p>
                  )}
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

            {/* Area Display */}
            {dayPlan.areaId && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center">
                <MapPin className="h-5 w-5 text-teal-600 mr-2" />
                <span className="text-sm font-medium text-teal-900">
                  Area: {dayPlan.areaName || 'Selected Area'}
                </span>
                <span className="text-xs text-teal-600 ml-2">(Showing activities for this area)</span>
              </div>
            )}

            {/* Search Bar */}
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
                    
                    {isSelected && activity.options && activity.options.length > 0 && (
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
                              {isAgent || isFixedItinerary
                                ? `${option.name} (for ${option.costForHowMany} ${option.costForHowMany === 1 ? 'person' : 'people'})`
                                : `${option.name} - $${option.cost} (for ${option.costForHowMany} ${option.costForHowMany === 1 ? 'person' : 'people'})`
                              }
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
            
            {/* Search Bar */}
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
                    {!isAgent && !isFixedItinerary && (
                      <div className="text-sm text-slate-600">${ticket.cost} per person</div>
                    )}
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

            {/* Area Display */}
            {dayPlan.areaId && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-center">
                <MapPin className="h-5 w-5 text-teal-600 mr-2" />
                <span className="text-sm font-medium text-teal-900">
                  Area: {dayPlan.areaName || 'Selected Area'}
                </span>
                <span className="text-xs text-teal-600 ml-2">(Showing meals for this area)</span>
              </div>
            )}

            {/* Search Bar */}
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
                const availableMeals = getFilteredMeals(mealType, dayIndex);

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
                            {!isAgent && !isFixedItinerary && (
                              <div className="text-sm text-slate-600">${meal.cost} per person</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* No results message for meals */}
              {searchTerms.meals &&
               ['breakfast', 'lunch', 'dinner'].every(mealType => getFilteredMeals(mealType, dayIndex).length === 0) && (
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

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Day-by-Day Planning</h2>
              <p className="text-teal-100 mt-1 text-sm md:text-base">Step 3 of 5 - Build Your Itinerary</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Edit Mode Indicator */}
          {initialDayPlans && initialDayPlans.length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Editing Existing Itinerary</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    You're editing an existing itinerary. All previous selections are pre-loaded. You can modify any day's planning as needed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Day {currentDay} of {client.numberOfDays} for {client.name}
                </h3>
                <p className="text-slate-600 mt-1">
                  Current Step: {getStepTitle(currentStep)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600">Progress</div>
                <div className="text-lg font-semibold text-blue-600">
                  {completedDays.length} / {client.numberOfDays} days completed
                </div>
              </div>
            </div>
          </div>

          {/* Day Navigation */}
          <div className="mb-6">
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-2">Select Day to Edit</h4>
              <p className="text-sm text-slate-600">Click any day number to jump directly to it</p>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {Array.from({ length: client.numberOfDays }, (_, index) => {
                const day = index + 1;
                const isCompleted = completedDays.includes(day);
                const isCurrent = day === currentDay;
                const isAccessible = initialDayPlans ? true : (day <= currentDay || isCompleted);

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (isAccessible) {
                        setCurrentDay(day);
                        setCurrentStep('sightseeing');
                      }
                    }}
                    disabled={!isAccessible}
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all hover:scale-110
                      ${isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : isAccessible
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }
                    `}
                    title={`${isAccessible ? 'Jump to' : 'Complete previous days to unlock'} Day ${day}`}
                  >
                    {isCompleted ? '✓' : day}
                  </button>
                );
              })}
            </div>
            {initialDayPlans && (
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
                  {Array.from({ length: client.numberOfDays }, (_, index) => {
                    const day = index + 1;
                    return (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    );
                  })}
                </select>
                <span className="text-xs text-slate-500">
                  Currently editing: Day {currentDay}
                </span>
              </div>
            )}
          </div>

          {/* Step Progress for Current Day */}
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

          {/* Current Step Content */}
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

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-200">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Previous Step
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
                <>
                  {currentDay < client.numberOfDays ? (
                    <button
                      onClick={handleNextDay}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Day {currentDay + 1}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Review Itinerary
                      <Calendar className="ml-2 h-5 w-5" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayPlanning;