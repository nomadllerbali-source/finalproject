import React, { useState } from 'react';
import { Client, FixedItinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { 
  Plus, FileText, Calendar, MapPin, DollarSign, Users, 
  ArrowRight, Building2, Camera, Ticket, Utensils, CheckCircle 
} from 'lucide-react';

interface ItinerarySelectionProps {
  client: Client;
  onNext: (option: 'new' | 'fixed', selectedItinerary?: FixedItinerary) => void;
  onBack: () => void;
  userType: 'admin' | 'agent' | 'sales';
}

const ItinerarySelection: React.FC<ItinerarySelectionProps> = ({ 
  client, 
  onNext, 
  onBack, 
  userType 
}) => {
  const { state } = useData();
  const { fixedItineraries } = state;
  const [selectedOption, setSelectedOption] = useState<'new' | 'fixed' | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<FixedItinerary | null>(null);

  // Filter fixed itineraries by number of days
  const matchingItineraries = fixedItineraries.filter(
    itinerary => itinerary.numberOfDays === client.numberOfDays
  );

  const handleContinue = () => {
    if (selectedOption === 'new') {
      onNext('new');
    } else if (selectedOption === 'fixed' && selectedItinerary) {
      onNext('fixed', selectedItinerary);
    }
  };

  const getGradientColors = () => {
    switch (userType) {
      case 'admin': return 'from-blue-600 to-teal-600';
      case 'agent': return 'from-teal-600 to-green-600';
      case 'sales': return 'from-purple-600 to-pink-600';
      default: return 'from-blue-600 to-teal-600';
    }
  };

  const getAccentColor = () => {
    switch (userType) {
      case 'admin': return 'blue';
      case 'agent': return 'teal';
      case 'sales': return 'purple';
      default: return 'blue';
    }
  };

  const accentColor = getAccentColor();

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className={`bg-gradient-to-r ${getGradientColors()} px-4 md:px-8 py-4 md:py-6`}>
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Choose Itinerary Type</h2>
              <p className="text-blue-100 mt-1 text-sm md:text-base">
                Step 2 of {userType === 'admin' ? '5' : '5'} - Select how to create your itinerary
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6">
          {/* Client Summary */}
          <div className="bg-slate-50 rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Trip Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-sm font-medium text-slate-700">Client:</span>
                <div className="text-base text-slate-900 font-semibold">{client.name}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Duration:</span>
                <div className="text-base text-slate-900 font-semibold">{client.numberOfDays} days</div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Passengers:</span>
                <div className="text-base text-slate-900 font-semibold">
                  {client.numberOfPax.adults + client.numberOfPax.children} pax
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">Transport:</span>
                <div className="text-base text-slate-900 font-semibold">{client.transportationMode}</div>
              </div>
            </div>
          </div>

          {/* Option Selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900">Choose Your Approach</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create New Itinerary */}
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedOption === 'new' 
                    ? `border-${accentColor}-500 bg-${accentColor}-50` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setSelectedOption('new');
                  setSelectedItinerary(null);
                }}
              >
                <div className="text-center">
                  <div className={`bg-${accentColor}-100 p-4 rounded-lg inline-block mb-4`}>
                    <Plus className={`h-8 w-8 text-${accentColor}-600`} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Create New Itinerary</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Build a completely custom itinerary from scratch with full control over every detail.
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Day-by-day planning</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Custom sightseeing selection</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Building2 className="h-4 w-4" />
                      <span>Hotel & activity choices</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Fixed Itinerary */}
              <div 
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  selectedOption === 'fixed' 
                    ? `border-${accentColor}-500 bg-${accentColor}-50` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => {
                  setSelectedOption('fixed');
                  setSelectedItinerary(null);
                }}
              >
                <div className="text-center">
                  <div className={`bg-green-100 p-4 rounded-lg inline-block mb-4`}>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Select Fixed Itinerary</h4>
                  <p className="text-slate-600 text-sm mb-4">
                    Choose from pre-designed itinerary templates that match your trip duration.
                  </p>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Pre-planned activities</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Quick pricing setup</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>{matchingItineraries.length} templates available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Itinerary Selection */}
            {selectedOption === 'fixed' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-slate-900">
                  Available {client.numberOfDays}-Day Itineraries
                </h4>
                
                {matchingItineraries.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                    <h5 className="text-yellow-900 font-medium mb-2">No Fixed Itineraries Available</h5>
                    <p className="text-yellow-700 text-sm mb-4">
                      No pre-designed itineraries are available for {client.numberOfDays} days.
                    </p>
                    <button
                      onClick={() => setSelectedOption('new')}
                      className={`inline-flex items-center px-4 py-2 bg-${accentColor}-600 text-white rounded-lg hover:bg-${accentColor}-700 transition-colors`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Instead
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingItineraries.map((itinerary) => (
                      <div
                        key={itinerary.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedItinerary?.id === itinerary.id
                            ? `border-${accentColor}-500 bg-${accentColor}-50`
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedItinerary(itinerary)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`bg-${accentColor}-100 p-2 rounded-lg`}>
                              <FileText className={`h-5 w-5 text-${accentColor}-600`} />
                            </div>
                            <div>
                              <h5 className="font-semibold text-slate-900">{itinerary.name}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {itinerary.numberOfDays} days
                                </span>
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${itinerary.baseCost}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{itinerary.transportationMode}</span>
                          </div>
                          
                          {itinerary.dayPlans && itinerary.dayPlans.length > 0 && (
                            <div className="bg-slate-50 rounded-lg p-3 mt-3">
                              <div className="text-xs font-medium text-slate-700 mb-2">Includes:</div>
                              <div className="flex items-center space-x-4 text-xs text-slate-600">
                                <div className="flex items-center">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Hotels
                                </div>
                                <div className="flex items-center">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Activities
                                </div>
                                <div className="flex items-center">
                                  <Utensils className="h-3 w-3 mr-1" />
                                  Meals
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
              onClick={handleContinue}
              disabled={!selectedOption || (selectedOption === 'fixed' && !selectedItinerary)}
              className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${getGradientColors()} text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105`}
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItinerarySelection;