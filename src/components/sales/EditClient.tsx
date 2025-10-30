import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { SalesClient, updateSalesClient, getLatestItineraryVersion, createItineraryVersion, ItineraryVersion } from '../../lib/salesHelpers';
import { useAuth } from '../../contexts/AuthContext';
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
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [client, setClient] = useState<Client | null>(null);
  const [showItineraryEdit, setShowItineraryEdit] = useState(false);
  const [itineraryType, setItineraryType] = useState<'new' | 'fixed' | null>(null);
  const [selectedFixedItinerary, setSelectedFixedItinerary] = useState<any>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [latestVersion, setLatestVersion] = useState<ItineraryVersion | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [salesClient]);

  const loadClientData = async () => {
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

    try {
      const version = await getLatestItineraryVersion(salesClient.id);
      setLatestVersion(version);

      if (version && version.itinerary_data && version.itinerary_data.days) {
        setDayPlans(version.itinerary_data.days);
        setItinerary({
          id: version.id,
          clientId: salesClient.id,
          days: version.itinerary_data.days,
          totalCost: version.total_cost,
          status: 'draft'
        });
      }
    } catch (error) {
      console.error('Error loading latest itinerary version:', error);
    }
  };

  const handleClientNext = async (clientData: Client) => {
    try {
      await updateSalesClient(salesClient.id, {
        name: clientData.name,
        email: clientData.email,
        country_code: clientData.countryCode,
        whatsapp: clientData.whatsapp,
        travel_date: clientData.startDate,
        number_of_days: clientData.numberOfDays,
        number_of_adults: clientData.adults,
        number_of_children: clientData.children,
        transportation_mode: clientData.transportationMode as 'Flight' | 'Train' | 'Bus'
      });

      setClient(clientData);
      alert('Client details updated successfully!');
      loadClientData();
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
    setShowItineraryEdit(true);
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
    setShowChangeModal(true);
  };

  const handleFixedItineraryNext = (itineraryData: Itinerary) => {
    setItinerary(itineraryData);
    setShowChangeModal(true);
  };

  const handleSaveNewVersion = async () => {
    if (!changeDescription.trim()) {
      alert('Please describe what changed in this version.');
      return;
    }

    if (!itinerary || !client) {
      alert('Missing itinerary or client data.');
      return;
    }

    try {
      const userId = authState.user?.id;
      if (!userId) {
        throw new Error('User must be authenticated');
      }

      const newVersion = await createItineraryVersion(
        salesClient.id,
        { days: itinerary.days },
        itinerary.totalCost,
        changeDescription,
        salesClient.current_follow_up_status,
        userId
      );

      if (newVersion) {
        await updateSalesClient(salesClient.id, {
          itinerary_data: { days: itinerary.days },
          total_cost: itinerary.totalCost
        });

        alert(`New itinerary version ${newVersion.version_number} created successfully!`);
        setShowChangeModal(false);
        setChangeDescription('');
        onBack();
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      alert('Failed to create new version. Please try again.');
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      onBack();
    } else if (currentStep === 2 && showItineraryEdit) {
      setShowItineraryEdit(false);
      setCurrentStep(1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    if (!showItineraryEdit) {
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

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Client Details</h2>
            {client && <ClientDetails initialData={client} onNext={handleClientNext} />}
          </div>

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
              </div>
            </div>
          )}
        </div>
      );
    }

    switch (currentStep) {
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
              initialDayPlans={dayPlans}
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

      default:
        return null;
    }
  };

  return (
    <Layout title="Edit Client & Itinerary" subtitle={salesClient.name}>
      {renderStep()}

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
