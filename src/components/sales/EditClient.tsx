import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { SalesClient, updateSalesClient, getLatestItineraryVersion, ItineraryVersion } from '../../lib/salesHelpers';
import { Client } from '../../types';
import ClientDetails from '../itinerary/ClientDetails';
import Layout from '../Layout';

interface EditClientProps {
  client: SalesClient;
  onBack: () => void;
  onEditItinerary: (client: SalesClient) => void;
}

const EditClient: React.FC<EditClientProps> = ({ client: salesClient, onBack, onEditItinerary }) => {

  // Client data
  const [clientData, setClientData] = useState<Client>({
    id: salesClient.id,
    name: salesClient.name,
    email: salesClient.email || undefined,
    whatsapp: salesClient.whatsapp,
    countryCode: salesClient.country_code,
    travelDates: {
      startDate: salesClient.travel_date,
      endDate: salesClient.travel_date,
      isFlexible: false,
      flexibleMonth: ''
    },
    numberOfPax: {
      adults: salesClient.number_of_adults,
      children: salesClient.number_of_children
    },
    numberOfDays: salesClient.number_of_days,
    transportationMode: salesClient.transportation_mode,
    createdAt: salesClient.created_at,
    createdBy: salesClient.sales_person_id
  });

  const [latestVersion, setLatestVersion] = useState<ItineraryVersion | null>(null);

  useEffect(() => {
    loadLatestVersion();
  }, [salesClient.id]);

  const loadLatestVersion = async () => {
    try {
      const version = await getLatestItineraryVersion(salesClient.id);
      setLatestVersion(version);
    } catch (error) {
      console.error('Error loading latest itinerary version:', error);
    }
  };

  const handleSaveBasicDetails = async (updatedClient: Client) => {
    try {
      await updateSalesClient(salesClient.id, {
        name: updatedClient.name,
        email: updatedClient.email || undefined,
        country_code: updatedClient.countryCode,
        whatsapp: updatedClient.whatsapp,
        travel_date: updatedClient.travelDates.startDate,
        number_of_days: updatedClient.numberOfDays,
        number_of_adults: updatedClient.numberOfPax.adults,
        number_of_children: updatedClient.numberOfPax.children,
        transportation_mode: updatedClient.transportationMode
      });

      setClientData(updatedClient);
      alert('Client details updated successfully!');
      onBack();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client details. Please try again.');
    }
  };


  const handleEditItinerary = () => {
    if (!latestVersion) {
      alert('No itinerary found to edit.');
      return;
    }
    onEditItinerary(salesClient);
  };

  // Render basic details edit form
  return (
    <Layout title="Edit Client" subtitle={salesClient.name}>
      <div className="mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {/* Client Details Component */}
      <div className="mb-6">
        <ClientDetails
          onNext={handleSaveBasicDetails}
          initialData={clientData}
        />
      </div>

      {/* Itinerary Section */}
      {latestVersion && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Current Itinerary</h3>
              <p className="text-sm text-slate-600">
                Version {latestVersion.version_number} • Last updated{' '}
                {new Date(latestVersion.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleEditItinerary}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all font-medium"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Itinerary
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              <span className="font-medium">Change Description:</span> {latestVersion.change_description}
            </p>
            <p className="text-sm text-slate-700 mt-2">
              <span className="font-medium">Total Cost:</span> IDR {latestVersion.total_cost.toLocaleString()}
            </p>
            <p className="text-sm text-slate-700 mt-2">
              <span className="font-medium">Days in Itinerary:</span> {salesClient.number_of_days}
            </p>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default EditClient;
