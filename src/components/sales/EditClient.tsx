import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SalesClient, updateSalesClient } from '../../lib/salesHelpers';
import { Client, DayPlan, Itinerary } from '../../types';
import ClientDetails from '../itinerary/ClientDetails';
import ItinerarySelection from '../itinerary/ItinerarySelection';
import FixedItineraryReview from '../itinerary/FixedItineraryReview';
import DayPlanning from '../itinerary/DayPlanning';
import SalesReviewCosting from '../itinerary/SalesReviewCosting';
import SalesFinalSummary from '../itinerary/SalesFinalSummary';
import Layout from '../Layout';

interface EditClientProps {
  client: SalesClient;
  onBack: () => void;
}

const EditClient: React.FC<EditClientProps> = ({ client: salesClient, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState<Client | null>(null);
  const [itineraryType, setItineraryType] = useState<'new' | 'fixed' | null>(null);
  const [selectedFixedItinerary, setSelectedFixedItinerary] = useState<any>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const itineraryData = salesClient.itinerary_data;

    const clientData: Client = {
      id: salesClient.id,
      name: salesClient.name,
      email: salesClient.email || undefined,
      whatsapp: salesClient.whatsapp,
      countryCode: salesClient.country_code,
      startDate: salesClient.travel_date,
      endDate: salesClient.travel_date,
      isFlexible: false,
      adults: salesClient.number_of_adults,
      children: salesClient.number_of_children,
      numberOfDays: salesClient.number_of_days,
      transportationMode: salesClient.transportation_mode
    };

    setClient(clientData);

    if (itineraryData && itineraryData.days) {
      setDayPlans(itineraryData.days);
      setItinerary({
        id: salesClient.id,
        clientId: salesClient.id,
        days: itineraryData.days,
        totalCost: salesClient.total_cost || 0,
        status: 'draft'
      });
    }
  }, [salesClient]);

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
    if (currentStep === 1) {
      onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveAndExit = async () => {
    if (client && itinerary) {
      try {
        await updateSalesClient(salesClient.id, {
          name: client.name,
          email: client.email,
          country_code: client.countryCode,
          whatsapp: client.whatsapp,
          travel_date: client.startDate,
          number_of_days: client.numberOfDays,
          number_of_adults: client.adults,
          number_of_children: client.children,
          transportation_mode: client.transportationMode as 'Flight' | 'Train' | 'Bus',
          itinerary_data: {
            days: itinerary.days
          },
          total_cost: itinerary.totalCost
        });
        alert('Changes saved successfully!');
        onBack();
      } catch (error) {
        console.error('Error saving changes:', error);
        alert('Failed to save changes. Please try again.');
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <div className="mb-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <ClientDetails onNext={handleClientNext} />
          </div>
        );

      case 2:
        return client ? (
          <ItinerarySelection
            client={client}
            onNext={handleItinerarySelectionNext}
            onBack={handleBack}
            userType="sales"
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
              userType="sales"
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
          <SalesReviewCosting
            client={client}
            dayPlans={dayPlans}
            onNext={handleReviewNext}
            onBack={handleBack}
          />
        ) : null;

      case 5:
        return client && itinerary ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              <button
                onClick={handleSaveAndExit}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Save & Exit
              </button>
            </div>
            <SalesFinalSummary
              client={client}
              itinerary={itinerary}
              onStartNew={() => {}}
              onBackToDashboard={onBack}
            />
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Layout title="Edit Client & Itinerary" subtitle={salesClient.name}>
      {renderStep()}
    </Layout>
  );
};

export default EditClient;
