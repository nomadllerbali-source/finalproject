import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { SalesClient, updateSalesClient } from '../../lib/salesHelpers';
import Layout from '../Layout';

interface FollowUpManagerProps {
  client: SalesClient;
  onBack: () => void;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({ client, onBack }) => {
  const [formData, setFormData] = useState({
    status: getNextStatus(client.current_follow_up_status),
    remarks: '',
    nextFollowUpDate: '',
    nextFollowUpTime: '10:00'
  });
  const [saving, setSaving] = useState(false);

  function getNextStatus(currentStatus: string): string {
    const statusFlow = [
      'itinerary-created',
      'itinerary-sent',
      '1st-follow-up',
      '2nd-follow-up',
      '3rd-follow-up',
      '4th-follow-up',
      'itinerary-edited',
      'updated-itinerary-sent',
      'advance-paid-confirmed',
      'dead'
    ];

    const followUpStatuses = ['1st-follow-up', '2nd-follow-up', '3rd-follow-up', '4th-follow-up'];

    if (followUpStatuses.includes(currentStatus)) {
      const currentIndex = followUpStatuses.indexOf(currentStatus);
      if (currentIndex < followUpStatuses.length - 1) {
        return followUpStatuses[currentIndex + 1];
      }
    }

    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }

    return currentStatus;
  }

  const allStatuses = [
    { value: '1st-follow-up', label: '1st Follow Up' },
    { value: '2nd-follow-up', label: '2nd Follow Up' },
    { value: '3rd-follow-up', label: '3rd Follow Up' },
    { value: '4th-follow-up', label: '4th Follow Up' },
    { value: 'itinerary-created', label: 'Itinerary Created' },
    { value: 'itinerary-sent', label: 'Itinerary Sent' },
    { value: 'itinerary-edited', label: 'Itinerary Edited' },
    { value: 'updated-itinerary-sent', label: 'Updated Itinerary Sent' },
    { value: 'advance-paid-confirmed', label: 'Advance Paid & Confirmed' },
    { value: 'dead', label: 'Dead' }
  ];

  const statusesWithoutFollowUp = ['advance-paid-confirmed', 'dead'];
  const requiresFollowUp = !statusesWithoutFollowUp.includes(formData.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.remarks.trim()) {
      alert('Remarks are mandatory');
      return;
    }

    if (requiresFollowUp && (!formData.nextFollowUpDate || !formData.nextFollowUpTime)) {
      alert('Next follow-up date and time are required for this status');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        current_follow_up_status: formData.status
      };

      if (requiresFollowUp) {
        updateData.next_follow_up_date = formData.nextFollowUpDate;
        updateData.next_follow_up_time = formData.nextFollowUpTime;
      } else {
        updateData.next_follow_up_date = null;
        updateData.next_follow_up_time = null;
      }

      await updateSalesClient(client.id, updateData);

      alert(`Follow-up updated to: ${formData.status.replace(/-/g, ' ').toUpperCase()}\n\nRemarks: ${formData.remarks}`);
      onBack();
    } catch (error) {
      console.error('Error updating follow-up:', error);
      alert('Failed to update follow-up. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Follow-up Management" subtitle={client.name}>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {/* Current Status */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Current Status</h3>
          <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg">
            <span className="text-slate-700 font-medium">
              {client.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}
            </span>
          </div>
          {client.next_follow_up_date && (
            <div className="mt-3 text-sm text-slate-600">
              Next follow-up: {new Date(client.next_follow_up_date).toLocaleDateString()}
              {client.next_follow_up_time && ` at ${client.next_follow_up_time}`}
            </div>
          )}
        </div>

        {/* Follow-up Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Update Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {allStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-slate-500">
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Suggested next status based on workflow
            </p>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Enter detailed remarks about this follow-up..."
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Add notes about client conversation, concerns, or next steps
            </p>
          </div>

          {/* Next Follow-up Date & Time */}
          {requiresFollowUp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-4">
                Schedule Next Follow-up <span className="text-red-500">*</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.nextFollowUpTime}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {!requiresFollowUp && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ℹ️ No follow-up scheduling required for status: <strong>{formData.status.replace(/-/g, ' ').toUpperCase()}</strong>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Follow-up'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default FollowUpManager;
