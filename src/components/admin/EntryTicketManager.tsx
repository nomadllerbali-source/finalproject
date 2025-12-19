import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { EntryTicket } from '../../types';
import { Ticket, Plus, Edit2, Trash2, Save, X, Search, MapPin } from 'lucide-react';
import Layout from '../Layout';
import { handleNumericInput, numericInputProps } from '../../utils/inputHelpers';

const EntryTicketManager: React.FC = () => {
  const { state, addEntryTicket, updateEntryTicketData, deleteEntryTicketData } = useData();
  const { entryTickets, areas = [] } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EntryTicket>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [childSameAsAdult, setChildSameAsAdult] = useState(false);
  const [editChildSameAsAdult, setEditChildSameAsAdult] = useState(false);
  const [newTicket, setNewTicket] = useState<Omit<EntryTicket, 'id'>>({
    name: '',
    adultCost: 0,
    childCost: 0,
    areaId: '',
    areaName: ''
  });

  const filteredTickets = entryTickets.filter(ticket => {
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.areaName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  function getAreaName(areaId?: string): string {
    if (!areaId) return 'All Areas';
    const area = areas.find(a => a.id === areaId);
    return area?.name || 'Unknown Area';
  }

  const handleAdd = async () => {
    const selectedArea = areas.find(a => a.id === newTicket.areaId);
    const ticket: EntryTicket = {
      ...newTicket,
      id: Date.now().toString(),
      areaName: selectedArea?.name || '',
      childCost: childSameAsAdult ? newTicket.adultCost : newTicket.childCost
    };
    await addEntryTicket(ticket);
    setNewTicket({ name: '', adultCost: 0, childCost: 0, areaId: '', areaName: '' });
    setChildSameAsAdult(false);
    setShowAddForm(false);
  };

  const handleEdit = (ticket: EntryTicket) => {
    setIsEditing(ticket.id);
    setEditForm(ticket);
    setEditChildSameAsAdult(ticket.adultCost === ticket.childCost);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      const selectedArea = areas.find(a => a.id === editForm.areaId);
      const updatedTicket = {
        ...editForm,
        areaName: selectedArea?.name || editForm.areaName || '',
        childCost: editChildSameAsAdult ? editForm.adultCost || 0 : editForm.childCost || 0
      };
      await updateEntryTicketData(updatedTicket as EntryTicket);
      setIsEditing(null);
      setEditForm({});
      setEditChildSameAsAdult(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry ticket?')) {
      await deleteEntryTicketData(id);
    }
  };

  return (
    <Layout title="Entry Ticket Management" subtitle="Manage entry tickets for sightseeing locations" hideHeader={true}>
      <div className="space-y-6">
        {/* Search and Add Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Entry Ticket Management</h3>
                <div className="relative max-w-md">
                  <Search className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search entry tickets..."
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
                Add Entry Ticket
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Area
                  </label>
                  <select
                    value={newTicket.areaId}
                    onChange={(e) => setNewTicket({ ...newTicket, areaId: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Areas</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ticket Name
                  </label>
                  <input
                    type="text"
                    value={newTicket.name}
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
                    placeholder="e.g., Temple Entry, Museum Pass"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost for Adults (Rp)
                  </label>
                  <input
                    type="text"
                    value={newTicket.adultCost}
                    onChange={(e) => {
                      const numericValue = handleNumericInput(e.target.value);
                      const value = parseInt(numericValue) || 0;
                      setNewTicket({
                        ...newTicket,
                        adultCost: value,
                        childCost: childSameAsAdult ? value : newTicket.childCost
                      });
                    }}
                    {...numericInputProps}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-slate-700">
                      Cost for Child (Rp)
                    </label>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={childSameAsAdult}
                        onChange={(e) => {
                          setChildSameAsAdult(e.target.checked);
                          if (e.target.checked) {
                            setNewTicket({ ...newTicket, childCost: newTicket.adultCost });
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-600">Same as Adults</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={newTicket.childCost}
                    onChange={(e) => {
                      const numericValue = handleNumericInput(e.target.value);
                      setNewTicket({ ...newTicket, childCost: parseInt(numericValue) || 0 });
                    }}
                    disabled={childSameAsAdult}
                    {...numericInputProps}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setChildSameAsAdult(false);
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTicket.name}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Entry Ticket
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Entry Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">All Entry Tickets</h3>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h4 className="text-slate-900 font-medium">
                {searchTerm ? 'No entry tickets found' : 'No entry tickets yet'}
              </h4>
              <p className="text-slate-500 mt-1">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first entry ticket to get started.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ticket Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Adult Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Child Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      {isEditing === ticket.id ? (
                        <>
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Area</label>
                                  <select
                                    value={editForm.areaId || ''}
                                    onChange={(e) => setEditForm({ ...editForm, areaId: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                  >
                                    <option value="">All Areas</option>
                                    {areas.map(area => (
                                      <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Ticket Name</label>
                                  <input
                                    type="text"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost for Adults (Rp)</label>
                                  <input
                                    type="text"
                                    value={editForm.adultCost || 0}
                                    onChange={(e) => {
                                      const numericValue = handleNumericInput(e.target.value);
                                      const value = parseInt(numericValue) || 0;
                                      setEditForm({
                                        ...editForm,
                                        adultCost: value,
                                        childCost: editChildSameAsAdult ? value : editForm.childCost
                                      });
                                    }}
                                    {...numericInputProps}
                                    className="w-full p-2 border border-slate-300 rounded-lg"
                                  />
                                </div>
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Cost for Child (Rp)</label>
                                    <label className="flex items-center space-x-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={editChildSameAsAdult}
                                        onChange={(e) => {
                                          setEditChildSameAsAdult(e.target.checked);
                                          if (e.target.checked) {
                                            setEditForm({ ...editForm, childCost: editForm.adultCost });
                                          }
                                        }}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-slate-600">Same as Adults</span>
                                    </label>
                                  </div>
                                  <input
                                    type="text"
                                    value={editForm.childCost || 0}
                                    onChange={(e) => {
                                      const numericValue = handleNumericInput(e.target.value);
                                      setEditForm({ ...editForm, childCost: parseInt(numericValue) || 0 });
                                    }}
                                    disabled={editChildSameAsAdult}
                                    {...numericInputProps}
                                    className="w-full p-2 border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={handleSave}
                                  className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setIsEditing(null);
                                    setEditForm({});
                                    setEditChildSameAsAdult(false);
                                  }}
                                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Ticket className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">{ticket.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-900">{getAreaName(ticket.areaId)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            Rp {ticket.adultCost.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            Rp {ticket.childCost.toLocaleString('id-ID')}
                            {ticket.adultCost === ticket.childCost && (
                              <span className="ml-2 text-xs text-slate-500">(Same as adults)</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(ticket)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(ticket.id)}
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

export default EntryTicketManager;