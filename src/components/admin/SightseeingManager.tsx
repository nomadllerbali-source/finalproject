import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Sightseeing, VehicleCost, Area } from '../../types';
import { MapPin, Plus, Edit2, Trash2, Save, X, Search, Car } from 'lucide-react';
import Layout from '../Layout';
import { supabase } from '../../lib/supabase';

const SightseeingManager: React.FC = () => {
  const { state, addSightseeing, updateSightseeingData, deleteSightseeingData } = useData();
  const { sightseeings, transportations } = state;
  const [areas, setAreas] = useState<Area[]>([]);
  const [filterArea, setFilterArea] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sightseeing>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSightseeing, setNewSightseeing] = useState<Omit<Sightseeing, 'id'>>({
    name: '',
    displayName: '',
    description: '',
    transportationMode: 'cab',
    vehicleCosts: {},
    areaId: '',
    areaName: ''
  });

  useEffect(() => {
    fetchAreas();
    initializeVehicleCosts();
  }, [transportations]);

  const initializeVehicleCosts = () => {
    const cabVehicles = transportations.filter(t => t.type === 'cab');
    const initialCosts: VehicleCost = {};
    cabVehicles.forEach(vehicle => {
      initialCosts[vehicle.vehicleName] = 0;
    });
    setNewSightseeing(prev => ({
      ...prev,
      vehicleCosts: initialCosts
    }));
  };

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const filteredSightseeings = sightseeings.filter(sight => {
    const matchesArea = filterArea === 'all' || sight.areaId === filterArea;
    const matchesSearch =
      sight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sight.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sight.areaName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesArea && matchesSearch;
  });

  const handleAdd = async () => {
    if (!newSightseeing.areaId) {
      alert('Please select an area first');
      return;
    }
    // Create sightseeing for all transportation modes
    const transportationModes = ['cab', 'self-drive-car', 'self-drive-scooter'];

    for (const mode of transportationModes) {
      const sightseeing: Sightseeing = {
        id: `${Date.now()}-${mode}`,
        name: newSightseeing.name,
        description: newSightseeing.description,
        transportationMode: mode as 'cab' | 'self-drive-car' | 'self-drive-scooter',
        vehicleCosts: mode === 'cab' ? newSightseeing.vehicleCosts : undefined,
        areaId: newSightseeing.areaId,
        areaName: newSightseeing.areaName
      };
      await addSightseeing(sightseeing);
    }

    const cabVehicles = transportations.filter(t => t.type === 'cab');
    const initialCosts: VehicleCost = {};
    cabVehicles.forEach(vehicle => {
      initialCosts[vehicle.vehicleName] = 0;
    });
    setNewSightseeing({
      name: '',
      displayName: '',
      description: '',
      transportationMode: 'cab',
      vehicleCosts: initialCosts,
      areaId: '',
      areaName: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (sightseeing: Sightseeing) => {
    setIsEditing(sightseeing.id);

    if (sightseeing.transportationMode === 'cab') {
      const cabVehicles = transportations.filter(t => t.type === 'cab');
      const updatedCosts = { ...sightseeing.vehicleCosts };

      cabVehicles.forEach(vehicle => {
        if (!(vehicle.vehicleName in updatedCosts)) {
          updatedCosts[vehicle.vehicleName] = 0;
        }
      });

      setEditForm({ ...sightseeing, vehicleCosts: updatedCosts });
    } else {
      setEditForm(sightseeing);
    }
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateSightseeingData(editForm as Sightseeing);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sightseeing spot?')) {
      await deleteSightseeingData(id);
    }
  };

  const updateVehicleCost = (vehicleName: string, value: number, isNew: boolean = false) => {
    if (isNew) {
      setNewSightseeing({
        ...newSightseeing,
        vehicleCosts: {
          ...newSightseeing.vehicleCosts!,
          [vehicleName]: value
        }
      });
    } else if (editForm.vehicleCosts) {
      setEditForm({
        ...editForm,
        vehicleCosts: {
          ...editForm.vehicleCosts,
          [vehicleName]: value
        }
      });
    }
  };

  const renderVehicleCostInputs = (vehicleCosts: VehicleCost | undefined, isNew: boolean = false) => {
    if (!vehicleCosts) return null;

    const cabVehicles = transportations.filter(t => t.type === 'cab');

    if (cabVehicles.length === 0) {
      return (
        <div className="text-slate-500 text-sm">
          No cab vehicles found. Please add vehicles in the Transportation Manager first.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cabVehicles.map(vehicle => (
          <div key={vehicle.id}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {vehicle.vehicleName} Cost (Rp)
              <span className="text-xs text-slate-500 block">
                {vehicle.minOccupancy}-{vehicle.maxOccupancy} pax
              </span>
            </label>
            <input
              type="number"
              value={vehicleCosts[vehicle.vehicleName] || 0}
              onChange={(e) => updateVehicleCost(vehicle.vehicleName, parseFloat(e.target.value) || 0, isNew)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Sightseeing Management" subtitle="Manage sightseeing spots and transportation costs" hideHeader={true}>
      <div className="space-y-6">
        {/* Search and Add Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Sightseeing Management</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search sightseeing spots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Sightseeing
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Area *
                  </label>
                  <select
                    value={newSightseeing.areaId}
                    onChange={(e) => {
                      const selectedArea = areas.find(a => a.id === e.target.value);
                      setNewSightseeing({
                        ...newSightseeing,
                        areaId: e.target.value,
                        areaName: selectedArea?.name || ''
                      });
                    }}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select area first...</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sightseeing Name (Internal)
                  </label>
                  <input
                    type="text"
                    value={newSightseeing.name}
                    onChange={(e) => setNewSightseeing({ ...newSightseeing, name: e.target.value })}
                    placeholder="Enter internal reference name"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transportation Mode
                  </label>
                  <select
                    value={newSightseeing.transportationMode}
                    onChange={(e) => setNewSightseeing({
                      ...newSightseeing,
                      transportationMode: e.target.value as 'cab' | 'self-drive-car' | 'self-drive-scooter'
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cab">Cab</option>
                    <option value="self-drive-car">Self-drive Car</option>
                    <option value="self-drive-scooter">Self-drive Scooter</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name (Shown in Itinerary) *
                  <span className="text-xs text-slate-500 block mt-1">This will appear as a bold heading in the day-by-day itinerary</span>
                </label>
                <input
                  type="text"
                  value={newSightseeing.displayName}
                  onChange={(e) => setNewSightseeing({ ...newSightseeing, displayName: e.target.value })}
                  placeholder="Enter the name to display in itinerary (e.g., 'Ubud Rice Terraces Visit')"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                  <span className="text-xs text-slate-500 block mt-1">Details shown below the display name in the itinerary</span>
                </label>
                <textarea
                  value={newSightseeing.description}
                  onChange={(e) => setNewSightseeing({ ...newSightseeing, description: e.target.value })}
                  placeholder="Enter description of the sightseeing spot"
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {newSightseeing.transportationMode === 'cab' && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                    <Car className="h-4 w-4 mr-2 text-blue-600" />
                    Vehicle Costs (for Cab mode)
                  </h4>
                  {renderVehicleCostInputs(newSightseeing.vehicleCosts, true)}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newSightseeing.name || !newSightseeing.description}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Sightseeing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sightseeing List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search sightseeing..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Areas</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>{area.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-4">
          {filteredSightseeings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <MapPin className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm ? 'No sightseeing spots found' : 'No sightseeing spots yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first sightseeing spot to get started.'
                }
              </p>
            </div>
          ) : (
            filteredSightseeings.map((sight) => (
              <div key={sight.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                {isEditing === sight.id ? (
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          <MapPin className="h-4 w-4 inline mr-1" />
                          Area *
                        </label>
                        <select
                          value={editForm.areaId}
                          onChange={(e) => {
                            const selectedArea = areas.find(a => a.id === e.target.value);
                            setEditForm({
                              ...editForm,
                              areaId: e.target.value,
                              areaName: selectedArea?.name || ''
                            });
                          }}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        >
                          <option value="">Select area...</option>
                          {areas.map(area => (
                            <option key={area.id} value={area.id}>{area.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Sightseeing Name (Internal)
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
                          Transportation Mode
                        </label>
                        <select
                          value={editForm.transportationMode}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            transportationMode: e.target.value as 'cab' | 'self-drive-car' | 'self-drive-scooter'
                          })}
                          className="w-full p-3 border border-slate-300 rounded-lg"
                        >
                          <option value="cab">Cab</option>
                          <option value="self-drive-car">Self-drive Car</option>
                          <option value="self-drive-scooter">Self-drive Scooter</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Display Name (Shown in Itinerary) *
                        <span className="text-xs text-slate-500 block mt-1">This will appear as a bold heading in the day-by-day itinerary</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName || ''}
                        onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                        placeholder="Enter the name to display in itinerary"
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                        <span className="text-xs text-slate-500 block mt-1">Details shown below the display name in the itinerary</span>
                      </label>
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={3}
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                    </div>

                    {editForm.transportationMode === 'cab' && (
                      <div className="mb-6">
                        <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          Vehicle Costs (for Cab mode)
                        </h4>
                        {renderVehicleCostInputs(editForm.vehicleCosts)}
                      </div>
                    )}

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
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-900">{sight.name}</h3>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                                <MapPin className="h-3 w-3 mr-1" />
                                {sight.areaName || 'No Area'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-slate-600">{sight.description}</span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {sight.transportationMode.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(sight)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sight.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {sight.transportationMode === 'cab' && sight.vehicleCosts && (
                      <div className="p-6">
                        <h4 className="text-md font-semibold text-slate-900 mb-4 flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          Vehicle Costs
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {Object.entries(sight.vehicleCosts).map(([vehicleName, cost]) => {
                            const vehicle = transportations.find(t => t.vehicleName === vehicleName && t.type === 'cab');
                            return (
                              <div key={vehicleName} className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-sm font-medium text-slate-700">
                                  {vehicleName}
                                  {vehicle && ` (${vehicle.minOccupancy}-${vehicle.maxOccupancy} pax)`}
                                </div>
                                <div className="text-lg font-bold text-slate-900">Rp {cost.toLocaleString('id-ID')}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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

export default SightseeingManager;