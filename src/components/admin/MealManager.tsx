import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Meal } from '../../types';
import { Utensils, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import Layout from '../Layout';

const MealManager: React.FC = () => {
  const { state, addMeal, updateMealData, deleteMealData } = useData();
  const { meals } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Meal>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeal, setNewMeal] = useState<Omit<Meal, 'id'>>({
    type: 'breakfast',
    place: '',
    cost: 0
  });

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.place.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || meal.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAdd = async () => {
    const meal: Meal = {
      ...newMeal,
      id: Date.now().toString()
    };
    await addMeal(meal);
    setNewMeal({ type: 'breakfast', place: '', cost: 0 });
    setShowAddForm(false);
  };

  const handleEdit = (meal: Meal) => {
    setIsEditing(meal.id);
    setEditForm(meal);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateMealData(editForm as Meal);
      setIsEditing(null);
      setEditForm({});
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this meal option?')) {
      await deleteMealData(id);
    }
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-orange-100 text-orange-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <Layout title="Meal Management" subtitle="Manage meal options and restaurant partnerships">
      <div className="space-y-6">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Meal Management</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by restaurant/place..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Meals</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Meal Option
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Meal Type
                  </label>
                  <select
                    value={newMeal.type}
                    onChange={(e) => setNewMeal({
                      ...newMeal,
                      type: e.target.value as 'breakfast' | 'lunch' | 'dinner'
                    })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Restaurant/Place
                  </label>
                  <input
                    type="text"
                    value={newMeal.place}
                    onChange={(e) => setNewMeal({ ...newMeal, place: e.target.value })}
                    placeholder="e.g., Warung Bali, Hotel Restaurant"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost per Person ($)
                  </label>
                  <input
                    type="number"
                    value={newMeal.cost}
                    onChange={(e) => setNewMeal({ ...newMeal, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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
                  disabled={!newMeal.place}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Meal Option
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meals List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">All Meal Options</h3>
          </div>

          {filteredMeals.length === 0 ? (
            <div className="p-12 text-center">
              <Utensils className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm || filterType !== 'all' ? 'No meal options found' : 'No meal options yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add your first meal option to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Meal Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Restaurant/Place</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost/Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredMeals.map((meal) => (
                    <tr key={meal.id} className="hover:bg-slate-50">
                      {isEditing === meal.id ? (
                        <>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                type: e.target.value as 'breakfast' | 'lunch' | 'dinner'
                              })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch</option>
                              <option value="dinner">Dinner</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.place || ''}
                              onChange={(e) => setEditForm({ ...editForm, place: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm.cost || 0}
                              onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) || 0 })}
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
                              <span className="text-2xl">{getMealIcon(meal.type)}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getMealTypeColor(meal.type)}`}>
                                {meal.type}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Utensils className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">{meal.place}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            ${meal.cost}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(meal)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(meal.id)}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Meals</p>
                <p className="text-2xl font-bold text-slate-900">{meals.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Utensils className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Breakfast Options</p>
                <p className="text-2xl font-bold text-slate-900">
                  {meals.filter(m => m.type === 'breakfast').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <span className="text-2xl">🌅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Lunch Options</p>
                <p className="text-2xl font-bold text-slate-900">
                  {meals.filter(m => m.type === 'lunch').length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <span className="text-2xl">☀️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Dinner Options</p>
                <p className="text-2xl font-bold text-slate-900">
                  {meals.filter(m => m.type === 'dinner').length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <span className="text-2xl">🌙</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MealManager;