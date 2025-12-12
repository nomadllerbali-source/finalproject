import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Transportation } from '../../types';
import { Car, Truck, Bike, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import Layout from '../Layout';

const TransportationManager: React.FC = () => {
  const { state, addTransportation, updateTransportationData, deleteTransportationData } = useData();
  const { transportations } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transportation>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransportation, setNewTransportation] = useState<Omit<Transportation, 'id'>>({
    type: 'cab',
    vehicleName: '',
    costPerDay: 0,
    minOccupancy: 1,
    maxOccupancy: 1,
    areaId: '',
    areaName: ''
  });

  const filteredTransportations = transportations.filter(transport => {
    const matchesSearch = transport.vehicleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAdd = async () => {
    if (newTransportation.maxOccupancy < newTransportation.minOccupancy) {
      alert('Maximum occupancy must be greater than or equal to minimum occupancy');
      return;
    }
    if (newTransportation.minOccupancy < 1) {
      alert('Minimum occupancy must be at least 1');
      return;
    }
    const transportation: Transportation = {
      ...newTransportation,
      id: Date.now().toString()
    };
    await addTransportation(transportation);
    setNewTransportation({ type: 'cab', vehicleName: '', costPerDay: 0, minOccupancy: 1, maxOccupancy: 1, areaId: '', areaName: '' });
    setShowAddForm(false);
  };

  const handleEdit = (transportation: Transportation) => {
    setIsEditing(transportation.id);
    setEditForm(transportation);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateTransportationData(editForm as Transportation);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transportation option?')) {
      await deleteTransportationData(id);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'cab': return <Car className="h-5 w-5" />;
      case 'self-drive-car': return <Truck className="h-5 w-5" />;
      case 'self-drive-scooter': return <Bike className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  return (
    <Layout title="Transportation Management" subtitle="Manage vehicle types and pricing" hideHeader={true}>
      <div className="space-y-6">
        {/* Add New Transportation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">Add New Transportation</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center justify-center px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Transportation</span>
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-3 sm:p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Transportation Type
                  </label>
                  <select
                    value={newTransportation.type}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      type: e.target.value as Transportation['type']
                    })}
                    className="w-full p-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                  >
                    <option value="cab">Cab</option>
                    <option value="self-drive-car">Self-drive Car</option>
                    <option value="self-drive-scooter">Self-drive Scooter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    value={newTransportation.vehicleName}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      vehicleName: e.target.value
                    })}
                    placeholder="e.g., Avanza, Honda Activa"
                    className="w-full p-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Minimum Occupancy (Pax) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    value={newTransportation.minOccupancy}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      minOccupancy: parseInt(e.target.value) || 1
                    })}
                    placeholder="e.g., 1"
                    className="w-full p-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum passengers for this vehicle
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Maximum Occupancy (Pax) *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={newTransportation.minOccupancy}
                    value={newTransportation.maxOccupancy}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      maxOccupancy: parseInt(e.target.value) || 1
                    })}
                    placeholder="e.g., 6"
                    className="w-full p-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum passengers for this vehicle
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Cost per Day (Rp)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newTransportation.costPerDay}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      costPerDay: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
                  />
                  {newTransportation.type === 'cab' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Can default to Rp 0 (cost tied to sightseeing)
                    </p>
                  )}
                </div>
              </div>

              {newTransportation.minOccupancy && newTransportation.maxOccupancy && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Occupancy Range:</strong> {newTransportation.minOccupancy}-{newTransportation.maxOccupancy} passengers
                    {newTransportation.vehicleName && ` (${newTransportation.vehicleName})`}
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTransportation.vehicleName}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-target"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span>Add Transportation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transportation List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-slate-200">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">All Transportation Options</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search transportation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {filteredTransportations.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <Car className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
              <h4 className="text-base sm:text-lg text-slate-900 font-medium">No transportation options yet</h4>
              <p className="text-sm sm:text-base text-slate-500 mt-1">Add your first transportation option to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <table className="w-full min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vehicle</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Occupancy</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Cost/Day</th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTransportations.map((transport) => (
                    <tr key={transport.id} className="hover:bg-slate-50 transition-colors">
                      {isEditing === transport.id ? (
                        <>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                type: e.target.value as Transportation['type']
                              })}
                              className="w-full p-2 text-base border border-slate-300 rounded-lg touch-target"
                            >
                              <option value="cab">Cab</option>
                              <option value="self-drive-car">Self-drive Car</option>
                              <option value="self-drive-scooter">Self-drive Scooter</option>
                            </select>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <input
                              type="text"
                              value={editForm.vehicleName || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                vehicleName: e.target.value
                              })}
                              className="w-full p-2 text-base border border-slate-300 rounded-lg touch-target"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-2 items-center">
                              <input
                                type="number"
                                inputMode="numeric"
                                min="1"
                                value={editForm.minOccupancy || 1}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  minOccupancy: parseInt(e.target.value) || 1
                                })}
                                placeholder="Min"
                                className="w-16 p-2 text-base border border-slate-300 rounded-lg touch-target"
                              />
                              <span className="text-slate-500">-</span>
                              <input
                                type="number"
                                inputMode="numeric"
                                min={editForm.minOccupancy || 1}
                                value={editForm.maxOccupancy || 1}
                                onChange={(e) => setEditForm({
                                  ...editForm,
                                  maxOccupancy: parseInt(e.target.value) || 1
                                })}
                                placeholder="Max"
                                className="w-16 p-2 text-base border border-slate-300 rounded-lg touch-target"
                              />
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <input
                              type="number"
                              inputMode="decimal"
                              value={editForm.costPerDay || 0}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                costPerDay: parseFloat(e.target.value) || 0
                              })}
                              className="w-full p-2 text-base border border-slate-300 rounded-lg touch-target"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={handleSave}
                                className="p-2 sm:p-2.5 text-green-600 hover:bg-green-100 rounded-lg transition-colors touch-target"
                                aria-label="Save"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(null);
                                  setEditForm({});
                                }}
                                className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors touch-target"
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="text-slate-600 flex-shrink-0">
                                {getIcon(transport.type)}
                              </div>
                              <span className="capitalize text-sm sm:text-base text-slate-900 truncate">
                                {transport.type.replace('-', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-sm sm:text-base text-slate-900">
                            <div className="truncate max-w-[150px] sm:max-w-none">{transport.vehicleName}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-slate-900 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {transport.minOccupancy || 1}-{transport.maxOccupancy || 1} pax
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-slate-900 font-semibold whitespace-nowrap">
                            Rp {transport.costPerDay.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() => handleEdit(transport)}
                                className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors touch-target"
                                aria-label="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transport.id)}
                                className="p-2 sm:p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors touch-target"
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransportationManager;