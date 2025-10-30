import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, History } from 'lucide-react';
import { SalesClient, getLatestItineraryVersion, createItineraryVersion, updateSalesClient, ItineraryVersion } from '../../lib/salesHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { Client, DayPlan, Itinerary } from '../../types';
import DayPlanning from '../itinerary/DayPlanning';
import SalesReviewCosting from '../itinerary/SalesReviewCosting';
import Layout from '../Layout';

interface EditItineraryProps {
  client: SalesClient;
  onBack: () => void;
  onSuccess?: () => void;
}

type EditStep = 'dayPlanning' | 'review';

const EditItinerary: React.FC<EditItineraryProps> = ({ client: salesClient, onBack, onSuccess }) => {
  const { state: authState } = useAuth();
  const [currentStep, setCurrentStep] = useState<EditStep>('dayPlanning');
  const [latestVersion, setLatestVersion] = useState<ItineraryVersion | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clientData: Client = {
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
  };

  useEffect(() => {
    loadLatestVersion();
  }, [salesClient.id]);

  const loadLatestVersion = async () => {
    try {
      setIsLoading(true);
      const version = await getLatestItineraryVersion(salesClient.id);
      setLatestVersion(version);

      if (version && version.itinerary_data && version.itinerary_data.days) {
        const loadedDayPlans = version.itinerary_data.days;

        if (loadedDayPlans.length < salesClient.number_of_days) {
          const additionalDays: DayPlan[] = [];
          for (let i = loadedDayPlans.length + 1; i <= salesClient.number_of_days; i++) {
            additionalDays.push({
              day: i,
              sightseeing: [],
              hotel: null,
              activities: [],
              entryTickets: [],
              meals: []
            });
          }
          setDayPlans([...loadedDayPlans, ...additionalDays]);
        } else if (loadedDayPlans.length > salesClient.number_of_days) {
          setDayPlans(loadedDayPlans.slice(0, salesClient.number_of_days));
        } else {
          setDayPlans(loadedDayPlans);
        }
      } else {
        const newDayPlans: DayPlan[] = [];
        for (let i = 1; i <= salesClient.number_of_days; i++) {
          newDayPlans.push({
            day: i,
            sightseeing: [],
            hotel: null,
            activities: [],
            entryTickets: [],
            meals: []
          });
        }
        setDayPlans(newDayPlans);
      }
    } catch (error) {
      console.error('Error loading latest itinerary version:', error);
      alert('Failed to load itinerary data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayPlanningNext = (plans: DayPlan[]) => {
    setDayPlans(plans);
    setCurrentStep('review');
  };

  const handleDayPlanningBack = () => {
    onBack();
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

        if (onSuccess) {
          onSuccess();
        } else {
          onBack();
        }
      }
    } catch (error) {
      console.error('Error creating new version:', error);
      alert('Failed to create new version. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Layout title="Edit Itinerary" subtitle="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading itinerary data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (currentStep === 'dayPlanning') {
    return (
      <div>
        <div className="mb-4 px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client
          </button>
        </div>

        {latestVersion && (
          <div className="mb-4 mx-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900">Editing Itinerary Version {latestVersion.version_number}</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Last updated: {new Date(latestVersion.created_at).toLocaleDateString()} •
                  Current cost: ₹{latestVersion.total_cost.toLocaleString()}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Previous change: {latestVersion.change_description}
                </p>
              </div>
            </div>
          </div>
        )}

        <DayPlanning
          client={clientData}
          initialDayPlans={dayPlans}
          onNext={handleDayPlanningNext}
          onBack={handleDayPlanningBack}
          isAgent={false}
        />
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div>
        <div className="mb-4 px-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client
          </button>
        </div>

        <SalesReviewCosting
          client={clientData}
          dayPlans={dayPlans}
          onNext={handleReviewNext}
          onBack={handleReviewBack}
        />

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
      </div>
    );
  }

  return null;
};

export default EditItinerary;
