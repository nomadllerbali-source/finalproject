import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { EntryTicket } from '../../types';
import { Ticket, Plus, Edit2, Trash2, Save, X, Search, MapPin } from 'lucide-react';
import Layout from '../Layout';

const EntryTicketManager: React.FC = () => {
  const { state, addEntryTicket, updateEntryTicketData, deleteEntryTicketData } = useData();
  const { entryTickets, sightseeings } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EntryTicket>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTicket, setNewTicket] = useState<Omit<EntryTicket, 'id'>>({
    name: '',
    cost: 0,
    sightseeingId: ''
  });

  const filteredTickets = entryTickets.filter(ticket =>
    ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSightseeingName(ticket.sightseeingId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  function getSightseeingName(sightseeingId: string): string {
    const sightseeing = sightseeings.find(s => s.id === sightseeingId);
    return sightseeing ? sightseeing.name : 'Unknown Location';
  }

  const handleAdd = async () => {
    const ticket: EntryTicket = {
      ...newTicket,
      id: Date.now().toString()
    };
    await addEntryTicket(ticket);
    setNewTicket({ name: '', cost: 0, sightseeingId: '' });
    setShowAddForm(false);
  };

  const handleEdit = (ticket: EntryTicket) => {
    setIsEditing(ticket.id);
    setEditForm(ticket);
  };

  const handleSave = async () => {
    if (isEditing && editForm.id) {
      await updateEntryTicketData(editForm as EntryTicket);
      setIsEditing(null);
      setEditForm({});
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cost per Person (Rp)
                  </label>
                  <input
                    type="number"
                    value={newTicket.cost}
                    onChange={(e) => setNewTicket({ ...newTicket, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Sightseeing Location
                  </label>
                  <select
                    value={newTicket.sightseeingId}
                    onChange={(e) => setNewTicket({ ...newTicket, sightseeingId: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select location</option>
                    {sightseeings.map(sight => (
                      <option key={sight.id} value={sight.id}>{sight.name}</option>
                    ))}
                  </select>
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
                  disabled={!newTicket.name || !newTicket.sightseeingId}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cost/Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      {isEditing === ticket.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editForm.sightseeingId || ''}
                              onChange={(e) => setEditForm({ ...editForm, sightseeingId: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              <option value="">Select location</option>
                              {sightseeings.map(sight => (
                                <option key={sight.id} value={sight.id}>{sight.name}</option>
                              ))}
                            </select>
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
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <Ticket className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-slate-900">{ticket.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-900">{getSightseeingName(ticket.sightseeingId)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            Rp {ticket.cost.toLocaleString('id-ID')}
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