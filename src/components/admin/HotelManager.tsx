import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Hotel, RoomType } from '../../types';
import { Building2, Plus, Edit2, Trash2, Save, X, Star, Search } from 'lucide-react';
import Layout from '../Layout';

const HotelManager: React.FC = () => {
  const { state, addHotel, updateHotelData, deleteHotelData } = useData();
  const { hotels } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Hotel>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHotel, setNewHotel] = useState<Omit<Hotel, 'id'>>({
    name: '',
    place: '',
    starCategory: '3-star',
    roomTypes: []
  });

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.place.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addRoomType = (isNew: boolean = false) => {
    const newRoomType: RoomType = {
      id: Date.now().toString(),
      name: '',
      peakSeasonPrice: 0,
      seasonPrice: 0,
      offSeasonPrice: 0
    };

    if (isNew) {
      setNewHotel({
        ...newHotel,
        roomTypes: [...newHotel.roomTypes, newRoomType]
      });
    } else if (editForm.roomTypes) {
      setEditForm({
        ...editForm,
        roomTypes: [...editForm.roomTypes, newRoomType]
      });
    }
  };

  const updateRoomType = (index: number, field: keyof RoomType, value: any, isNew: boolean = false) => {
    if (isNew) {
      const updatedRoomTypes = [...newHotel.roomTypes];
      updatedRoomTypes[index] = { ...updatedRoomTypes[index], [field]: value };
      setNewHotel({ ...newHotel, roomTypes: updatedRoomTypes });
    } else if (editForm.roomTypes) {
      const updatedRoomTypes = [...editForm.roomTypes];
      updatedRoomTypes[index] = { ...updatedRoomTypes[index], [field]: value };
      setEditForm({ ...editForm, roomTypes: updatedRoomTypes });
    }
  };

  const removeRoomType = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const updatedRoomTypes = newHotel.roomTypes.filter((_, i) => i !== index);
      setNewHotel({ ...newHotel, roomTypes: updatedRoomTypes });
    } else if (editForm.roomTypes) {
      const updatedRoomTypes = editForm.roomTypes.filter((_, i) => i !== index);
      setEditForm({ ...editForm, roomTypes: updatedRoomTypes });
    }
  };

  const handleAdd = async () => {
    if (newHotel.roomTypes.length === 0) {
      alert('Please add at least one room type.');
      return;
    }

    const hotel: Hotel = {
      ...newHotel,
      id: Date.now().toString()
    };
    await addHotel(hotel);
    setNewHotel({ name: '', place: '', starCategory: '3-star', roomTypes: [] });
    setShowAddForm(false);
  };

  const handleEdit = (hotel: Hotel) => {
    setIsEditing(hotel.id);
    setEditForm(hotel);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateHotelData(editForm as Hotel);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hotel?')) {
      await deleteHotelData(id);
    }
  };

  const renderStars = (category: string) => {
    const count = parseInt(category.charAt(0));
    return Array(count).fill(0).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
    ));
  };

  return (
    <Layout title="Hotel Management" subtitle="Manage hotels, room types, and seasonal pricing" hideHeader={true}>
      <div className="space-y-6">
        {/* Search and Add Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 flex-shrink-0">Hotel Management</h3>
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search hotels by name or place..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-target flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Hotel
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={newHotel.name}
                    onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                    placeholder="Enter hotel name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Place/Location
                  </label>
                  <input
                    type="text"
                    value={newHotel.place}
                    onChange={(e) => setNewHotel({ ...newHotel, place: e.target.value })}
                    placeholder="Enter location"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Star Category
                  </label>
                  <select
                    value={newHotel.starCategory}
                    onChange={(e) => setNewHotel({
                      ...newHotel,
                      starCategory: e.target.value as Hotel['starCategory']
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="3-star">3 Star</option>
                    <option value="4-star">4 Star</option>
                    <option value="5-star">5 Star</option>
                  </select>
                </div>
              </div>

              {/* Room Types */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-slate-900">Room Types & Pricing</h4>
                  <button
                    onClick={() => addRoomType(true)}
                    className="inline-flex items-center px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Room Type
                  </button>
                </div>

                {newHotel.roomTypes.map((roomType, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Room Type Name
                        </label>
                        <input
                          type="text"
                          value={roomType.name}
                          onChange={(e) => updateRoomType(index, 'name', e.target.value, true)}
                          placeholder="e.g., Deluxe Room"
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Peak Season ($)
                          <span className="text-xs text-slate-500 block">Dec 20 - Jan 5</span>
                        </label>
                        <input
                          type="number"
                          value={roomType.peakSeasonPrice}
                          onChange={(e) => updateRoomType(index, 'peakSeasonPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Season ($)
                          <span className="text-xs text-slate-500 block">Jul 1 - Aug 31</span>
                        </label>
                        <input
                          type="number"
                          value={roomType.seasonPrice}
                          onChange={(e) => updateRoomType(index, 'seasonPrice', parseFloat(e.target.value) || 0, true)}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Off-Season ($)
                          <span className="text-xs text-slate-500 block">Other dates</span>
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={roomType.offSeasonPrice}
                            onChange={(e) => updateRoomType(index, 'offSeasonPrice', parseFloat(e.target.value) || 0, true)}
                            className="flex-1 p-2 border border-slate-300 rounded-lg"
                          />
                          <button
                            onClick={() => removeRoomType(index, true)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newHotel.name || !newHotel.place || newHotel.roomTypes.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Hotel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hotels List */}
        <div className="space-y-4">
          {filteredHotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm ? 'No hotels found' : 'No hotels yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first hotel to get started.'
                }
              </p>
            </div>
          ) : (
            filteredHotels.map((hotel) => (
              <div key={hotel.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                {isEditing === hotel.id ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Hotel Name
                        </label>
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Place/Location
                        </label>
                        <input
                          type="text"
                          value={editForm.place || ''}
                          onChange={(e) => setEditForm({ ...editForm, place: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Star Category
                        </label>
                        <select
                          value={editForm.starCategory}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            starCategory: e.target.value as Hotel['starCategory']
                          })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        >
                          <option value="3-star">3 Star</option>
                          <option value="4-star">4 Star</option>
                          <option value="5-star">5 Star</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-slate-900">Room Types & Pricing</h4>
                        <button
                          onClick={() => addRoomType(false)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Room Type
                        </button>
                      </div>

                      {editForm.roomTypes?.map((roomType, index) => (
                        <div key={roomType.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Room Type Name
                              </label>
                              <input
                                type="text"
                                value={roomType.name}
                                onChange={(e) => updateRoomType(index, 'name', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Peak Season ($)
                              </label>
                              <input
                                type="number"
                                value={roomType.peakSeasonPrice}
                                onChange={(e) => updateRoomType(index, 'peakSeasonPrice', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Season ($)
                              </label>
                              <input
                                type="number"
                                value={roomType.seasonPrice}
                                onChange={(e) => updateRoomType(index, 'seasonPrice', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Off-Season ($)
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  value={roomType.offSeasonPrice}
                                  onChange={(e) => updateRoomType(index, 'offSeasonPrice', parseFloat(e.target.value) || 0)}
                                  className="flex-1 p-2 border border-slate-300 rounded-lg"
                                />
                                <button
                                  onClick={() => removeRoomType(index)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3">
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
                    <div className="px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{hotel.name}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-slate-600">{hotel.place}</span>
                              <div className="flex items-center">
                                {renderStars(hotel.starCategory)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(hotel)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(hotel.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-md font-semibold text-slate-900 mb-4">Room Types & Pricing</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {hotel.roomTypes.map((roomType) => (
                          <div key={roomType.id} className="bg-slate-50 p-4 rounded-lg">
                            <h5 className="font-medium text-slate-900 mb-3">{roomType.name}</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-600">Peak Season:</span>
                                <span className="font-medium">${roomType.peakSeasonPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Season:</span>
                                <span className="font-medium">${roomType.seasonPrice}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Off-Season:</span>
                                <span className="font-medium">${roomType.offSeasonPrice}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HotelManager;