import React, { useState } from 'react';
import { Client } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateItineraryCost } from '../../utils/calculations';
import { X, Save, Calendar, Users, MapPin, Clock, Edit3 } from 'lucide-react';
import ItineraryEditModal from './ItineraryEditModal';

interface ClientEditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({ client, onClose, onSave }) => {
  const { state, updateItinerary, getLatestItinerary } = useData();
  const { state: authState } = useAuth();
  const { transportations, hotels, sightseeings, activities, entryTickets, meals } = state;
  const [showItineraryEdit, setShowItineraryEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    whatsapp: client.whatsapp,
    countryCode: client.countryCode,
    startDate: client.travelDates.startDate,
    endDate: client.travelDates.endDate,
    isFlexible: client.travelDates.isFlexible,
    flexibleMonth: client.travelDates.flexibleMonth,
    adults: client.numberOfPax.adults,
    children: client.numberOfPax.children,
    numberOfDays: client.numberOfDays,
    transportationMode: client.transportationMode
  });

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

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const calculateDays = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return formData.numberOfDays;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedData = { ...formData, [field]: value };
    if (updatedData.startDate && updatedData.endDate) {
      updatedData.numberOfDays = calculateDays(updatedData.startDate, updatedData.endDate);
    }
    setFormData(updatedData);
  };

  const handleSave = () => {
    const updatedClient: Client = {
      ...client,
      name: formData.name,
      whatsapp: formData.whatsapp,
      countryCode: formData.countryCode,
      travelDates: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        isFlexible: formData.isFlexible,
        flexibleMonth: formData.flexibleMonth
      },
      numberOfPax: {
        adults: formData.adults,
        children: formData.children
      },
      numberOfDays: formData.numberOfDays,
      transportationMode: formData.transportationMode
    };

    // If client details changed and there's an existing itinerary, update it
    const latestItinerary = getLatestItinerary(client.id);
    if (latestItinerary) {
      // Recalculate costs with updated client details
      const updatedBaseCost = calculateItineraryCost(
        updatedClient,
        latestItinerary.dayPlans,
        hotels,
        sightseeings,
        activities,
        entryTickets,
        meals,
        transportations
      );
      
      const updatedItinerary = {
        ...latestItinerary,
        client: updatedClient,
        totalBaseCost: updatedBaseCost,
        finalPrice: updatedBaseCost + latestItinerary.profitMargin
      };
      
      updateItinerary(
        updatedItinerary,
        'general_edit',
        'Client details updated - costs recalculated'
      );
    }

    onSave(updatedClient);
  };

  const handleItinerarySave = (updatedClient: Client) => {
    const clientToSave: Client = {
      ...client,
      name: formData.name,
      whatsapp: formData.whatsapp,
      countryCode: formData.countryCode,
      travelDates: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        isFlexible: formData.isFlexible,
        flexibleMonth: formData.flexibleMonth
      },
      numberOfPax: {
        adults: formData.adults,
        children: formData.children
      },
      numberOfDays: formData.numberOfDays,
      transportationMode: formData.transportationMode
    };

    // Recalculate costs for the updated client
    const latestItinerary = getLatestItinerary(client.id);
    if (latestItinerary) {
      const updatedBaseCost = calculateItineraryCost(
        clientToSave,
        latestItinerary.dayPlans,
        hotels,
        sightseeings,
        activities,
        entryTickets,
        meals,
        transportations
      );
      
      const updatedItinerary = {
        ...latestItinerary,
        client: clientToSave,
        totalBaseCost: updatedBaseCost,
        finalPrice: updatedBaseCost + latestItinerary.profitMargin
      };
      
      updateItinerary(
        updatedItinerary,
        'general_edit',
        'Client details updated via itinerary edit - costs recalculated'
      );
    }
    onSave(clientToSave);
  };

  if (showItineraryEdit) {
    return (
      <ItineraryEditModal
        client={client}
        onClose={() => setShowItineraryEdit(false)}
        onSave={(updatedClient) => {
          onSave(updatedClient);
          setShowItineraryEdit(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Edit Client Details</h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter client's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  WhatsApp Number *
                </label>
                <div className="flex space-x-3">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="w-auto p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {countryCodes.map(({ code, country }) => (
                      <option key={code} value={code}>
                        {code} ({country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Travel Dates */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Travel Dates
            </h4>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="flexible-edit"
                checked={formData.isFlexible}
                onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="flexible-edit" className="text-sm font-medium text-slate-700">
                Flexible dates (month only)
              </label>
            </div>

            {formData.isFlexible ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Preferred Month
                </label>
                <select
                  value={formData.flexibleMonth}
                  onChange={(e) => setFormData({ ...formData, flexibleMonth: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a month</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Number of Passengers
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-slate-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Trip Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Days
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: parseInt(e.target.value) || 1 })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!formData.isFlexible && formData.startDate && formData.endDate}
                  />
                  <Clock className="h-5 w-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {!formData.isFlexible && formData.startDate && formData.endDate && (
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated from dates</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Transportation Mode *
                </label>
                <select
                  value={formData.transportationMode}
                  onChange={(e) => setFormData({ ...formData, transportationMode: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select transportation</option>
                  {transportations.map(transport => (
                    <option key={transport.id} value={transport.vehicleName}>
                      {transport.vehicleName} ({transport.type.replace('-', ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => setShowItineraryEdit(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Itinerary
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Itinerary Edit Modal */}
        {showItineraryEdit && (
          <ItineraryEditModal
            client={client}
            onClose={() => setShowItineraryEdit(false)}
            onSave={(updatedClient) => {
              onSave(updatedClient);
              setShowItineraryEdit(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClientEditModal;