import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Car, Camera, Ticket, Utensils, MapPin, Check, Save, MessageCircle, Send } from 'lucide-react';
import {
  getChecklistItems,
  updateChecklistItem,
  getChatMessages,
  sendChatMessage,
  subscribeToAssignmentChat,
  getAssignmentDetails,
  ChecklistItem,
  ChatMessage
} from '../../lib/operationsHelpers';

interface PackageChecklistProps {
  assignmentId: string;
  operationsPersonId: string;
  onBack: () => void;
}

const PackageChecklist: React.FC<PackageChecklistProps> = ({ assignmentId, operationsPersonId, onBack }) => {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{booking_reference: string; notes: string}>({
    booking_reference: '',
    notes: ''
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [assignmentData, setAssignmentData] = useState<any>(null);
  const [operationsPersonName, setOperationsPersonName] = useState('Operations');

  useEffect(() => {
    fetchChecklistItems();
    fetchAssignmentData();
    fetchChatMessages();

    const subscription = subscribeToAssignmentChat(assignmentId, (newMsg) => {
      setChatMessages(prev => [...prev, newMsg]);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      const data = await getAssignmentDetails(assignmentId);
      setAssignmentData(data);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
    }
  };

  const fetchChecklistItems = async () => {
    try {
      setLoading(true);
      const items = await getChecklistItems(assignmentId);
      setChecklistItems(items);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const messages = await getChatMessages(assignmentId);
      setChatMessages(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  const handleToggleComplete = async (itemId: string, currentStatus: boolean) => {
    try {
      setSaving(true);
      await updateChecklistItem(itemId, {
        is_completed: !currentStatus,
        completed_at: !currentStatus ? new Date().toISOString() : null,
        completed_by: !currentStatus ? operationsPersonId : null
      } as any);

      setMessage({ type: 'success', text: 'Item updated successfully' });
      fetchChecklistItems();
    } catch (error: any) {
      console.error('Error updating item:', error);
      setMessage({ type: 'error', text: 'Failed to update item' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditForm({
      booking_reference: item.booking_reference || '',
      notes: item.notes || ''
    });
  };

  const handleSaveEdit = async (itemId: string) => {
    try {
      setSaving(true);
      await updateChecklistItem(itemId, {
        booking_reference: editForm.booking_reference || null,
        notes: editForm.notes || null
      } as any);

      setMessage({ type: 'success', text: 'Details saved successfully' });
      setEditingItem(null);
      fetchChecklistItems();
    } catch (error: any) {
      console.error('Error saving details:', error);
      setMessage({ type: 'error', text: 'Failed to save details' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !assignmentData) return;

    try {
      await sendChatMessage(
        assignmentId,
        operationsPersonId,
        'operations',
        operationsPersonName,
        newMessage.trim()
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'hotel':
        return <Building2 className="h-5 w-5" />;
      case 'transportation':
        return <Car className="h-5 w-5" />;
      case 'activity':
        return <Camera className="h-5 w-5" />;
      case 'entry_ticket':
        return <Ticket className="h-5 w-5" />;
      case 'meal':
        return <Utensils className="h-5 w-5" />;
      case 'sightseeing':
        return <MapPin className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'hotel':
        return 'bg-blue-100 text-blue-700';
      case 'transportation':
        return 'bg-green-100 text-green-700';
      case 'activity':
        return 'bg-purple-100 text-purple-700';
      case 'entry_ticket':
        return 'bg-orange-100 text-orange-700';
      case 'meal':
        return 'bg-pink-100 text-pink-700';
      case 'sightseeing':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const groupedItems = checklistItems.reduce((acc, item) => {
    const day = item.day_number || 0;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {} as Record<number, ChecklistItem[]>);

  const completedCount = checklistItems.filter(item => item.is_completed).length;
  const totalCount = checklistItems.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Loading checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat with Sales
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Package Booking Checklist</h2>
            {assignmentData?.sales_person && (
              <p className="text-slate-600 mt-1">
                Sales Person: {assignmentData.sales_person.full_name}
              </p>
            )}
            {assignmentData?.sales_client && (
              <p className="text-slate-600">
                Client: {assignmentData.sales_client.name}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-orange-600">{progress}%</p>
            <p className="text-sm text-slate-600">{completedCount} / {totalCount} completed</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                progress === 100 ? 'bg-green-600' : 'bg-orange-600'
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            {message.text}
          </p>
        </div>
      )}

      {showChat && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Chat with Sales Team</h3>

          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            {chatMessages.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No messages yet. Start the conversation!</p>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'operations' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.sender_type === 'operations'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender_type === 'operations' ? 'text-orange-100' : 'text-slate-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600">No checklist items found</p>
          </div>
        ) : (
          Object.entries(groupedItems)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, items]) => (
              <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {day === '0' ? 'General Items' : `Day ${day}`}
                </h3>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`border-2 rounded-lg p-4 transition-colors ${
                        item.is_completed ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(item.id, item.is_completed)}
                          disabled={saving}
                          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.is_completed
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-slate-300 hover:border-orange-600'
                          }`}
                        >
                          {item.is_completed && <Check className="h-4 w-4" />}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getItemColor(item.item_type)}`}>
                              {getItemIcon(item.item_type)}
                              {item.item_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>

                          <h4 className={`font-medium ${item.is_completed ? 'text-green-900 line-through' : 'text-slate-900'}`}>
                            {item.item_name}
                          </h4>

                          {editingItem === item.id ? (
                            <div className="mt-3 space-y-2">
                              <input
                                type="text"
                                value={editForm.booking_reference}
                                onChange={(e) => setEditForm({ ...editForm, booking_reference: e.target.value })}
                                placeholder="Booking reference number"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                              <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                placeholder="Add notes..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(item.id)}
                                  disabled={saving}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingItem(null)}
                                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 space-y-1">
                              {item.booking_reference && (
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Reference:</span> {item.booking_reference}
                                </p>
                              )}
                              {item.notes && (
                                <p className="text-sm text-slate-600">
                                  <span className="font-medium">Notes:</span> {item.notes}
                                </p>
                              )}
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                {item.booking_reference || item.notes ? 'Edit details' : 'Add booking details'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default PackageChecklist;
