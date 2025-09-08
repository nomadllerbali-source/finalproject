import React, { useState } from 'react';
import { Client, FixedItinerary, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { 
  DollarSign, Calendar, Users, MapPin, Building2, Camera, 
  Ticket, Utensils, FileText, TrendingUp, CheckCircle 
} from 'lucide-react';

interface FixedItineraryReviewProps {
  client: Client;
  fixedItinerary: FixedItinerary;
  onNext: (itinerary: Itinerary) => void;
  onBack: () => void;
  userType: 'admin' | 'agent' | 'sales';
}

const FixedItineraryReview: React.FC<FixedItineraryReviewProps> = ({ 
  client, 
  fixedItinerary, 
  onNext, 
  onBack, 
  userType 
}) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals } = state;
  
  const [profitMargin, setProfitMargin] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(83);

  // Calculate final price based on user type
  const getBaseCost = () => {
    if (userType === 'admin') {
      return fixedItinerary.baseCost;
    } else if (userType === 'agent') {
      return fixedItinerary.baseCost + 35; // Agent markup
    } else {
      return fixedItinerary.baseCost + 50; // Sales markup
    }
  };

  const baseCost = getBaseCost();
  const finalPrice = baseCost + profitMargin;

  const getGradientColors = () => {
    switch (userType) {
      case 'admin': return 'from-blue-600 to-teal-600';
      case 'agent': return 'from-teal-600 to-green-600';
      case 'sales': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-teal-600';
    }
  };

  const getProfitLabel = () => {
    switch (userType) {
      case 'admin': return 'Profit Margin';
      case 'agent': return 'Agent Profit';
      case 'sales': return 'Sales Commission';
      default: return 'Profit Margin';
    }
  };

  const handleSubmit = () => {
    const itinerary: Itinerary = {
      id: `itinerary-${client.id}-${Date.now()}`,
      client,
      dayPlans: fixedItinerary.dayPlans,
      totalBaseCost: baseCost,
      profitMargin,
      finalPrice,
      exchangeRate,
      version: 1,
      lastUpdated: new Date().toISOString(),
      updatedBy: userType,
      changeLog: [{
        id: Date.now().toString(),
        version: 1,
        changeType: 'created',
        description: `Itinerary created from fixed template: ${fixedItinerary.name}`,
        timestamp: new Date().toISOString(),
        updatedBy: userType
      }]
    };
    onNext(itinerary);
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

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${getGradientColors()} px-4 md:px-8 py-4 md:py-6`}>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Review Fixed Itinerary</h2>
              <p className="text-blue-100 mt-1 text-sm md:text-base">
                Step 3 of 5 - Review template and set pricing
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6">
          {/* Template Overview */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-green-600" />
              Selected Template: {fixedItinerary.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{fixedItinerary.numberOfDays}</div>
                <div className="text-sm text-slate-600">Days</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-lg font-bold text-purple-600">{fixedItinerary.transportationMode}</div>
                <div className="text-sm text-slate-600">Transportation</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">${fixedItinerary.baseCost}</div>
                <div className="text-sm text-slate-600">Base Template Cost</div>
              </div>
            </div>
          </div>

          {/* Complete Itinerary Preview */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Complete Itinerary Preview
            </h3>
            
            <div className="space-y-4">
              {fixedItinerary.dayPlans.map((dayPlan) => {
                const summary = renderDayPlanSummary(dayPlan);
                
                return (
                  <div key={dayPlan.day} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="text-base font-semibold text-slate-900 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                      Day {dayPlan.day}
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {summary.sightseeing.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              Sightseeing
                            </h5>
                            <ul className="text-sm text-slate-700 space-y-1 ml-6">
                              {summary.sightseeing.map((sight: any) => (
                                <li key={sight.id}>• {sight.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {summary.activities.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                              <Camera className="h-4 w-4 mr-2 text-blue-600" />
                              Activities
                            </h5>
                            <ul className="text-sm text-slate-700 space-y-1 ml-6">
                              {summary.activities.map((item: any, index: number) => (
                                <li key={index}>
                                  • {item.activity?.name} - {item.option?.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {summary.tickets.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
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
                      </div>

                      <div className="space-y-3">
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

                        {summary.meals.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                              <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                              Meals
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
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-green-600">
                ✅ Inclusions
              </h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {fixedItinerary.inclusions}
                </pre>
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-red-600">
                ❌ Exclusions
              </h4>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {fixedItinerary.exclusions}
                </pre>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Pricing Configuration
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Exchange Rate (USD to INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 83)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter current exchange rate"
                  />
                  <p className="text-sm text-slate-600 mt-1">
                    Current rate: 1 USD = ₹{exchangeRate}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    {userType === 'admin' ? 'Template Base Cost' : 'Package Cost'}
                  </h4>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-slate-900">
                      ${baseCost.toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      ₹{(baseCost * exchangeRate).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">
                    {userType === 'admin' 
                      ? 'Original template cost' 
                      : 'Includes template cost with markup'
                    }
                  </p>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Add {getProfitLabel()} (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={userType === 'admin' ? '50' : userType === 'agent' ? '10' : '25'}
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder={`Enter your ${getProfitLabel().toLowerCase()} in USD`}
                  />
                  <p className="text-sm text-slate-600 mt-1">
                    Your {getProfitLabel().toLowerCase()} on this package
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className={`bg-gradient-to-r ${getGradientColors().replace('from-', 'from-').replace('to-', 'to-').replace('-600', '-500').replace('-600', '-500')} text-white rounded-xl p-6 w-full text-center`}>
                  <h4 className="text-base font-semibold mb-2">Final Quote Price</h4>
                  <div className="space-y-2 mb-2">
                    <div className="text-3xl font-bold">
                      ${finalPrice.toFixed(2)}
                    </div>
                    <div className="text-2xl font-bold text-opacity-80">
                      ₹{(finalPrice * exchangeRate).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <p className="text-opacity-80 text-sm">
                    Total package price for {client.numberOfPax.adults + client.numberOfPax.children} passengers
                  </p>
                  {profitMargin > 0 && (
                    <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                      <div className="text-sm space-y-1 text-opacity-80">
                        <div>Base Cost: ${baseCost.toFixed(2)} / ₹{(baseCost * exchangeRate).toLocaleString('en-IN')}</div>
                        <div>Your {getProfitLabel()}: ${profitMargin.toFixed(2)} / ₹{(profitMargin * exchangeRate).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-200">
            <button
              onClick={onBack}
              className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Previous Step
            </button>
            <button
              onClick={handleSubmit}
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${getGradientColors()} text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
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

export default FixedItineraryReview;