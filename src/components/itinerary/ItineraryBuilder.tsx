import React, { useState } from 'react';
import { Client, DayPlan, Itinerary } from '../../types';
import ClientDetails from './ClientDetails';
import ItinerarySelection from './ItinerarySelection';
import FixedItineraryReview from './FixedItineraryReview';
import DayPlanning from './DayPlanning';
import ReviewCosting from './ReviewCosting';
import AdminFinalSummary from './AdminFinalSummary';
import Layout from '../Layout';

const ItineraryBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState<Client | null>(null);
  const [itineraryType, setItineraryType] = useState<'new' | 'fixed' | null>(null);
  const [selectedFixedItinerary, setSelectedFixedItinerary] = useState<any>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  const handleClientNext = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep(2);
  };

  const handleItinerarySelectionNext = (option: 'new' | 'fixed', selectedItinerary?: any) => {
    setItineraryType(option);
    setSelectedFixedItinerary(selectedItinerary);
    setCurrentStep(3);
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep(4);
  };

  const handleReviewNext = (itineraryData: Itinerary) => {
    setItinerary(itineraryData);
    setCurrentStep(5);
  };

  const handleFixedItineraryNext = (itineraryData: Itinerary) => {
    setItinerary(itineraryData);
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleStartNew = () => {
    setCurrentStep(1);
    setClient(null);
    setItineraryType(null);
    setSelectedFixedItinerary(null);
    setDayPlans([]);
    setItinerary(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ClientDetails onNext={handleClientNext} />;
      case 2:
        return client ? (
          <ItinerarySelection 
            client={client} 
            onNext={handleItinerarySelectionNext} 
            onBack={handleBack}
            userType="admin"
          />
        ) : null;
      case 3:
        if (itineraryType === 'fixed' && selectedFixedItinerary) {
          return (
            <FixedItineraryReview
              client={client!}
              fixedItinerary={selectedFixedItinerary}
              onNext={handleFixedItineraryNext}
              onBack={handleBack}
              userType="admin"
            />
          );
        } else if (itineraryType === 'new') {
          return client ? (
            <DayPlanning 
              client={client} 
              onNext={handleDayPlanningNext} 
              onBack={handleBack} 
              isAgent={false}
            />
          ) : null;
        }
        return null;
      case 4:
        return client ? (
          <ReviewCosting 
            client={client} 
            dayPlans={dayPlans} 
            onNext={handleReviewNext} 
            onBack={handleBack} 
          />
        ) : null;
      case 5:
        return itinerary ? (
          <AdminFinalSummary 
            itinerary={itinerary} 
            onBack={handleBack} 
            onStartNew={handleStartNew} 
          />
        ) : null;
      default:
        return <ClientDetails onNext={handleClientNext} />;
    }
  };

  // For steps 2-5, don't use Layout to avoid double headers
  if (currentStep > 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 md:py-8">
        <div className="container mx-auto px-2 md:px-4">
          {/* Progress Indicator */}
          <div className="max-w-4xl mx-auto mb-4 md:mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 md:p-4">
              <div className="flex items-center justify-between">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`
                      flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full font-semibold text-sm md:text-base
                      ${step <= currentStep 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-200 text-slate-500'
                      }
                    `}>
                      {step}
                    </div>
                    <div className="ml-2 md:ml-3 flex-1">
                      <div className={`text-xs md:text-sm font-medium ${
                        step <= currentStep ? 'text-slate-900' : 'text-slate-500'
                      }`}>
                        {step === 1 && 'Client Details'}
                        {step === 2 && 'Itinerary Type'}
                        {step === 3 && (itineraryType === 'fixed' ? 'Review Template' : 'Day Planning')}
                        {step === 4 && 'Review & Costing'}
                        {step === 5 && 'Final Summary'}
                      </div>
                    </div>
                    {step < 5 && (
                      <div className={`h-px flex-1 mx-4 ${
                        step < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {renderStep()}
        </div>
      </div>
    );
  }

  return (
    <Layout title="Itinerary Builder" subtitle="Create detailed travel packages for your clients">
      {renderStep()}
    </Layout>
  );
};

export default ItineraryBuilder;