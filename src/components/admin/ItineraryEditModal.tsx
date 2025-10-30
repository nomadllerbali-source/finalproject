import React, { useState } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { insertClient, updateClient, insertItinerary, updateItinerary } from '../../lib/supabaseHelpers';
import { X, Save, CheckCircle, Loader2 } from 'lucide-react';
import ClientDetails from '../itinerary/ClientDetails';
import DayPlanning from '../itinerary/DayPlanning';
import ReviewCosting from '../itinerary/ReviewCosting';

interface ItineraryEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const ItineraryEditModal: React.FC<ItineraryEditModalProps> = ({ client, onClose, onSave }) => {
  const { getLatestItinerary, dispatch } = useData();
  const { state: authState } = useAuth();
  const latestItinerary = getLatestItinerary(client.id);

  // Start at DayPlanning step (2) if editing existing itinerary, otherwise start at ClientDetails (1)
  const initialStep = latestItinerary && latestItinerary.dayPlans.length > 0 ? 2 : 1;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [editedClient, setEditedClient] = useState<Client>(client);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>(latestItinerary?.dayPlans || []);
  const [itinerary, setItinerary] = useState<Itinerary | null>(latestItinerary);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleClientNext = (clientData: Client) => {
    setEditedClient(clientData);
    setCurrentStep(2);
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep(3);
  };

  const handleReviewNext = async (itineraryData: Itinerary) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // First, update the client in the database
      await updateClient(editedClient);

      // Then save or update the itinerary
      let savedItinerary: Itinerary;
      if (latestItinerary) {
        // Update existing itinerary
        const updatedItinerary = {
          ...itineraryData,
          id: latestItinerary.id,
          version: latestItinerary.version + 1,
          lastUpdated: new Date().toISOString(),
          updatedBy: authState.user?.email || 'admin'
        };
        savedItinerary = await updateItinerary(updatedItinerary);
        dispatch({ type: 'UPDATE_ITINERARY', payload: savedItinerary });
      } else {
        // Create new itinerary
        savedItinerary = await insertItinerary(itineraryData);
        dispatch({ type: 'ADD_ITINERARY', payload: savedItinerary });
      }

      setItinerary(savedItinerary);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving itinerary:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save itinerary');
    } finally {
      setIsSaving(false);
    }
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
          <div>
            <ReviewCosting
              client={editedClient}
              dayPlans={dayPlans}
              onNext={handleReviewNext}
              onBack={handleBack}
              isEditMode={true}
            />
            {isSaving && (
              <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
                  <p className="text-lg font-semibold text-slate-900">Saving Itinerary...</p>
                  <p className="text-sm text-slate-600 mt-2">Please wait while we update the database</p>
                </div>
              </div>
            )}
            {saveError && (
              <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md z-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error Saving Itinerary</h3>
                    <p className="text-sm text-red-700 mt-1">{saveError}</p>
                  </div>
                  <button
                    onClick={() => setSaveError(null)}
                    className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
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
