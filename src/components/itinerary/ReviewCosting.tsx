import React, { useState, useEffect } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { calculateItineraryCost, getSeasonalPrice, formatCurrency } from '../../utils/calculations';
import { generateUUID } from '../../utils/uuid';
import { DollarSign, Calendar, Users, MapPin, Building2, Camera, Ticket, Utensils, TrendingUp } from 'lucide-react';

interface ReviewCostingProps {
  client: Client;
  dayPlans: DayPlan[];
  onNext: (itinerary: Itinerary) => void;
  onBack: () => void;
}

const ReviewCosting: React.FC<ReviewCostingProps> = ({ client, dayPlans, onNext, onBack }) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals, transportations } = state;
  const [profitMargin, setProfitMargin] = useState(0);

  const totalBaseCost = calculateItineraryCost(
    client, dayPlans, hotels, sightseeings, activities, entryTickets, meals, transportations
  );
  const finalPrice = totalBaseCost + profitMargin;

  const handleSubmit = () => {
    const itinerary: Itinerary = {
      id: generateUUID(),
      client,
      dayPlans,
      totalBaseCost,
      profitMargin,
      finalPrice,
      exchangeRate: 1,
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin',
      changeLog: []
    };

    onNext(itinerary);
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
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Review & Costing</h2>
              <p className="text-green-100 mt-1 text-sm md:text-base">Step 3 of 4 - Final Review and Pricing</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Client Summary */}
          <div className="bg-slate-50 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-3 md:mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Client Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div>
                <span className="text-xs md:text-sm font-medium text-slate-700">Client:</span>
                <div className="text-sm md:text-base text-slate-900 font-semibold">{client.name}</div>
              </div>
              <div>
                <span className="text-xs md:text-sm font-medium text-slate-700">Duration:</span>
                <div className="text-sm md:text-base text-slate-900 font-semibold">{client.numberOfDays} days</div>
              </div>
              <div>
                <span className="text-xs md:text-sm font-medium text-slate-700">Passengers:</span>
                <div className="text-sm md:text-base text-slate-900 font-semibold">
                  {client.numberOfPax.adults + client.numberOfPax.children} pax
                </div>
              </div>
              <div>
                <span className="text-xs md:text-sm font-medium text-slate-700">Transport:</span>
                <div className="text-sm md:text-base text-slate-900 font-semibold">{client.transportationMode}</div>
              </div>
            </div>
          </div>

          {/* Itinerary Details */}
          <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Detailed Itinerary</h3>
            
            {dayPlans.map((dayPlan) => {
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
                            {summary.sightseeing.map(sight => (
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
                          <h5 className="text-sm md:text-base font-medium text-slate-900 flex items-center mb-2">
                            <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                            Entry Tickets
                          </h5>
                          <ul className="text-xs md:text-sm text-slate-700 space-y-1 ml-6">
                            {summary.tickets.map(ticket => (
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

          {/* Cost Breakdown */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Cost Breakdown & Pricing
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3 md:space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3">Total Base Cost</h4>
                  <div className="space-y-1">
                    <div className="text-lg md:text-xl font-bold text-slate-900">
                      {formatCurrency(totalBaseCost)}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Includes all selected services and accommodation
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <label className="block text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3">
                    Add Profit Margin (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 md:p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
                    placeholder="Enter profit in IDR"
                  />
                  <p className="text-xs md:text-sm text-slate-600 mt-1">
                    Your profit margin or commission amount
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl p-4 md:p-6 w-full text-center">
                  <h4 className="text-sm md:text-base font-semibold mb-2">Final Quote Price</h4>
                  <div className="space-y-2 mb-2">
                    <div className="text-2xl md:text-3xl font-bold">
                      {formatCurrency(finalPrice)}
                    </div>
                  </div>
                  <p className="text-green-100 text-sm md:text-base">
                    Total package price for {client.numberOfPax.adults + client.numberOfPax.children} passengers
                  </p>
                  {profitMargin > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-400 border-opacity-50">
                      <div className="text-xs md:text-sm space-y-1">
                        <div>Base Cost: {formatCurrency(totalBaseCost)}</div>
                        <div>Your Profit: {formatCurrency(profitMargin)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 md:pt-8 border-t border-slate-200 mt-6 md:mt-8">
            <button
              onClick={onBack}
              className="px-4 md:px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm md:text-base"
            >
              Previous Step
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center px-4 md:px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              Generate Summary
              <DollarSign className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCosting;