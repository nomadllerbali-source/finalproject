import React from 'react';
import { Client } from '../../types';
import { Calendar, Users, Phone, MapPin, Clock, Edit } from 'lucide-react';

interface ViewOnlyClientDetailsProps {
  client: Client;
  onEdit?: () => void;
  onContinue: () => void;
}

const ViewOnlyClientDetails: React.FC<ViewOnlyClientDetailsProps> = ({ client, onEdit, onContinue }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Client Details</h2>
            <p className="text-blue-100 mt-1">Review client information before editing itinerary</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h3>

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Client Name
              </label>
              <div className="text-base font-semibold text-slate-900">{client.name}</div>
            </div>

            {client.email && (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Email
                </label>
                <div className="text-base text-slate-900">{client.email}</div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                WhatsApp Number
              </label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <div className="text-base text-slate-900">
                  {client.countryCode} {client.whatsapp}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Travel Dates
          </h3>

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            {client.travelDates.isFlexible ? (
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Flexible Dates
                </label>
                <div className="text-base text-slate-900">
                  {client.travelDates.flexibleMonth} (Month only)
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Start Date
                  </label>
                  <div className="text-base text-slate-900">
                    {formatDate(client.travelDates.startDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    End Date
                  </label>
                  <div className="text-base text-slate-900">
                    {formatDate(client.travelDates.endDate)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Number of Passengers
          </h3>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Adults
                </label>
                <div className="text-base font-semibold text-slate-900">
                  {client.numberOfPax.adults}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Children
                </label>
                <div className="text-base font-semibold text-slate-900">
                  {client.numberOfPax.children}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Trip Details
          </h3>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-slate-400" />
                  Number of Days
                </label>
                <div className="text-base font-semibold text-slate-900">
                  {client.numberOfDays} {client.numberOfDays === 1 ? 'day' : 'days'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Transportation Mode
                </label>
                <div className="text-base font-semibold text-slate-900">
                  {client.transportationMode}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center px-6 py-3 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client Details
            </button>
          )}

          <button
            onClick={onContinue}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 ml-auto"
          >
            Continue to Day Planning
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlyClientDetails;
