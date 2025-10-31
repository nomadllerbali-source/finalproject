import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FixedItinerary } from '../../types';
import { 
  FileText, Plus, Edit2, Trash2, Save, X, Search, Calendar, 
  Users, MapPin, DollarSign, Eye, Copy, Download, TrendingUp,
  Building2, Camera, Ticket, Utensils
} from 'lucide-react';
import Layout from '../Layout';
import FixedItineraryBuilder from './FixedItineraryBuilder';

const FixedItineraryManager: React.FC = () => {
  const { state, addFixedItinerary, updateFixedItineraryData, deleteFixedItineraryData } = useData();
  const { state: authState } = useAuth();
  const { fixedItineraries } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FixedItinerary>>({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<FixedItinerary | null>(null);

  const filteredItineraries = fixedItineraries.filter(itinerary =>
    itinerary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.transportationMode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFixedItinerary = async (fixedItinerary: FixedItinerary) => {
    await addFixedItinerary(fixedItinerary);
    setShowBuilderModal(false);
  };

  const handleEdit = (itinerary: FixedItinerary) => {
    setIsEditing(itinerary.id);
    setEditForm(itinerary);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      const updatedItinerary = {
        ...editForm,
        updatedAt: new Date().toISOString()
      } as FixedItinerary;

      await updateFixedItineraryData(updatedItinerary);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the fixed itinerary "${name}"?`)) {
      await deleteFixedItineraryData(id);
    }
  };

  const handleView = (itinerary: FixedItinerary) => {
    setSelectedItinerary(itinerary);
    setShowViewModal(true);
  };

  const copyItineraryDetails = (itinerary: FixedItinerary) => {
    const details = `${itinerary.name}\n\nDuration: ${itinerary.numberOfDays} days\nTransportation: ${itinerary.transportationMode}\nBase Cost: $${itinerary.baseCost}\n\nInclusions:\n${itinerary.inclusions}\n\nExclusions:\n${itinerary.exclusions}`;
    
    navigator.clipboard.writeText(details).then(() => {
      alert('✅ Itinerary details copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy details. Please try again.');
    });
  };

  const copyCompleteItinerary = (itinerary: FixedItinerary) => {
    let completeItinerary = `🌴 ${itinerary.name.toUpperCase()} 🌴\n\n`;
    completeItinerary += `📋 TEMPLATE DETAILS:\n`;
    completeItinerary += `• Template Name: ${itinerary.name}\n`;
    completeItinerary += `• Duration: ${itinerary.numberOfDays} days\n`;
    completeItinerary += `• Transportation: ${itinerary.transportationMode}\n`;
    completeItinerary += `• Base Cost: $${itinerary.baseCost}\n\n`;

    // Add day-by-day itinerary if available
    if (itinerary.dayPlans && itinerary.dayPlans.length > 0) {
      completeItinerary += `📅 DAY-BY-DAY ITINERARY:\n\n`;
      
      itinerary.dayPlans.forEach((dayPlan) => {
        const selectedSightseeing = state.sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
        const selectedActivities = dayPlan.activities.map(a => {
          const activity = state.activities.find(act => act.id === a.activityId);
          const option = activity?.options.find(opt => opt.id === a.optionId);
          return { activity, option };
        }).filter(item => item.activity && item.option);
        const selectedTickets = state.entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
        const selectedMeals = state.meals.filter(m => dayPlan.meals.includes(m.id));
        
        let hotelInfo = null;
        if (dayPlan.hotel) {
          const hotel = state.hotels.find(h => h.id === dayPlan.hotel!.hotelId);
          const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
          if (hotel && roomType) {
            hotelInfo = { hotel, roomType };
          }
        }
        
        completeItinerary += `🗓️ DAY ${dayPlan.day}:\n`;
        
        if (selectedSightseeing.length > 0) {
          completeItinerary += `📍 SIGHTSEEING:\n`;
          selectedSightseeing.forEach(sight => {
            completeItinerary += `   • ${sight.name}\n`;
            if (sight.description) {
              completeItinerary += `     ${sight.description}\n`;
            }
          });
        }
        
        if (hotelInfo) {
          completeItinerary += `🏨 ACCOMMODATION:\n`;
          completeItinerary += `   • ${hotelInfo.hotel.name} - ${hotelInfo.roomType.name}\n`;
          completeItinerary += `   • Location: ${hotelInfo.hotel.place}\n`;
          completeItinerary += `   • Category: ${hotelInfo.hotel.starCategory}\n`;
        }
        
        if (selectedActivities.length > 0) {
          completeItinerary += `🎯 ACTIVITIES:\n`;
          selectedActivities.forEach(item => {
            completeItinerary += `   • ${item.activity?.name} - ${item.option?.name}\n`;
            completeItinerary += `     Location: ${item.activity?.location}\n`;
          });
        }
        
        if (selectedTickets.length > 0) {
          completeItinerary += `🎫 ENTRY TICKETS:\n`;
          selectedTickets.forEach(ticket => {
            completeItinerary += `   • ${ticket.name} - $${ticket.cost} per person\n`;
          });
        }
        
        if (selectedMeals.length > 0) {
          completeItinerary += `🍽️ MEALS:\n`;
          selectedMeals.forEach(meal => {
            completeItinerary += `   • ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} at ${meal.place} - $${meal.cost} per person\n`;
          });
        }
        
        completeItinerary += `\n`;
      });
    }

    completeItinerary += `💰 PRICING:\n`;
    completeItinerary += `• Base Template Cost: $${itinerary.baseCost}\n`;
    completeItinerary += `• Transportation: ${itinerary.transportationMode}\n\n`;

    completeItinerary += `✅ INCLUSIONS:\n`;
    completeItinerary += `${itinerary.inclusions}\n\n`;

    completeItinerary += `❌ EXCLUSIONS:\n`;
    completeItinerary += `${itinerary.exclusions}\n\n`;

    completeItinerary += `📞 CONTACT:\n`;
    completeItinerary += `Nomadller Solutions - Travel Agency Management\n`;
    completeItinerary += `Professional Travel Planning Services\n\n`;
    
    completeItinerary += `Template created on: ${new Date(itinerary.createdAt).toLocaleDateString()}\n`;
    completeItinerary += `Template ID: ${itinerary.id}\n`;
    
    navigator.clipboard.writeText(completeItinerary).then(() => {
      alert('✅ Complete itinerary template copied to clipboard!');
    }).catch(() => {
      alert('❌ Failed to copy itinerary. Please try again.');
    });
  };

  return (
    <Layout title="Fixed Itinerary Management" subtitle="Manage pre-defined itinerary templates" hideHeader={true}>
      <div className="space-y-6">
        {/* Header Section with Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Fixed Itinerary Templates</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search itineraries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowBuilderModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Itinerary
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Itineraries Grid */}
        <div className="space-y-4">
          {filteredItineraries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h4 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm ? 'No fixed itineraries found' : 'No fixed itineraries yet'}
              </h4>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms to find the itinerary you\'re looking for.' 
                  : 'Create your first fixed itinerary template using our powerful itinerary builder. Templates can be reused for similar client requests.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowBuilderModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Template
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItineraries.map((itinerary) => (
                <div key={itinerary.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200">
                  {isEditing === itinerary.id ? (
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Itinerary Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Days
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="30"
                              value={editForm.numberOfDays || 1}
                              onChange={(e) => setEditForm({ ...editForm, numberOfDays: parseInt(e.target.value) || 1 })}
                              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Cost (Rp)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="10"
                              value={editForm.baseCost || 0}
                              onChange={(e) => setEditForm({ ...editForm, baseCost: parseFloat(e.target.value) || 0 })}
                              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Transportation
                          </label>
                          <input
                            type="text"
                            value={editForm.transportationMode || ''}
                            onChange={(e) => setEditForm({ ...editForm, transportationMode: e.target.value })}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setEditForm({});
                          }}
                          className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
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
                  ) : (
                    <>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-blue-100 to-teal-100 p-3 rounded-lg">
                              <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{itinerary.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {itinerary.numberOfDays} days
                                </span>
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${itinerary.baseCost}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleView(itinerary)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => copyItineraryDetails(itinerary)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Copy Details"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(itinerary)}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(itinerary.id, itinerary.name)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="line-clamp-1">{itinerary.transportationMode}</span>
                          </div>
                          
                          {itinerary.dayPlans && itinerary.dayPlans.length > 0 && (
                            <div className="bg-slate-50 rounded-lg p-3">
                              <div className="text-xs font-medium text-slate-700 mb-2">Day Plans Included</div>
                              <div className="flex items-center space-x-4 text-xs text-slate-600">
                                <div className="flex items-center">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Hotels
                                </div>
                                <div className="flex items-center">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Activities
                                </div>
                                <div className="flex items-center">
                                  <Utensils className="h-3 w-3 mr-1" />
                                  Meals
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t border-slate-200">
                            <div className="text-xs text-slate-500">
                              Created {new Date(itinerary.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-slate-900">{fixedItineraries.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Avg. Duration</p>
                <p className="text-2xl font-bold text-slate-900">
                  {fixedItineraries.length > 0 
                    ? Math.round(fixedItineraries.reduce((sum, it) => sum + it.numberOfDays, 0) / fixedItineraries.length)
                    : 0
                  } days
                </p>
              </div>
              <div className="bg-teal-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Avg. Base Cost</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${fixedItineraries.length > 0 
                    ? Math.round(fixedItineraries.reduce((sum, it) => sum + it.baseCost, 0) / fixedItineraries.length)
                    : 0
                  }
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Most Popular</p>
                <p className="text-lg font-bold text-slate-900">
                  {fixedItineraries.length > 0 ? `${fixedItineraries[0].numberOfDays} Days` : 'N/A'}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itinerary Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-teal-600">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Create Fixed Itinerary Template</h3>
                  <p className="text-blue-100 text-sm">Build a reusable itinerary template</p>
                </div>
              </div>
              <button
                onClick={() => setShowBuilderModal(false)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
              <FixedItineraryBuilder
                onSave={handleSaveFixedItinerary}
                onClose={() => setShowBuilderModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedItinerary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Fixed Itinerary Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">{selectedItinerary.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-slate-500" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Duration:</span>
                      <div className="text-base text-slate-900 font-semibold">{selectedItinerary.numberOfDays} days</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-slate-500" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Transportation:</span>
                      <div className="text-base text-slate-900 font-semibold">{selectedItinerary.transportationMode}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-slate-500" />
                    <div>
                      <span className="text-sm font-medium text-slate-700">Base Cost:</span>
                      <div className="text-base text-slate-900 font-semibold">${selectedItinerary.baseCost}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Day-by-Day Itinerary */}
              {selectedItinerary.dayPlans && selectedItinerary.dayPlans.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Complete Day-by-Day Itinerary
                  </h4>
                  
                  <div className="space-y-4">
                    {selectedItinerary.dayPlans.map((dayPlan) => {
                      const selectedSightseeing = state.sightseeings.filter(s => dayPlan.sightseeing.includes(s.id));
                      const selectedActivities = dayPlan.activities.map(a => {
                        const activity = state.activities.find(act => act.id === a.activityId);
                        const option = activity?.options.find(opt => opt.id === a.optionId);
                        return { activity, option };
                      }).filter(item => item.activity && item.option);
                      const selectedTickets = state.entryTickets.filter(t => dayPlan.entryTickets.includes(t.id));
                      const selectedMeals = state.meals.filter(m => dayPlan.meals.includes(m.id));
                      
                      let hotelInfo = null;
                      if (dayPlan.hotel) {
                        const hotel = state.hotels.find(h => h.id === dayPlan.hotel!.hotelId);
                        const roomType = hotel?.roomTypes.find(rt => rt.id === dayPlan.hotel!.roomTypeId);
                        if (hotel && roomType) {
                          hotelInfo = { hotel, roomType };
                        }
                      }
                      
                      return (
                        <div key={dayPlan.day} className="border border-slate-200 rounded-lg p-4">
                          <h5 className="text-base font-semibold text-slate-900 mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-teal-600" />
                            Day {dayPlan.day}
                          </h5>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              {/* Sightseeing */}
                              {selectedSightseeing.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                    Sightseeing
                                  </h6>
                                  <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                    {selectedSightseeing.map(sight => (
                                      <li key={sight.id}>• {sight.name}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Activities */}
                              {selectedActivities.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                    <Camera className="h-4 w-4 mr-2 text-blue-600" />
                                    Activities
                                  </h6>
                                  <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                    {selectedActivities.map((item, index) => (
                                      <li key={index}>
                                        • {item.activity?.name} - {item.option?.name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Entry Tickets */}
                              {selectedTickets.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                    <Ticket className="h-4 w-4 mr-2 text-blue-600" />
                                    Entry Tickets
                                  </h6>
                                  <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                    {selectedTickets.map(ticket => (
                                      <li key={ticket.id}>• {ticket.name}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              {/* Hotel */}
                              {hotelInfo && (
                                <div>
                                  <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                    <Building2 className="h-4 w-4 mr-2 text-blue-600" />
                                    Accommodation
                                  </h6>
                                  <div className="text-sm text-slate-700 ml-6">
                                    <div>• {hotelInfo.hotel.name}</div>
                                    <div className="text-slate-600">
                                      {hotelInfo.roomType.name} - {hotelInfo.hotel.place}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Meals */}
                              {selectedMeals.length > 0 && (
                                <div>
                                  <h6 className="text-sm font-medium text-slate-900 flex items-center mb-2">
                                    <Utensils className="h-4 w-4 mr-2 text-blue-600" />
                                    Meals
                                  </h6>
                                  <ul className="text-sm text-slate-700 space-y-1 ml-6">
                                    {selectedMeals.map(meal => (
                                      <li key={meal.id} className="capitalize">
                                        • {meal.type} at {meal.place}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-green-600">
                    ✅ Inclusions
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {selectedItinerary.inclusions}
                    </pre>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-slate-900 mb-3 flex items-center text-red-600">
                    ❌ Exclusions
                  </h4>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                      {selectedItinerary.exclusions}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
                <button
                  onClick={() => copyCompleteItinerary(selectedItinerary)}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Complete Itinerary
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FixedItineraryManager;