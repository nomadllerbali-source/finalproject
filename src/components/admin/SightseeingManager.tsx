import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Sightseeing, VehicleCost } from '../../types';
import { MapPin, Plus, Edit2, Trash2, Save, X, Search, Car } from 'lucide-react';
import Layout from '../Layout';

const SightseeingManager: React.FC = () => {
  const { state, addSightseeing, updateSightseeingData, deleteSightseeingData } = useData();
  const { sightseeings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Sightseeing>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSightseeing, setNewSightseeing] = useState<Omit<Sightseeing, 'id'>>({
    name: '',
    description: '',
    transportationMode: 'cab',
    vehicleCosts: {
      avanza: 0,
      hiace: 0,
      miniBus: 0,
      bus32: 0,
      bus39: 0
    }
  });

  const filteredSightseeings = sightseeings.filter(sight =>
    sight.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sight.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async () => {
    // Create sightseeing for all transportation modes
    const transportationModes = ['cab', 'self-drive-car', 'self-drive-scooter'];

    for (const mode of transportationModes) {
      const sightseeing: Sightseeing = {
        id: `${Date.now()}-${mode}`,
        name: newSightseeing.name,
        description: newSightseeing.description,
        transportationMode: mode as 'cab' | 'self-drive-car' | 'self-drive-scooter',
        vehicleCosts: mode === 'cab' ? newSightseeing.vehicleCosts : undefined
      };
      await addSightseeing(sightseeing);
    }

    setNewSightseeing({
      name: '',
      description: '',
      transportationMode: 'cab',
      vehicleCosts: { avanza: 0, hiace: 0, miniBus: 0, bus32: 0, bus39: 0 }
    });
    setShowAddForm(false);
  };

  const handleEdit = (sightseeing: Sightseeing) => {
    setIsEditing(sightseeing.id);
    setEditForm(sightseeing);
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

  const updateVehicleCost = (vehicle: keyof VehicleCost, value: number, isNew: boolean = false) => {
    if (isNew) {
      setNewSightseeing({
        ...newSightseeing,
        vehicleCosts: {
          ...newSightseeing.vehicleCosts!,
          [vehicle]: value
        }
      });
    } else if (editForm.vehicleCosts) {
      setEditForm({
        ...editForm,
        vehicleCosts: {
          ...editForm.vehicleCosts,
          [vehicle]: value
        }
      });
    }
  };

  const renderVehicleCostInputs = (vehicleCosts: VehicleCost | undefined, isNew: boolean = false) => {
    if (!vehicleCosts) return null;

    const vehicles = [
      { key: 'avanza' as keyof VehicleCost, name: 'Avanza', pax: '2-6 pax' },
      { key: 'hiace' as keyof VehicleCost, name: 'Hiace', pax: '6-12 pax' },
      { key: 'miniBus' as keyof VehicleCost, name: 'Mini Bus', pax: '12-27 pax' },
      { key: 'bus32' as keyof VehicleCost, name: 'Bus 32', pax: '27-32 pax' },
      { key: 'bus39' as keyof VehicleCost, name: 'Bus 39', pax: '32-39 pax' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(vehicle => (
          <div key={vehicle.key}>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {vehicle.name} Cost ($)
              <span className="text-xs text-slate-500 block">{vehicle.pax}</span>
            </label>
            <input
              type="number"
              value={vehicleCosts[vehicle.key]}
              onChange={(e) => updateVehicleCost(vehicle.key, parseFloat(e.target.value) || 0, isNew)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Sightseeing Management" subtitle="Manage sightseeing spots and transportation costs">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sightseeing Name
                  </label>
                  <input
                    type="text"
                    value={newSightseeing.name}
                    onChange={(e) => setNewSightseeing({ ...newSightseeing, name: e.target.value })}
                    placeholder="Enter sightseeing spot name"
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
                  Description
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Sightseeing Name
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
                        Description
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
                            <h3 className="text-lg font-semibold text-slate-900">{sight.name}</h3>
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
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-700">Avanza (2-6 pax)</div>
                            <div className="text-lg font-bold text-slate-900">${sight.vehicleCosts.avanza}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-700">Hiace (6-12 pax)</div>
                            <div className="text-lg font-bold text-slate-900">${sight.vehicleCosts.hiace}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-700">Mini Bus (12-27 pax)</div>
                            <div className="text-lg font-bold text-slate-900">${sight.vehicleCosts.miniBus}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-700">Bus 32 (27-32 pax)</div>
                            <div className="text-lg font-bold text-slate-900">${sight.vehicleCosts.bus32}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm font-medium text-slate-700">Bus 39 (32-39 pax)</div>
                            <div className="text-lg font-bold text-slate-900">${sight.vehicleCosts.bus39}</div>
                          </div>
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