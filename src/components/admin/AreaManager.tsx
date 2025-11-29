import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Save, X, Search } from 'lucide-react';
import Layout from '../Layout';
import { supabase } from '../../lib/supabase';

interface Area {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

const AreaManager: React.FC = () => {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Area>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newArea, setNewArea] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .order('name');

      if (error) throw error;
      setAreas(data || []);
    } catch (error: any) {
      console.error('Error fetching areas:', error);
      alert('Failed to load areas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.name.trim()) {
      alert('Please enter an area name');
      return;
    }

    try {
      const { error } = await supabase
        .from('areas')
        .insert([{
          name: newArea.name.trim(),
          description: newArea.description.trim()
        }]);

      if (error) throw error;

      alert('Area added successfully!');
      setNewArea({ name: '', description: '' });
      setShowAddForm(false);
      fetchAreas();
    } catch (error: any) {
      console.error('Error adding area:', error);
      alert(`Failed to add area: ${error.message}`);
    }
  };

  const handleUpdateArea = async () => {
    if (!editForm.name?.trim()) {
      alert('Please enter an area name');
      return;
    }

    try {
      const { error } = await supabase
        .from('areas')
        .update({
          name: editForm.name.trim(),
          description: editForm.description?.trim() || ''
        })
        .eq('id', isEditing);

      if (error) throw error;

      alert('Area updated successfully!');
      setIsEditing(null);
      setEditForm({});
      fetchAreas();
    } catch (error: any) {
      console.error('Error updating area:', error);
      alert(`Failed to update area: ${error.message}`);
    }
  };

  const handleDeleteArea = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Area deleted successfully!');
      fetchAreas();
    } catch (error: any) {
      console.error('Error deleting area:', error);
      alert(`Failed to delete area: ${error.message}`);
    }
  };

  const startEdit = (area: Area) => {
    setIsEditing(area.id);
    setEditForm(area);
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditForm({});
  };

  const filteredAreas = areas.filter(area =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-slate-600">Loading areas...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Area Management</h1>
          <p className="text-slate-600">Manage all areas/locations in Bali</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search areas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Area
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white border-2 border-blue-500 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Add New Area</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area Name *
                </label>
                <input
                  type="text"
                  value={newArea.name}
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                  placeholder="e.g., Ubud, Kintamani, Kuta"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newArea.description}
                  onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddArea}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="h-4 w-4 inline mr-2" />
                Save Area
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAreas.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              {searchTerm ? 'No areas found matching your search.' : 'No areas added yet. Click "Add Area" to get started.'}
            </div>
          ) : (
            filteredAreas.map((area) => (
              <div
                key={area.id}
                className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                {isEditing === area.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-lg font-bold"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateArea}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <Save className="h-4 w-4 inline mr-1" />
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 text-sm"
                      >
                        <X className="h-4 w-4 inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-slate-900">{area.name}</h3>
                      </div>
                    </div>
                    {area.description && (
                      <p className="text-sm text-slate-600 mb-4">{area.description}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(area)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                      >
                        <Edit2 className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArea(area.id, area.name)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AreaManager;
