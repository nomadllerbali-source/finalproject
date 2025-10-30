import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit3, Save } from 'lucide-react';
import { SalesClient, updateSalesClient, getLatestItineraryVersion, createItineraryVersion, ItineraryVersion } from '../../lib/salesHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { Client, DayPlan, Itinerary } from '../../types';
import DayPlanning from '../itinerary/DayPlanning';
import SalesReviewCosting from '../itinerary/SalesReviewCosting';
import Layout from '../Layout';

interface EditClientProps {
  client: SalesClient;
  onBack: () => void;
}

const EditClient: React.FC<EditClientProps> = ({ client: salesClient, onBack }) => {
  const { state: authState } = useAuth();
  const [editingBasicDetails, setEditingBasicDetails] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'dayPlanning' | 'review'>('details');

  // Client data
  const [clientData, setClientData] = useState({
    name: salesClient.name,
    email: salesClient.email || '',
    country_code: salesClient.country_code,
    whatsapp: salesClient.whatsapp,
    travel_date: salesClient.travel_date,
    number_of_days: salesClient.number_of_days,
    number_of_adults: salesClient.number_of_adults,
    number_of_children: salesClient.number_of_children,
    transportation_mode: salesClient.transportation_mode
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

  const handleSaveBasicDetails = async () => {
    try {
      await updateSalesClient(salesClient.id, {
        name: clientData.name,
        email: clientData.email || undefined,
        country_code: clientData.country_code,
        whatsapp: clientData.whatsapp,
        travel_date: clientData.travel_date,
        number_of_days: clientData.number_of_days,
        number_of_adults: clientData.number_of_adults,
        number_of_children: clientData.number_of_children,
        transportation_mode: clientData.transportation_mode
      });

      // If number of days changed, adjust day plans
      if (clientData.number_of_days !== originalDays) {
        adjustDayPlans(clientData.number_of_days);
      }

      alert('Client details updated successfully!');
      setEditingBasicDetails(false);
      setOriginalDays(clientData.number_of_days);
      onBack();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Failed to update client details. Please try again.');
    }
  };

  const adjustDayPlans = (newNumberOfDays: number) => {
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
      setDayPlans([...dayPlans, ...newDays]);
    } else if (newNumberOfDays < currentDays) {
      // Remove extra days
      setDayPlans(dayPlans.slice(0, newNumberOfDays));
    }
  };

  const handleEditItinerary = () => {
    if (!latestVersion) {
      alert('No itinerary found to edit.');
      return;
    }

    // Ensure day plans match current number of days
    adjustDayPlans(clientData.number_of_days);
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

  const countryCodes = [
    { code: '+1', country: 'US/CA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'IN' },
    { code: '+61', country: 'AU' },
    { code: '+49', country: 'DE' },
    { code: '+33', country: 'FR' },
    { code: '+81', country: 'JP' },
    { code: '+86', country: 'CN' },
    { code: '+65', country: 'SG' },
    { code: '+60', country: 'MY' },
    { code: '+62', country: 'ID' },
  ];

  // Render day planning step
  if (editingItinerary && currentStep === 'dayPlanning') {
    const client: Client = {
      id: salesClient.id,
      name: clientData.name,
      email: clientData.email || undefined,
      whatsapp: clientData.whatsapp,
      countryCode: clientData.country_code,
      travelDates: {
        startDate: clientData.travel_date,
        endDate: clientData.travel_date,
        isFlexible: false,
        flexibleMonth: ''
      },
      numberOfPax: {
        adults: clientData.number_of_adults,
        children: clientData.number_of_children
      },
      numberOfDays: clientData.number_of_days,
      transportationMode: clientData.transportation_mode,
      createdAt: salesClient.created_at,
      createdBy: salesClient.sales_person_id
    };

    return (
      <DayPlanning
        client={client}
        initialDayPlans={dayPlans}
        onNext={handleDayPlanningNext}
        onBack={handleDayPlanningBack}
        isAgent={false}
      />
    );
  }

  // Render review step
  if (editingItinerary && currentStep === 'review') {
    const client: Client = {
      id: salesClient.id,
      name: clientData.name,
      email: clientData.email || undefined,
      whatsapp: clientData.whatsapp,
      countryCode: clientData.country_code,
      travelDates: {
        startDate: clientData.travel_date,
        endDate: clientData.travel_date,
        isFlexible: false,
        flexibleMonth: ''
      },
      numberOfPax: {
        adults: clientData.number_of_adults,
        children: clientData.number_of_children
      },
      numberOfDays: clientData.number_of_days,
      transportationMode: clientData.transportation_mode,
      createdAt: salesClient.created_at,
      createdBy: salesClient.sales_person_id
    };

    return (
      <SalesReviewCosting
        client={client}
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

      {/* Basic Client Details */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Client Basic Details</h2>
          {!editingBasicDetails ? (
            <button
              onClick={() => setEditingBasicDetails(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Details
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingBasicDetails(false);
                  setClientData({
                    name: salesClient.name,
                    email: salesClient.email || '',
                    country_code: salesClient.country_code,
                    whatsapp: salesClient.whatsapp,
                    travel_date: salesClient.travel_date,
                    number_of_days: salesClient.number_of_days,
                    number_of_adults: salesClient.number_of_adults,
                    number_of_children: salesClient.number_of_children,
                    transportation_mode: salesClient.transportation_mode
                  });
                }}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBasicDetails}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
            <input
              type="text"
              value={clientData.name}
              onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Country Code</label>
            <select
              value={clientData.country_code}
              onChange={(e) => setClientData({ ...clientData, country_code: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            >
              {countryCodes.map(({ code, country }) => (
                <option key={code} value={code}>
                  {code} ({country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">WhatsApp Number</label>
            <input
              type="tel"
              value={clientData.whatsapp}
              onChange={(e) => setClientData({ ...clientData, whatsapp: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Travel Date</label>
            <input
              type="date"
              value={clientData.travel_date}
              onChange={(e) => setClientData({ ...clientData, travel_date: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Days</label>
            <input
              type="number"
              min="1"
              value={clientData.number_of_days}
              onChange={(e) => setClientData({ ...clientData, number_of_days: parseInt(e.target.value) || 1 })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Adults</label>
            <input
              type="number"
              min="1"
              value={clientData.number_of_adults}
              onChange={(e) => setClientData({ ...clientData, number_of_adults: parseInt(e.target.value) || 1 })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Children</label>
            <input
              type="number"
              min="0"
              value={clientData.number_of_children}
              onChange={(e) => setClientData({ ...clientData, number_of_children: parseInt(e.target.value) || 0 })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Transportation Mode</label>
            <input
              type="text"
              value={clientData.transportation_mode}
              onChange={(e) => setClientData({ ...clientData, transportation_mode: e.target.value })}
              disabled={!editingBasicDetails}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-600"
            />
          </div>
        </div>
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
