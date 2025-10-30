import React, { useState } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { X, Save, CheckCircle } from 'lucide-react';
import ClientDetails from '../itinerary/ClientDetails';
import DayPlanning from '../itinerary/DayPlanning';
import ReviewCosting from '../itinerary/ReviewCosting';

interface ItineraryEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const ItineraryEditModal: React.FC<ItineraryEditModalProps> = ({ client, onClose, onSave }) => {
  const { getLatestItinerary } = useData();
  const latestItinerary = getLatestItinerary(client.id);

  // Start at DayPlanning step (2) if editing existing itinerary, otherwise start at ClientDetails (1)
  const initialStep = latestItinerary && latestItinerary.dayPlans.length > 0 ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [editedClient, setEditedClient] = useState<Client>(client);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(latestItinerary?.dayPlans || []);
  const [itinerary, setItinerary] = useState<Itinerary | null>(latestItinerary);

  const handleClientNext = (clientData: Client) => {
    setEditedClient(clientData);
    setCurrentStep(2);
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep(3);
  };

  const handleReviewNext = (itineraryData: Itinerary) => {
    setItinerary(itineraryData);
    setCurrentStep(4);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSave = () => {
    onSave(editedClient);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ClientDetails
            onNext={handleClientNext}
            initialData={editedClient}
          />
        );
      case 2:
        return (
          <DayPlanning
            client={editedClient}
            onNext={handleDayPlanningNext}
            onBack={handleBack}
            isAgent={false}
            initialDayPlans={dayPlans}
          />
        );
      case 3:
        return (
          <ReviewCosting
            client={editedClient}
            dayPlans={dayPlans}
            onNext={handleReviewNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Itinerary Updated Successfully
                </h2>
                <p className="text-slate-600">
                  Your changes have been saved. The itinerary has been updated with the new details.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-slate-900 mb-4">Update Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Client Name</p>
                    <p className="font-medium text-slate-900">{editedClient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Number of Days</p>
                    <p className="font-medium text-slate-900">{editedClient.numberOfDays} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Passengers</p>
                    <p className="font-medium text-slate-900">
                      {editedClient.numberOfPax.adults} Adults, {editedClient.numberOfPax.children} Children
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Transportation</p>
                    <p className="font-medium text-slate-900">{editedClient.transportationMode}</p>
                  </div>
                  {itinerary && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600">Version</p>
                        <p className="font-medium text-slate-900">v{itinerary.version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Total Cost</p>
                        <p className="font-medium text-slate-900">
                          ${itinerary.finalPrice.toFixed(2)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Back to Review
                </button>
                <button
                  onClick={handleFinalSave}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Update Itinerary & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Itinerary - {client.name}</h2>
            <p className="text-sm text-slate-600 mt-1">
              {latestItinerary
                ? `Version ${latestItinerary.version} • Last updated: ${new Date(latestItinerary.lastUpdated).toLocaleString()}`
                : 'Creating new itinerary'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default ItineraryEditModal;
