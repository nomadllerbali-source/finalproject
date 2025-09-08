import React, { useState } from 'react';
import { Client, DayPlan, FixedItinerary } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import FixedItineraryClientDetails from './FixedItineraryClientDetails';
import DayPlanning from '../itinerary/DayPlanning';
import FixedItineraryReviewCosting from './FixedItineraryReviewCosting';
import FixedItineraryFinalSummary from './FixedItineraryFinalSummary';

interface FixedItineraryBuilderProps {
  onSave: (fixedItinerary: FixedItinerary) => void;
  onClose: () => void;
}

const FixedItineraryBuilder: React.FC<FixedItineraryBuilderProps> = ({ onSave, onClose }) => {
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState<Client | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [templateData, setTemplateData] = useState<{
    baseCost: number;
    inclusions: string;
    exclusions: string;
  } | null>(null);

  const handleClientNext = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep(2);
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep(3);
  };

  const handleReviewNext = (data: { baseCost: number; inclusions: string; exclusions: string }) => {
    setTemplateData(data);
    setCurrentStep(4);
  };

  const handleFinalSave = () => {
    if (!client || !templateData) return;

    const fixedItinerary: FixedItinerary = {
      id: Date.now().toString(),
      name: client.name,
      numberOfDays: client.numberOfDays,
      transportationMode: client.transportationMode,
      baseCost: templateData.baseCost,
      inclusions: templateData.inclusions,
      exclusions: templateData.exclusions,
      dayPlans: dayPlans,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: authState.user?.id || 'admin'
    };

    onSave(fixedItinerary);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FixedItineraryClientDetails 
            onNext={handleClientNext}
            onClose={onClose}
          />
        );
      case 2:
        return client ? (
          <DayPlanning 
            client={client} 
            onNext={handleDayPlanningNext} 
            onBack={handleBack} 
            isAgent={false}
            isFixedItinerary={true}
          />
        ) : null;
      case 3:
        return client ? (
          <FixedItineraryReviewCosting 
            client={client} 
            dayPlans={dayPlans} 
            onNext={handleReviewNext} 
            onBack={handleBack} 
          />
        ) : null;
      case 4:
        return client && templateData ? (
          <FixedItineraryFinalSummary 
            client={client}
            dayPlans={dayPlans}
            templateData={templateData}
            onSave={handleFinalSave}
            onBack={handleBack} 
          />
        ) : null;
      default:
        return (
          <FixedItineraryClientDetails 
            onNext={handleClientNext}
            onClose={onClose}
          />
        );
    }
  };

  return (
    <div className="bg-white">
      {/* Progress Indicator */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm
                ${step <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
                }
              `}>
                {step}
              </div>
              <div className="ml-3 flex-1">
                <div className={`text-sm font-medium ${
                  step <= currentStep ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step === 1 && 'Template Details'}
                  {step === 2 && 'Day Planning'}
                  {step === 3 && 'Inclusions & Pricing'}
                  {step === 4 && 'Final Review'}
                </div>
              </div>
              {step < 4 && (
                <div className={`h-px flex-1 mx-4 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-6">
        {renderStep()}
      </div>
    </div>
  );
};

export default FixedItineraryBuilder;