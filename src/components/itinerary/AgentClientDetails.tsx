import React, { useState } from 'react';
import { Client, Transportation } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, MapPin, Clock } from 'lucide-react';
import { generateUUID } from '../../utils/uuid';

interface AgentClientDetailsProps {
  onNext: (client: Client) => void;
}

const AgentClientDetails: React.FC<AgentClientDetailsProps> = ({ onNext }) => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const { transportations } = state;
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    isFlexible: false,
    flexibleMonth: '',
    adults: 2,
    children: 0,
    numberOfDays: 7,
    transportationMode: ''
  });

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
    return 7;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const updatedData = { ...formData, [field]: value };
    if (updatedData.startDate && updatedData.endDate) {
      updatedData.numberOfDays = calculateDays(updatedData.startDate, updatedData.endDate);
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const client: Client = {
      id: generateUUID(),
      name: formData.name,
      whatsapp: '', // Agent doesn't collect contact details
      countryCode: '', // Agent doesn't collect contact details
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
      transportationMode: formData.transportationMode,
      createdAt: new Date().toISOString(),
      createdBy: authState.user?.id
    };

    onNext(client);
  };

  const isFormValid = () => {
    const basicFields = formData.name && formData.transportationMode;
    const dateFields = formData.isFlexible 
      ? formData.flexibleMonth 
      : (formData.startDate && formData.endDate);
    return basicFields && dateFields;
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Trip Details</h2>
              <p className="text-teal-100 mt-1 text-sm md:text-base">Step 1 of 4 - Basic Information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6">
          {/* Client Information */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Trip Information
            </h3>
            
            <div>
              <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                Trip Name / Client Reference *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                placeholder="Enter trip name or client reference"
                required
              />
            </div>
          </div>

          {/* Travel Dates */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Travel Dates
            </h3>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="flexible"
                checked={formData.isFlexible}
                onChange={(e) => setFormData({ ...formData, isFlexible: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
              <label htmlFor="flexible" className="text-sm md:text-base font-medium text-slate-700">
                Flexible dates (month only)
              </label>
            </div>

            {formData.isFlexible ? (
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Preferred Month
                </label>
                <select
                  value={formData.flexibleMonth}
                  onChange={(e) => setFormData({ ...formData, flexibleMonth: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                  required={formData.isFlexible}
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
                  <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    required={!formData.isFlexible}
                  />
                </div>
                <div>
                  <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    required={!formData.isFlexible}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Passengers */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Number of Passengers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Adults
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Children
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                />
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-blue-600" />
              Trip Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Number of Days
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: parseInt(e.target.value) || 1 })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    disabled={!formData.isFlexible && formData.startDate && formData.endDate}
                  />
                  <Clock className="h-5 w-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                </div>
                {!formData.isFlexible && formData.startDate && formData.endDate && (
                  <p className="text-xs text-slate-500 mt-1">Auto-calculated from dates</p>
                )}
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Transportation Mode *
                </label>
                <select
                  value={formData.transportationMode}
                  onChange={(e) => setFormData({ ...formData, transportationMode: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                  required
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

          <div className="flex justify-end pt-4 md:pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={!isFormValid()}
              className="inline-flex items-center px-4 md:px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-sm md:text-base font-semibold rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              Next Step
              <MapPin className="ml-2 h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentClientDetails;