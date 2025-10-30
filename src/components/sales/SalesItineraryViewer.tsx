import React, { useState } from 'react';
import { ArrowLeft, Eye, Edit2, Save } from 'lucide-react';
import { SalesClient, updateSalesClient } from '../../lib/salesHelpers';
import Layout from '../Layout';

interface SalesItineraryViewerProps {
  client: SalesClient;
  mode: 'view' | 'edit';
  onBack: () => void;
}

const SalesItineraryViewer: React.FC<SalesItineraryViewerProps> = ({ client, mode: initialMode, onBack }) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [saving, setSaving] = useState(false);

  const itinerary = client.itinerary_data;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSalesClient(client.id, {
        itinerary_data: itinerary
      });
      alert('Itinerary saved successfully!');
      onBack();
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout
      title={mode === 'view' ? 'View Itinerary' : 'Edit Itinerary'}
      subtitle={client.name}
    >
      {/* Header Actions */}
      <div className="mb-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>

        <div className="flex items-center space-x-3">
          {mode === 'view' ? (
            <button
              onClick={() => setMode('edit')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Itinerary
            </button>
          ) : (
            <>
              <button
                onClick={() => setMode('view')}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                disabled={saving}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Mode
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Client Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="font-medium text-slate-900">{client.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Contact</p>
            <p className="font-medium text-slate-900">{client.country_code} {client.whatsapp}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Travel Date</p>
            <p className="font-medium text-slate-900">{new Date(client.travel_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Duration</p>
            <p className="font-medium text-slate-900">{client.number_of_days} days</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Passengers</p>
            <p className="font-medium text-slate-900">{client.number_of_adults} Adults, {client.number_of_children} Children</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Transportation</p>
            <p className="font-medium text-slate-900">{client.transportation_mode}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Cost</p>
            <p className="font-medium text-slate-900">₹{client.total_cost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="font-medium text-slate-900">{client.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Itinerary Details */}
      {itinerary && itinerary.days && Array.isArray(itinerary.days) ? (
        <div className="space-y-4">
          {itinerary.days.map((day: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Day {day.day || index + 1}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {day.hotel && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">🏨 Hotel</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.hotel === 'string' ? day.hotel : day.hotel.name}
                    </p>
                  </div>
                )}

                {day.sightseeing && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">📸 Sightseeing</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.sightseeing === 'string' ? day.sightseeing : day.sightseeing.name}
                    </p>
                  </div>
                )}

                {day.activity && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">🎯 Activity</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.activity === 'string' ? day.activity : day.activity.name}
                    </p>
                  </div>
                )}

                {day.entryTicket && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">🎫 Entry Ticket</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.entryTicket === 'string' ? day.entryTicket : day.entryTicket.name}
                    </p>
                  </div>
                )}

                {day.meal && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">🍽️ Meal</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.meal === 'string' ? day.meal : day.meal.name}
                    </p>
                  </div>
                )}

                {day.transportation && (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-500 mb-2">🚗 Transportation</p>
                    <p className="font-medium text-slate-900">
                      {typeof day.transportation === 'string' ? day.transportation : day.transportation.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No itinerary data available</p>
        </div>
      )}

      {/* Note for Edit Mode */}
      {mode === 'edit' && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            ⚠️ Full edit functionality with drag-and-drop and item selection is coming soon.
            For now, you can view the itinerary details. To make major changes, please create a new itinerary.
          </p>
        </div>
      )}
    </Layout>
  );
};

export default SalesItineraryViewer;
