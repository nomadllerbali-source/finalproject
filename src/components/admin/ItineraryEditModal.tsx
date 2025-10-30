import React, { useState } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import { useData } from '../../contexts/DataContext';
import { X } from 'lucide-react';
import ClientDetails from '../itinerary/ClientDetails';
import DayPlanning from '../itinerary/DayPlanning';
import ReviewCosting from '../itinerary/ReviewCosting';
import AdminFinalSummary from '../itinerary/AdminFinalSummary';

interface ItineraryEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const ItineraryEditModal: React.FC<ItineraryEditModalProps> = ({ client, onClose, onSave }) => {
  const { getLatestItinerary } = useData();
  const latestItinerary = getLatestItinerary(client.id);

  const [currentStep, setCurrentStep] = useState(1);
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
          <AdminFinalSummary
            itinerary={itinerary!}
            onStartNew={handleFinalSave}
          />
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
