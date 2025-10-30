import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Edit2, Save, Trash2, X } from 'lucide-react';
import { SalesClient, updateSalesClient } from '../../lib/salesHelpers';
import { useData } from '../../contexts/DataContext';
import Layout from '../Layout';

interface SalesItineraryViewerProps {
  client: SalesClient;
  mode: 'view' | 'edit';
  onBack: () => void;
}

const SalesItineraryViewer: React.FC<SalesItineraryViewerProps> = ({ client: initialClient, mode: initialMode, onBack }) => {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [saving, setSaving] = useState(false);
  const [editedClient, setEditedClient] = useState(initialClient);
  const [editedItinerary, setEditedItinerary] = useState(initialClient.itinerary_data || { days: [] });
  const { hotels, sightseeings, activities, entryTickets, meals, transportation } = useData();

  useEffect(() => {
    setEditedClient(initialClient);
    setEditedItinerary(initialClient.itinerary_data || { days: [] });
  }, [initialClient]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSalesClient(editedClient.id, {
        name: editedClient.name,
        email: editedClient.email,
        country_code: editedClient.country_code,
        whatsapp: editedClient.whatsapp,
        travel_date: editedClient.travel_date,
        number_of_days: editedClient.number_of_days,
        number_of_adults: editedClient.number_of_adults,
        number_of_children: editedClient.number_of_children,
        transportation_mode: editedClient.transportation_mode,
        itinerary_data: editedItinerary
      });
      alert('Changes saved successfully!');
      onBack();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateClientField = (field: string, value: any) => {
    setEditedClient({ ...editedClient, [field]: value });
  };

  const updateDayField = (dayIndex: number, field: string, value: any) => {
    const newDays = [...editedItinerary.days];
    newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
    setEditedItinerary({ ...editedItinerary, days: newDays });
  };

  const removeDayItem = (dayIndex: number, field: string) => {
    const newDays = [...editedItinerary.days];
    const updatedDay = { ...newDays[dayIndex] };
    delete updatedDay[field];
    newDays[dayIndex] = updatedDay;
    setEditedItinerary({ ...editedItinerary, days: newDays });
  };

  return (
    <Layout
      title={mode === 'view' ? 'View Itinerary' : 'Edit Itinerary'}
      subtitle={editedClient.name}
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
              Edit Mode
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setMode('view');
                  setEditedClient(initialClient);
                  setEditedItinerary(initialClient.itinerary_data || { days: [] });
                }}
                className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                disabled={saving}
              >
                <Eye className="h-4 w-4 mr-2" />
                Cancel
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

        {mode === 'edit' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input
                type="text"
                value={editedClient.name}
                onChange={(e) => updateClientField('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editedClient.email || ''}
                onChange={(e) => updateClientField('email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country Code</label>
              <input
                type="text"
                value={editedClient.country_code}
                onChange={(e) => updateClientField('country_code', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={editedClient.whatsapp}
                onChange={(e) => updateClientField('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Travel Date</label>
              <input
                type="date"
                value={editedClient.travel_date}
                onChange={(e) => updateClientField('travel_date', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Days</label>
              <input
                type="number"
                value={editedClient.number_of_days}
                onChange={(e) => updateClientField('number_of_days', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Adults</label>
              <input
                type="number"
                value={editedClient.number_of_adults}
                onChange={(e) => updateClientField('number_of_adults', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Number of Children</label>
              <input
                type="number"
                value={editedClient.number_of_children}
                onChange={(e) => updateClientField('number_of_children', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Transportation Mode</label>
              <select
                value={editedClient.transportation_mode}
                onChange={(e) => updateClientField('transportation_mode', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Bus">Bus</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-medium text-slate-900">{editedClient.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Contact</p>
              <p className="font-medium text-slate-900">{editedClient.country_code} {editedClient.whatsapp}</p>
            </div>
            {editedClient.email && (
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{editedClient.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500">Travel Date</p>
              <p className="font-medium text-slate-900">{new Date(editedClient.travel_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Duration</p>
              <p className="font-medium text-slate-900">{editedClient.number_of_days} days</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Passengers</p>
              <p className="font-medium text-slate-900">{editedClient.number_of_adults} Adults, {editedClient.number_of_children} Children</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Transportation</p>
              <p className="font-medium text-slate-900">{editedClient.transportation_mode}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Cost</p>
              <p className="font-medium text-slate-900">₹{editedClient.total_cost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className="font-medium text-slate-900">{editedClient.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Itinerary Details */}
      {editedItinerary && editedItinerary.days && Array.isArray(editedItinerary.days) ? (
        <div className="space-y-4">
          {editedItinerary.days.map((day: any, dayIndex: number) => (
            <div key={dayIndex} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Day {day.day || dayIndex + 1}
              </h3>

              {mode === 'edit' ? (
                <div className="space-y-4">
                  {/* Hotel */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">🏨 Hotel</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.hotel ? (typeof day.hotel === 'string' ? day.hotel : day.hotel.id) : ''}
                        onChange={(e) => {
                          const hotel = hotels.find(h => h.id === e.target.value);
                          updateDayField(dayIndex, 'hotel', hotel);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Hotel</option>
                        {hotels.map(hotel => (
                          <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                        ))}
                      </select>
                      {day.hotel && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'hotel')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sightseeing */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">📸 Sightseeing</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.sightseeing ? (typeof day.sightseeing === 'string' ? day.sightseeing : day.sightseeing.id) : ''}
                        onChange={(e) => {
                          const sightseeing = sightseeings.find(s => s.id === e.target.value);
                          updateDayField(dayIndex, 'sightseeing', sightseeing);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Sightseeing</option>
                        {sightseeings.map(sightseeing => (
                          <option key={sightseeing.id} value={sightseeing.id}>{sightseeing.name}</option>
                        ))}
                      </select>
                      {day.sightseeing && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'sightseeing')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Activity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">🎯 Activity</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.activity ? (typeof day.activity === 'string' ? day.activity : day.activity.id) : ''}
                        onChange={(e) => {
                          const activity = activities.find(a => a.id === e.target.value);
                          updateDayField(dayIndex, 'activity', activity);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Activity</option>
                        {activities.map(activity => (
                          <option key={activity.id} value={activity.id}>{activity.name}</option>
                        ))}
                      </select>
                      {day.activity && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'activity')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Entry Ticket */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">🎫 Entry Ticket</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.entryTicket ? (typeof day.entryTicket === 'string' ? day.entryTicket : day.entryTicket.id) : ''}
                        onChange={(e) => {
                          const ticket = entryTickets.find(t => t.id === e.target.value);
                          updateDayField(dayIndex, 'entryTicket', ticket);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Entry Ticket</option>
                        {entryTickets.map(ticket => (
                          <option key={ticket.id} value={ticket.id}>{ticket.name}</option>
                        ))}
                      </select>
                      {day.entryTicket && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'entryTicket')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Meal */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">🍽️ Meal</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.meal ? (typeof day.meal === 'string' ? day.meal : day.meal.id) : ''}
                        onChange={(e) => {
                          const meal = meals.find(m => m.id === e.target.value);
                          updateDayField(dayIndex, 'meal', meal);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Meal</option>
                        {meals.map(meal => (
                          <option key={meal.id} value={meal.id}>{meal.name}</option>
                        ))}
                      </select>
                      {day.meal && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'meal')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Transportation */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">🚗 Transportation</label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={day.transportation ? (typeof day.transportation === 'string' ? day.transportation : day.transportation.id) : ''}
                        onChange={(e) => {
                          const trans = transportation.find(t => t.id === e.target.value);
                          updateDayField(dayIndex, 'transportation', trans);
                        }}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Transportation</option>
                        {transportation.map(trans => (
                          <option key={trans.id} value={trans.id}>{trans.name}</option>
                        ))}
                      </select>
                      {day.transportation && (
                        <button
                          onClick={() => removeDayItem(dayIndex, 'transportation')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No itinerary data available</p>
        </div>
      )}
    </Layout>
  );
};

export default SalesItineraryViewer;
