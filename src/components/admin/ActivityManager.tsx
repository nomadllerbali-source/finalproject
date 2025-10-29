import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Activity, ActivityOption } from '../../types';
import { Camera, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import Layout from '../Layout';

const ActivityManager: React.FC = () => {
  const { state, addActivity, updateActivityData, deleteActivityData } = useData();
  const { activities, sightseeings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id'>>({
    name: '',
    location: '',
    options: []
  });

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.options.some(option => option.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    activity.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSightseeingLocationName = (sightseeingId: string): string => {
    const sightseeing = sightseeings.find(s => s.id === sightseeingId);
    return sightseeing ? sightseeing.name : 'Unknown Location';
  };

  // Get unique sightseeing locations for dropdown
  const uniqueSightseeingLocations = sightseeings.reduce((acc, sight) => {
    if (!acc.find(item => item.name === sight.name)) {
      acc.push({ id: sight.id, name: sight.name });
    }
    return acc;
  }, [] as Array<{ id: string; name: string }>);
  const addOption = (isNew: boolean = false) => {
    const newOption: ActivityOption = {
      id: Date.now().toString(),
      name: '',
      cost: 0,
      costForHowMany: 1
    };

    if (isNew) {
      setNewActivity({
        ...newActivity,
        options: [...newActivity.options, newOption]
      });
    } else if (editForm.options) {
      setEditForm({
        ...editForm,
        options: [...editForm.options, newOption]
      });
    }
  };

  const updateOption = (index: number, field: keyof ActivityOption, value: any, isNew: boolean = false) => {
    if (isNew) {
      const updatedOptions = [...newActivity.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      setNewActivity({ ...newActivity, options: updatedOptions });
    } else if (editForm.options) {
      const updatedOptions = [...editForm.options];
      updatedOptions[index] = { ...updatedOptions[index], [field]: value };
      setEditForm({ ...editForm, options: updatedOptions });
    }
  };

  const removeOption = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const updatedOptions = newActivity.options.filter((_, i) => i !== index);
      setNewActivity({ ...newActivity, options: updatedOptions });
    } else if (editForm.options) {
      const updatedOptions = editForm.options.filter((_, i) => i !== index);
      setEditForm({ ...editForm, options: updatedOptions });
    }
  };

  const handleAdd = async () => {
    if (newActivity.options.length === 0) {
      alert('Please add at least one activity option.');
      return;
    }

    const activity: Activity = {
      ...newActivity,
      id: Date.now().toString()
    };
    await addActivity(activity);
    setNewActivity({ name: '', location: '', options: [] });
    setShowAddForm(false);
  };

  const handleEdit = (activity: Activity) => {
    setIsEditing(activity.id);
    setEditForm(activity);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateActivityData(editForm as Activity);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      await deleteActivityData(id);
    }
  };

  return (
    <Layout title="Activity Management" subtitle="Manage activities and their pricing options">
      <div className="space-y-6">
        {/* Search and Add Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Activity Management</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search activities..."
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
                Add Activity
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                  placeholder="e.g., Bali Swing, ATV Ride, Snorkeling"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">
                  Location
                </label>
                <input
                  type="text"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  placeholder="e.g., Ubud, Seminyak, Kuta"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Activity Options */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-slate-900">Activity Options & Pricing</h4>
                  <button
                    onClick={() => addOption(true)}
                    className="inline-flex items-center px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>

                {newActivity.options.map((option, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Option Name
                        </label>
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOption(index, 'name', e.target.value, true)}
                          placeholder="e.g., Single Rider, Tandem Rider"
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cost ($)
                        </label>
                        <input
                          type="number"
                          value={option.cost}
                          onChange={(e) => updateOption(index, 'cost', parseFloat(e.target.value) || 0, true)}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cost for How Many People
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={option.costForHowMany}
                            onChange={(e) => updateOption(index, 'costForHowMany', parseInt(e.target.value) || 1, true)}
                            className="flex-1 p-2 border border-slate-300 rounded-lg"
                          />
                          <button
                            onClick={() => removeOption(index, true)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {newActivity.options.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p>No options added yet. Click "Add Option" to get started.</p>
                  </div>
                )}
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
                  disabled={!newActivity.name || !newActivity.location || newActivity.options.length === 0}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Activity
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm ? 'No activities found' : 'No activities yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first activity to get started.'
                }
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-slate-200">
                {isEditing === activity.id ? (
                  <div className="p-6">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Activity Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                      
                      <label className="block text-sm font-medium text-slate-700 mb-1 mt-4">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full p-3 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-slate-900">Activity Options & Pricing</h4>
                        <button
                          onClick={() => addOption(false)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </button>
                      </div>

                      {editForm.options?.map((option, index) => (
                        <div key={option.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Option Name
                              </label>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => updateOption(index, 'name', e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost ($)
                              </label>
                              <input
                                type="number"
                                value={option.cost}
                                onChange={(e) => updateOption(index, 'cost', parseFloat(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Cost for How Many People
                              </label>
                              <div className="flex space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={option.costForHowMany}
                                  onChange={(e) => updateOption(index, 'costForHowMany', parseInt(e.target.value) || 1)}
                                  className="flex-1 p-2 border border-slate-300 rounded-lg"
                                />
                                <button
                                  onClick={() => removeOption(index)}
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
                            <Camera className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{activity.name}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-slate-600">{activity.location}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600">
                                {activity.options.length} option{activity.options.length !== 1 ? 's' : ''} available
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(activity)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="text-md font-semibold text-slate-900 mb-4">Available Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activity.options.map((option) => (
                          <div key={option.id} className="bg-slate-50 p-4 rounded-lg">
                            <h5 className="font-medium text-slate-900 mb-2">{option.name}</h5>
                            <div className="text-2xl font-bold text-green-600">${option.cost}</div>
                            <div className="text-sm text-slate-600">for {option.costForHowMany} {option.costForHowMany === 1 ? 'person' : 'people'}</div>
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

export default ActivityManager;