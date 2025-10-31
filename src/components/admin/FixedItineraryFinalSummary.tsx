import React, { useState } from 'react';
import { Client, DayPlan } from '../../types';
import { useData } from '../../contexts/DataContext';
import { 
  CheckCircle, ArrowLeft, Save, Calendar, Users, 
  MapPin, Building2, Camera, Ticket, Utensils, DollarSign,
  FileText, Copy, Download
} from 'lucide-react';

interface FixedItineraryFinalSummaryProps {
  client: Client;
  dayPlans: DayPlan[];
  templateData: {
    baseCost: number;
    inclusions: string;
    exclusions: string;
  };
  onSave: () => void;
  onBack: () => void;
}

const FixedItineraryFinalSummary: React.FC<FixedItineraryFinalSummaryProps> = ({ 
  client, 
  dayPlans, 
  templateData, 
  onSave, 
  onBack 
}) => {
  const { state } = useData();
  const { hotels, sightseeings, activities, entryTickets, meals } = state;
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save delay for better UX
    setTimeout(() => {
      onSave();
      setSaveSuccess(true);
      setIsSaving(false);
      
      // Auto-close after success message
      setTimeout(() => {
        setSaveSuccess(false);
      }, 1500);
    }, 1000);
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

  const copyTemplateDetails = () => {
    const details = `${client.name}\n\nDuration: ${client.numberOfDays} days\nTransportation: ${client.transportationMode}\nBase Cost: Rp ${templateData.baseCost.toLocaleString('id-ID')}\n\nInclusions:\n${templateData.inclusions}\n\nExclusions:\n${templateData.exclusions}`;
    
    navigator.clipboard.writeText(details).then(() => {
      alert('✅ Template details copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy details. Please try again.');
    });
  };

  if (saveSuccess) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8">
          <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Template Saved Successfully!</h2>
          <p className="text-green-700 mb-4">
            Your fixed itinerary template "{client.name}" has been created and is now available for use.
          </p>
          <div className="text-sm text-green-600">
            Closing in a moment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-3 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Template Ready to Save</h2>
            <p className="text-slate-600 mt-1">Step 4 of 4 - Final review and save your template</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Template Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Template Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{client.name}</div>
              <div className="text-sm text-slate-600">Template Name</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{client.numberOfDays}</div>
              <div className="text-sm text-slate-600">Days</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{client.transportationMode}</div>
              <div className="text-sm text-slate-600">Transportation</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Rp {templateData.baseCost.toLocaleString('id-ID')}</div>
              <div className="text-sm text-slate-600">Base Cost</div>
            </div>
          </div>
        </div>

        {/* Complete Itinerary */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Complete Template Itinerary</h3>
          
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

        {/* Inclusions & Exclusions Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-green-600">
              ✅ Template Inclusions
            </h4>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {templateData.inclusions}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-red-600">
              ❌ Template Exclusions
            </h4>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {templateData.exclusions}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-slate-200">
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="inline-flex items-center px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Review
            </button>
            <button
              onClick={copyTemplateDetails}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="mr-2 h-5 w-5" />
              Copy Template
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving Template...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Fixed Itinerary
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixedItineraryFinalSummary;