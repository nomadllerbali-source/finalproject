import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Transportation } from '../../types';
import { Car, Truck, Bike, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import Layout from '../Layout';

const TransportationManager: React.FC = () => {
  const { state, dispatch } = useData();
  const { transportations } = state;
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transportation>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransportation, setNewTransportation] = useState<Omit<Transportation, 'id'>>({
    type: 'cab',
    vehicleName: '',
    costPerDay: 0
  });

  const handleAdd = () => {
    const transportation: Transportation = {
      ...newTransportation,
      id: Date.now().toString()
    };
    dispatch({ type: 'ADD_TRANSPORTATION', payload: transportation });
    setNewTransportation({ type: 'cab', vehicleName: '', costPerDay: 0 });
    setShowAddForm(false);
  };

  const handleEdit = (transportation: Transportation) => {
    setIsEditing(transportation.id);
    setEditForm(transportation);
  };

  const handleSave = () => {
    if (isEditing && editForm.id) {
      dispatch({ type: 'UPDATE_TRANSPORTATION', payload: editForm as Transportation });
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transportation option?')) {
      dispatch({ type: 'DELETE_TRANSPORTATION', payload: id });
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
    <Layout title="Transportation Management" subtitle="Manage vehicle types and pricing">
      <div className="space-y-6">
        {/* Add New Transportation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Add New Transportation</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transportation
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Transportation Type
                  </label>
                  <select
                    value={newTransportation.type}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      type: e.target.value as Transportation['type']
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cab">Cab</option>
                    <option value="self-drive-car">Self-drive Car</option>
                    <option value="self-drive-scooter">Self-drive Scooter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
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
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost per Day ($)
                  </label>
                  <input
                    type="number"
                    value={newTransportation.costPerDay}
                    onChange={(e) => setNewTransportation({
                      ...newTransportation,
                      costPerDay: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {newTransportation.type === 'cab' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Can default to $0 (cost tied to sightseeing)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTransportation.vehicleName}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Transportation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transportation List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">All Transportation Options</h3>
          </div>

          {transportations.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">No transportation options yet</h4>
              <p className="text-slate-500 mt-1">Add your first transportation option to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost/Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transportations.map((transport) => (
                    <tr key={transport.id} className="hover:bg-slate-50">
                      {isEditing === transport.id ? (
                        <>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                type: e.target.value as Transportation['type']
                              })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              <option value="cab">Cab</option>
                              <option value="self-drive-car">Self-drive Car</option>
                              <option value="self-drive-scooter">Self-drive Scooter</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.vehicleName || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                vehicleName: e.target.value
                              })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm.costPerDay || 0}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                costPerDay: parseFloat(e.target.value) || 0
                              })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSave}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(null);
                                  setEditForm({});
                                }}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-slate-600">
                                {getIcon(transport.type)}
                              </div>
                              <span className="capitalize text-slate-900">
                                {transport.type.replace('-', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {transport.vehicleName}
                          </td>
                          <td className="px-6 py-4 text-slate-900">
                            ${transport.costPerDay}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(transport)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(transport.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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