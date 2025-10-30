import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { SalesClient, updateSalesClient, getLatestItineraryVersion, createItineraryVersion, ItineraryVersion } from '../../lib/salesHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { Client, DayPlan, Itinerary } from '../../types';
import DayPlanning from '../itinerary/DayPlanning';
import SalesReviewCosting from '../itinerary/SalesReviewCosting';
import ClientDetails from '../itinerary/ClientDetails';
import Layout from '../Layout';

interface EditClientProps {
  client: SalesClient;
  onBack: () => void;
}

const EditClient: React.FC<EditClientProps> = ({ client: salesClient, onBack }) => {
  const { state: authState } = useAuth();
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'dayPlanning' | 'review'>('details');

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

  // Itinerary data
  const [latestVersion, setLatestVersion] = useState<ItineraryVersion | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [originalDays, setOriginalDays] = useState(salesClient.number_of_days);

  useEffect(() => {
    loadLatestVersion();
  }, [salesClient.id]);

  const loadLatestVersion = async () => {
    try {
      const version = await getLatestItineraryVersion(salesClient.id);
      setLatestVersion(version);

      if (version && version.itinerary_data && version.itinerary_data.days) {
        setDayPlans(version.itinerary_data.days);
      }
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

      // If number of days changed, adjust day plans
      if (updatedClient.numberOfDays !== originalDays) {
        adjustDayPlans(updatedClient.numberOfDays);
      }

      setClientData(updatedClient);
      setOriginalDays(updatedClient.numberOfDays);
      alert('Client details updated successfully!');
      onBack();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client details. Please try again.');
    }
  };

  const adjustDayPlans = async (newNumberOfDays: number) => {
    const currentDays = dayPlans.length;

    if (newNumberOfDays > currentDays) {
      // Add new empty days
      const newDays: DayPlan[] = [];
      for (let i = currentDays + 1; i <= newNumberOfDays; i++) {
        newDays.push({
          day: i,
          sightseeing: [],
          hotel: null,
          activities: [],
          entryTickets: [],
          meals: []
        });
      }
      const updatedPlans = [...dayPlans, ...newDays];
      setDayPlans(updatedPlans);

      // Update the itinerary version with new day plans
      if (latestVersion) {
        await updateSalesClient(salesClient.id, {
          itinerary_data: { days: updatedPlans }
        });
      }
    } else if (newNumberOfDays < currentDays) {
      // Remove extra days
      const updatedPlans = dayPlans.slice(0, newNumberOfDays);
      setDayPlans(updatedPlans);

      // Update the itinerary version with truncated day plans
      if (latestVersion) {
        await updateSalesClient(salesClient.id, {
          itinerary_data: { days: updatedPlans }
        });
      }
    }
  };

  const handleEditItinerary = () => {
    if (!latestVersion) {
      alert('No itinerary found to edit.');
      return;
    }

    // Ensure day plans match current number of days
    adjustDayPlans(clientData.numberOfDays);
    setEditingItinerary(true);
    setCurrentStep('dayPlanning');
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep('review');
  };

  const handleDayPlanningBack = () => {
    setEditingItinerary(false);
    setCurrentStep('details');
  };

  const handleReviewNext = (itineraryData: Itinerary) => {
    setItinerary(itineraryData);
    setShowChangeModal(true);
  };

  const handleReviewBack = () => {
    setCurrentStep('dayPlanning');
  };

  const handleSaveNewVersion = async () => {
    if (!changeDescription.trim()) {
      alert('Please describe what changed in this version.');
      return;
    }

    if (!itinerary) {
      alert('Missing itinerary data.');
      return;
    }

    try {
      const userId = authState.user?.id;
      if (!userId) {
        throw new Error('User must be authenticated');
      }

      const newVersion = await createItineraryVersion(
        salesClient.id,
        { days: itinerary.dayPlans },
        itinerary.finalPrice,
        changeDescription,
        salesClient.current_follow_up_status,
        userId
      );

      if (newVersion) {
        await updateSalesClient(salesClient.id, {
          itinerary_data: { days: itinerary.dayPlans },
          total_cost: itinerary.finalPrice
        });

        alert(`New itinerary version ${newVersion.version_number} created successfully!`);
        setShowChangeModal(false);
        setChangeDescription('');
        setEditingItinerary(false);
        setCurrentStep('details');
        onBack();
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      alert('Failed to create new version. Please try again.');
    }
  };


  // Render day planning step
  if (editingItinerary && currentStep === 'dayPlanning') {
    return (
      <DayPlanning
        client={clientData}
        initialDayPlans={dayPlans}
        onNext={handleDayPlanningNext}
        onBack={handleDayPlanningBack}
        isAgent={false}
      />
    );
  }

  // Render review step
  if (editingItinerary && currentStep === 'review') {
    return (
      <SalesReviewCosting
        client={clientData}
        dayPlans={dayPlans}
        onNext={handleReviewNext}
        onBack={handleReviewBack}
      />
    );
  }

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
              <span className="font-medium">Total Cost:</span> ₹{latestVersion.total_cost.toLocaleString()}
            </p>
            <p className="text-sm text-slate-700 mt-2">
              <span className="font-medium">Days in Itinerary:</span> {dayPlans.length}
            </p>
          </div>
        </div>
      )}

      {/* Change Description Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Describe the Changes</h3>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a brief description of what changed in this new version. This helps track the itinerary evolution.
            </p>

            <textarea
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="E.g., Changed hotel in Day 2 from Grand Hotel to Royal Resort, added sunset cruise activity"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              autoFocus
            />

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowChangeModal(false);
                  setChangeDescription('');
                }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewVersion}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
              >
                Create New Version
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EditClient;
