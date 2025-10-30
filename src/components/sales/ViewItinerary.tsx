import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SalesClient } from '../../lib/salesHelpers';
import { Client, Itinerary } from '../../types';
import SalesFinalSummary from '../itinerary/SalesFinalSummary';
import Layout from '../Layout';

interface ViewItineraryProps {
  client: SalesClient;
  onBack: () => void;
}

const ViewItinerary: React.FC<ViewItineraryProps> = ({ client: salesClient, onBack }) => {
  const [client, setClient] = useState<Client | null>(null);
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
      setItinerary({
        id: salesClient.id,
        clientId: salesClient.id,
        days: itineraryData.days,
        totalCost: salesClient.total_cost || 0,
        status: 'draft'
      });
    }
  }, [salesClient]);

  if (!client || !itinerary) {
    return (
      <Layout title="View Itinerary" subtitle={salesClient.name}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No itinerary data available</p>
          <button
            onClick={onBack}
            className="mt-4 inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="View Itinerary" subtitle={salesClient.name}>
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
      <SalesFinalSummary
        client={client}
        itinerary={itinerary}
        onStartNew={() => {}}
        onBackToDashboard={onBack}
      />
    </Layout>
  );
};

export default ViewItinerary;
