import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MessageSquare, CheckCircle, FileText } from 'lucide-react';
import { SalesClient, updateSalesClient, createFollowUpHistory, getLatestItineraryVersion, getItineraryVersionsByClient, ItineraryVersion, createPackageAssignmentAndChecklist } from '../../lib/salesHelpers';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../Layout';

interface FollowUpManagerProps {
  client: SalesClient;
  onBack: () => void;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({ client, onBack }) => {
  const { state: authState } = useAuth();
  const [formData, setFormData] = useState({
    status: getNextStatus(client.current_follow_up_status),
    remarks: '',
    nextFollowUpDate: '',
    nextFollowUpTime: '10:00'
  });
  const [saving, setSaving] = useState(false);
  const [latestVersionNumber, setLatestVersionNumber] = useState<number | null>(null);
  const [versions, setVersions] = useState<ItineraryVersion[]>([]);
  const [showVersionSelector, setShowVersionSelector] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');

  useEffect(() => {
    loadVersions();
  }, [client.id]);

  const loadVersions = async () => {
    try {
      const allVersions = await getItineraryVersionsByClient(client.id);
      setVersions(allVersions);

      const version = await getLatestItineraryVersion(client.id);
      if (version) {
        setLatestVersionNumber(version.version_number);
        setSelectedVersionId(version.id);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

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

    // Handle version selection for confirmed bookings
    if (formData.status === 'advance-paid-confirmed') {
      if (versions.length > 1) {
        // Show version selector modal if multiple versions exist
        setShowVersionSelector(true);
        return;
      }
      // Auto-select the only version if there's just one and proceed
      if (versions.length === 1) {
        if (!selectedVersionId) {
          setSelectedVersionId(versions[0].id);
        }
        // Call confirmFollowUp after ensuring version is selected
        await confirmFollowUp();
        return;
      }
      // No versions available
      if (versions.length === 0) {
        alert('No itinerary versions found for this client.');
        setSaving(false);
        return;
      }
    }

    await confirmFollowUp();
  };

  const confirmFollowUp = async () => {
    setSaving(true);
    try {
      const userId = authState.user?.id;
      if (!userId) {
        throw new Error('User must be authenticated');
      }

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

      if (formData.status === 'advance-paid-confirmed' && selectedVersionId) {
        updateData.confirmed_version_id = selectedVersionId;
      }

      await updateSalesClient(client.id, updateData);

      const selectedVersion = versions.find(v => v.id === selectedVersionId);

      await createFollowUpHistory({
        client_id: client.id,
        sales_person_id: client.sales_person_id,
        status: formData.status,
        remarks: formData.remarks,
        next_follow_up_date: requiresFollowUp ? formData.nextFollowUpDate : undefined,
        next_follow_up_time: requiresFollowUp ? formData.nextFollowUpTime : undefined,
        itinerary_version_number: selectedVersion?.version_number || latestVersionNumber || undefined,
        created_by: userId
      });

      if (formData.status === 'advance-paid-confirmed') {
        console.log('🔵 Confirming booking with version:', selectedVersionId);
        console.log('🔵 Selected version object:', selectedVersion);
        console.log('🔵 All versions:', versions);

        const result = await createPackageAssignmentAndChecklist(
          client.id,
          client.sales_person_id,
          selectedVersionId
        );

        if (!result.success) {
          alert(`Failed to create assignment: ${result.error}`);
          setSaving(false);
          return;
        }

        if (result.alreadyExists) {
          alert(`Status updated. Assignment already exists.\n\nRemarks: ${formData.remarks}`);
        } else {
          alert(`Booking confirmed!\n\nVersion ${selectedVersion?.version_number || latestVersionNumber} has been sent to Operations.\n\nRemarks: ${formData.remarks}`);
        }
      } else {
        alert(`Follow-up updated to: ${formData.status.replace(/-/g, ' ').toUpperCase()}\n\nRemarks: ${formData.remarks}`);
      }

      setShowVersionSelector(false);
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
          <div className="flex items-center space-x-3 mb-3">
            <div className="inline-block px-4 py-2 bg-slate-100 rounded-lg">
              <span className="text-slate-700 font-medium">
                {client.current_follow_up_status.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>
            {latestVersionNumber && (
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg">
                <FileText className="h-4 w-4 mr-1.5" />
                <span className="text-sm font-medium">Current: v{latestVersionNumber}</span>
              </div>
            )}
          </div>
          {client.next_follow_up_date && (
            <div className="mt-3 text-sm text-slate-600">
              Next follow-up: {new Date(client.next_follow_up_date).toLocaleDateString()}
              {client.next_follow_up_time && ` at ${client.next_follow_up_time}`}
            </div>
          )}
          {latestVersionNumber && (
            <div className="mt-2 text-xs text-slate-500">
              This follow-up will be linked to itinerary version {latestVersionNumber}
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

      {/* Version Selector Modal */}
      {showVersionSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Select Itinerary Version</h3>
              <p className="text-sm text-slate-600 mt-1">Choose which version to confirm for operations</p>
            </div>

            <div className="p-6 space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  onClick={() => setSelectedVersionId(version.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedVersionId === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-slate-900">Version {version.version_number}</span>
                        {version.version_number === latestVersionNumber && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">Latest</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Created: {new Date(version.created_at).toLocaleString()}
                      </p>
                      {version.notes && (
                        <p className="text-sm text-slate-700 mt-2">
                          <span className="font-medium">Notes:</span> {version.notes}
                        </p>
                      )}
                    </div>
                    {selectedVersionId === version.id && (
                      <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-slate-200 flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setShowVersionSelector(false);
                  setSaving(false);
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmFollowUp}
                disabled={!selectedVersionId || saving}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-medium disabled:opacity-50"
              >
                {saving ? 'Confirming...' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FollowUpManager;
