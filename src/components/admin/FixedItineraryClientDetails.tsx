import React, { useState } from 'react';
import { Client } from '../../types';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, MapPin, Clock, FileText, X } from 'lucide-react';

interface FixedItineraryClientDetailsProps {
  onNext: (client: Client) => void;
  onClose: () => void;
}

const FixedItineraryClientDetails: React.FC<FixedItineraryClientDetailsProps> = ({ onNext, onClose }) => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const { transportations } = state;
  const [formData, setFormData] = useState({
    name: '',
    numberOfDays: 5,
    transportationMode: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (formData.numberOfDays < 1 || formData.numberOfDays > 30) {
      newErrors.numberOfDays = 'Number of days must be between 1 and 30';
    }

    if (!formData.transportationMode) {
      newErrors.transportationMode = 'Transportation mode is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create a simplified client object for template creation
    const templateClient: Client = {
      id: `template-${Date.now()}`,
      name: formData.name,
      whatsapp: '', // Not needed for templates
      countryCode: '', // Not needed for templates
      travelDates: {
        startDate: '', // Not needed for templates
        endDate: '', // Not needed for templates
        isFlexible: false,
        flexibleMonth: ''
      },
      numberOfPax: {
        adults: 2, // Default for template
        children: 0
      },
      numberOfDays: formData.numberOfDays,
      transportationMode: formData.transportationMode,
      createdAt: new Date().toISOString(),
      createdBy: authState.user?.id
    };

    onNext(templateClient);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Template Information</h2>
            <p className="text-slate-600 mt-1">Step 1 of 4 - Define your itinerary template</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Name */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Template Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
              }`}
              placeholder="e.g., Bali Highlights - 5 Days, Cultural Experience Package"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-slate-500 text-sm mt-1">
              This will be the display name for your fixed itinerary template
            </p>
          </div>
        </div>

        {/* Trip Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Trip Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Number of Days *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.numberOfDays}
                  onChange={(e) => {
                    setFormData({ ...formData, numberOfDays: parseInt(e.target.value) || 1 });
                    if (errors.numberOfDays) setErrors({ ...errors, numberOfDays: '' });
                  }}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.numberOfDays ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                <Clock className="h-5 w-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {errors.numberOfDays && (
                <p className="text-red-600 text-sm mt-1">{errors.numberOfDays}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Transportation Mode *
              </label>
              <select
                value={formData.transportationMode}
                onChange={(e) => {
                  setFormData({ ...formData, transportationMode: e.target.value });
                  if (errors.transportationMode) setErrors({ ...errors, transportationMode: '' });
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.transportationMode ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              >
                <option value="">Select transportation</option>
                {transportations.map(transport => (
                  <option key={transport.id} value={transport.vehicleName}>
                    {transport.vehicleName} ({transport.type.replace('-', ' ')})
                  </option>
                ))}
              </select>
              {errors.transportationMode && (
                <p className="text-red-600 text-sm mt-1">{errors.transportationMode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Template Info */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">Creating Template</h4>
              <p className="text-blue-700 text-sm mt-1">
                You're creating a reusable itinerary template. In the next steps, you'll plan the day-by-day activities, 
                set inclusions/exclusions, and define the base cost. This template can be used for similar client requests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
          >
            Next: Plan Days
            <MapPin className="ml-2 h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default FixedItineraryClientDetails;