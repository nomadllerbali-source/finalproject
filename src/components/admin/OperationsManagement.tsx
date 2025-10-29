import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Plus, Edit2, Trash2, Save, X, Search, Shield, ShieldCheck } from 'lucide-react';
import Layout from '../Layout';

interface OperationsPerson {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  company_name: string | null;
  is_active: boolean;
  created_at: string;
}

const OperationsManagement: React.FC = () => {
  const [operationsPersons, setOperationsPersons] = useState<OperationsPerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<OperationsPerson>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    email: '',
    full_name: '',
    password: '',
    phone_number: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchOperationsPersons();
  }, []);

  const fetchOperationsPersons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('operations_persons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOperationsPersons(data || []);
    } catch (error: any) {
      console.error('Error fetching operations persons:', error);
      setMessage({ type: 'error', text: 'Failed to load operations persons' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPerson.email || !newPerson.full_name || !newPerson.password) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('operations_persons')
        .insert([{
          email: newPerson.email,
          full_name: newPerson.full_name,
          password_hash: newPerson.password,
          phone_number: newPerson.phone_number || null,
          company_name: newPerson.company_name || null,
          created_by: user?.id
        }]);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Operations person added successfully' });
      setNewPerson({ email: '', full_name: '', password: '', phone_number: '', company_name: '' });
      setShowAddForm(false);
      fetchOperationsPersons();
    } catch (error: any) {
      console.error('Error adding operations person:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to add operations person' });
    }
  };

  const handleEdit = (person: OperationsPerson) => {
    setIsEditing(person.id);
    setEditForm(person);
  };

  const handleSave = async () => {
    if (!isEditing || !editForm.email || !editForm.full_name) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      const { error } = await supabase
        .from('operations_persons')
        .update({
          email: editForm.email,
          full_name: editForm.full_name,
          phone_number: editForm.phone_number,
          company_name: editForm.company_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', isEditing);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Operations person updated successfully' });
      setIsEditing(null);
      setEditForm({});
      fetchOperationsPersons();
    } catch (error: any) {
      console.error('Error updating operations person:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to update operations person' });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('operations_persons')
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: `Operations person ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      fetchOperationsPersons();
    } catch (error: any) {
      console.error('Error toggling status:', error);
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this operations person?')) return;

    try {
      const { error } = await supabase
        .from('operations_persons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Operations person deleted successfully' });
      fetchOperationsPersons();
    } catch (error: any) {
      console.error('Error deleting operations person:', error);
      setMessage({ type: 'error', text: 'Failed to delete operations person' });
    }
  };

  const filteredPersons = operationsPersons.filter(person =>
    person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.company_name && person.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout title="Operations Management" subtitle="Manage operations team members" hideHeader={true}>
      <div className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {message.text}
            </p>
          </div>
        )}

        {/* Header with Search and Add Button */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search operations persons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Operations Person
              </button>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Operations Person</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPerson.full_name}
                    onChange={(e) => setNewPerson({ ...newPerson, full_name: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPerson.password}
                    onChange={(e) => setNewPerson({ ...newPerson, password: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newPerson.phone_number}
                    onChange={(e) => setNewPerson({ ...newPerson, phone_number: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newPerson.company_name}
                    onChange={(e) => setNewPerson({ ...newPerson, company_name: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPerson({ email: '', full_name: '', password: '', phone_number: '', company_name: '' });
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Operations Person
                </button>
              </div>
            </div>
          )}

          {/* Operations Persons List */}
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-slate-600">Loading operations persons...</p>
            </div>
          ) : filteredPersons.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">No operations persons found</h4>
              <p className="text-slate-500 mt-1">
                {searchTerm ? 'Try adjusting your search' : 'Add your first operations person to get started'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPersons.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50">
                      {isEditing === person.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.full_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="tel"
                              value={editForm.phone_number || ''}
                              onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.company_name || ''}
                              onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              editForm.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {editForm.is_active ? 'Active' : 'Inactive'}
                            </span>
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
                            <div className="text-sm font-medium text-slate-900">{person.full_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{person.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{person.phone_number || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900">{person.company_name || '-'}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleActive(person.id, person.is_active)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                person.is_active
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {person.is_active ? (
                                <>
                                  <ShieldCheck className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Shield className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(person)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(person.id)}
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

export default OperationsManagement;
