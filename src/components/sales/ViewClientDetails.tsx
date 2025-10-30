import React from 'react';
import { ArrowLeft, Users, Phone, Mail, Calendar, Clock, Car, DollarSign } from 'lucide-react';
import { SalesClient } from '../../lib/salesHelpers';
import Layout from '../Layout';

interface ViewClientDetailsProps {
  client: SalesClient;
  onBack: () => void;
}

const ViewClientDetails: React.FC<ViewClientDetailsProps> = ({ client, onBack }) => {
  return (
    <Layout title="Client Details" subtitle={client.name}>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Client Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Personal Details
            </h3>

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="text-lg font-medium text-slate-900">{client.name}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">WhatsApp</p>
                <p className="text-lg font-medium text-slate-900">
                  {client.country_code} {client.whatsapp}
                </p>
              </div>
            </div>

            {client.email && (
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="text-lg font-medium text-slate-900">{client.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Travel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Travel Details
            </h3>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Travel Date</p>
                <p className="text-lg font-medium text-slate-900">
                  {new Date(client.travel_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Duration</p>
                <p className="text-lg font-medium text-slate-900">{client.number_of_days} Days</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-teal-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Passengers</p>
                <p className="text-lg font-medium text-slate-900">
                  {client.number_of_adults} {client.number_of_adults === 1 ? 'Adult' : 'Adults'}
                  {client.number_of_children > 0 &&
                    `, ${client.number_of_children} ${client.number_of_children === 1 ? 'Child' : 'Children'}`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Car className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Transportation</p>
                <p className="text-lg font-medium text-slate-900">{client.transportation_mode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial & Status Information */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Total Cost</p>
                <p className="text-2xl font-bold text-slate-900">₹{client.total_cost.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Current Status</p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {client.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Booking Progress</p>
              <div className="flex items-center">
                <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${client.booking_completion_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {client.booking_completion_percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Information */}
        {client.next_follow_up_date && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Next Follow-up</h3>
            <div className="flex items-center space-x-4 text-slate-600">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(client.next_follow_up_date).toLocaleDateString()}
              </span>
              {client.next_follow_up_time && (
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {client.next_follow_up_time}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewClientDetails;
