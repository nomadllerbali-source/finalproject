import React, { useState } from 'react';
import { Client, DayPlan } from '../../types';
import { useData } from '../../contexts/DataContext';
import { calculateItineraryCost } from '../../utils/calculations';
import { DollarSign, Calendar, Users, MapPin, Building2, Camera, Ticket, Utensils, FileText, CheckCircle, XCircle } from 'lucide-react';

interface FixedItineraryReviewCostingProps {
  client: Client;
  dayPlans: DayPlan[];
  onNext: (data: { baseCost: number; inclusions: string; exclusions: string }) => void;
  onBack: () => void;
}

const FixedItineraryReviewCosting: React.FC<FixedItineraryReviewCostingProps> = ({ 
  client, 
  dayPlans, 
  onNext, 
  onBack 
}) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  
  const [inclusions, setInclusions] = useState(`• ${client.numberOfDays} days ${client.transportationMode} transportation
• Accommodation in selected hotels
• Sightseeing tours as mentioned
• Activities and experiences as listed
• Entry tickets to attractions
• Professional travel planning service
• 24/7 customer support during travel`);

  const [exclusions, setExclusions] = useState(`• International/domestic flights
• Travel insurance
• Personal expenses and shopping
• Tips and gratuities
• Any meals not mentioned in inclusions
• Additional activities not listed
• Visa fees and documentation
• Emergency medical expenses`);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate base cost from the itinerary
  const baseCost = calculateItineraryCost(
    client, dayPlans, hotels, sightseeings, activities, entryTickets, meals, transportations
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!inclusions.trim()) {
      newErrors.inclusions = 'Inclusions are required';
    }

    if (!exclusions.trim()) {
      newErrors.exclusions = 'Exclusions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    onNext({
      baseCost,
      inclusions,
      exclusions
    });
  };

  const renderDayPlanSummary = (dayPlan: DayPlan) => {
    const selectedSightseeing = sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
    const selectedActivities = dayPlan.activities.map(a => {
      const activity = activities.find(act => act.id === a.activityId);
      const option = activity?.options.find(opt => opt.id === a.optionId);
      return { activity, option };
    }).filter(item => item.activity && item.option);
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
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Template Review & Details</h2>
            <p className="text-slate-600 mt-1">Step 3 of 4 - Define inclusions, exclusions, and pricing</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Template Summary */}
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Template Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm font-medium text-slate-700">Template Name:</span>
              <div className="text-base text-slate-900 font-semibold">{client.name}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Duration:</span>
              <div className="text-base text-slate-900 font-semibold">{client.numberOfDays} days</div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Transportation:</span>
              <div className="text-base text-slate-900 font-semibold">{client.transportationMode}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-700">Base Cost:</span>
              <div className="text-base text-green-600 font-semibold">${baseCost.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Itinerary Preview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Itinerary Preview</h3>
          
          <div className="space-y-4">
            {dayPlans.map((dayPlan) => {
              const summary = renderDayPlanSummary(dayPlan);
              
              return (
                <div key={dayPlan.day} className="border border-slate-200 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                    Day {dayPlan.day}
                  </h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {/* Sightseeing */}
                      {summary.sightseeing.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                            <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                            Sightseeing
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.sightseeing.map(sight => (
                              <li key={sight.id}>• {sight.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Activities */}
                      {summary.activities.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                            <Camera className="h-4 w-4 mr-2 text-blue-600" />
                            Activities
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.activities.map((item, index) => (
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
                          <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                            <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                            Entry Tickets
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.tickets.map(ticket => (
                              <li key={ticket.id}>• {ticket.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Hotel */}
                      {summary.hotel && (
                        <div>
                          <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                            <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                            Accommodation
                          </h5>
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
                          <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                            <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                            Meals
                          </h5>
                          <ul className="text-sm text-slate-700 space-y-1 ml-6">
                            {summary.meals.map(meal => (
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

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Inclusions *
            </label>
            <textarea
              value={inclusions}
              onChange={(e) => {
                setInclusions(e.target.value);
                if (errors.inclusions) setErrors({ ...errors, inclusions: '' });
              }}
              rows={10}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors resize-none ${
                errors.inclusions ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-green-500'
              }`}
              placeholder="• Transportation as mentioned&#10;• Accommodation in selected hotels&#10;• Entry tickets to attractions&#10;• Professional guide service"
            />
            {errors.inclusions && (
              <p className="text-red-600 text-sm mt-1">{errors.inclusions}</p>
            )}
            <p className="text-slate-500 text-sm mt-1">
              List what's included in this package template
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-600" />
              Exclusions *
            </label>
            <textarea
              value={exclusions}
              onChange={(e) => {
                setExclusions(e.target.value);
                if (errors.exclusions) setErrors({ ...errors, exclusions: '' });
              }}
              rows={10}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 transition-colors resize-none ${
                errors.exclusions ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-red-500'
              }`}
              placeholder="• International/domestic flights&#10;• Travel insurance&#10;• Personal expenses&#10;• Tips and gratuities"
            />
            {errors.exclusions && (
              <p className="text-red-600 text-sm mt-1">{errors.exclusions}</p>
            )}
            <p className="text-slate-500 text-sm mt-1">
              List what's not included in this package template
            </p>
          </div>
        </div>

        {/* Calculated Base Cost Display */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Calculated Template Cost
          </h3>
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-6 text-center">
              <div className="text-sm font-medium mb-2">Base Template Cost</div>
              <div className="text-3xl font-bold mb-2">${baseCost.toFixed(2)}</div>
              <div className="text-green-100 text-sm">
                Calculated from selected services for 2 adults (default)
              </div>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-4 text-center">
            This cost will be used as the base price for this template. Individual client quotes may vary based on passenger count and seasonal pricing.
          </p>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <button
            onClick={onBack}
            className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Previous Step
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            Review Template
            <FileText className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedItineraryReviewCosting;