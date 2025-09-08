import React, { useState } from 'react';
import { Client, FollowUpStatus } from '../../types';
import { X, Save, MessageCircle, Calendar, Clock, AlertCircle, Phone } from 'lucide-react';

interface FollowUpModalProps {
  client: Client;
  onClose: () => void;
  onSave: (
    clientId: string, 
    status: FollowUpStatus['status'], 
    remarks: string,
    nextFollowUpDate?: string,
    nextFollowUpTime?: string
  ) => void;
}

const FollowUpModal: React.FC<FollowUpModalProps> = ({ client, onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus['status']>(
    client.followUpStatus?.status || 'itinerary-created'
  );
  const [remarks, setRemarks] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getNextFollowUpStatus = (currentStatus: FollowUpStatus['status']): FollowUpStatus['status'][] => {
    const allStatuses: FollowUpStatus['status'][] = [
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

    // Auto-logic for follow-ups
    if (currentStatus === 'itinerary-created' || currentStatus === 'itinerary-sent') {
      return ['itinerary-sent', '1st-follow-up', 'itinerary-edited', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === '1st-follow-up') {
      return ['2nd-follow-up', 'itinerary-edited', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === '2nd-follow-up') {
      return ['3rd-follow-up', 'itinerary-edited', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === '3rd-follow-up') {
      return ['4th-follow-up', 'itinerary-edited', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === '4th-follow-up') {
      return ['itinerary-edited', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === 'itinerary-edited') {
      return ['updated-itinerary-sent', 'advance-paid-confirmed', 'dead'];
    }
    if (currentStatus === 'updated-itinerary-sent') {
      return ['1st-follow-up', 'advance-paid-confirmed', 'dead'];
    }

    return allStatuses;
  };

  const getStatusLabel = (status: FollowUpStatus['status']) => {
    switch (status) {
      case 'itinerary-created': return 'Itinerary Created';
      case 'itinerary-sent': return 'Itinerary Sent';
      case '1st-follow-up': return '1st Follow Up';
      case '2nd-follow-up': return '2nd Follow Up';
      case '3rd-follow-up': return '3rd Follow Up';
      case '4th-follow-up': return '4th Follow Up';
      case 'itinerary-edited': return 'Itinerary Edited';
      case 'updated-itinerary-sent': return 'Updated Itinerary Sent';
      case 'advance-paid-confirmed': return 'Advance Paid & Confirmed';
      case 'dead': return 'Dead';
    }
  };

  const requiresFollowUpDate = (status: FollowUpStatus['status']) => {
    return !['advance-paid-confirmed', 'dead'].includes(status);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!remarks.trim()) {
      newErrors.remarks = 'Remarks are required';
    }

    if (requiresFollowUpDate(selectedStatus)) {
      if (!nextFollowUpDate) {
        newErrors.nextFollowUpDate = 'Next follow-up date is required';
      }
      if (!nextFollowUpTime) {
        newErrors.nextFollowUpTime = 'Next follow-up time is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(
      client.id,
      selectedStatus,
      remarks,
      requiresFollowUpDate(selectedStatus) ? nextFollowUpDate : undefined,
      requiresFollowUpDate(selectedStatus) ? nextFollowUpTime : undefined
    );
    onClose();
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(
      `Hello ${client.name}! This is regarding your ${client.numberOfDays}-day travel package. How can I assist you today?`
    );
    const whatsappUrl = `https://wa.me/${client.countryCode.replace('+', '')}${client.whatsapp}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const availableStatuses = getNextFollowUpStatus(client.followUpStatus?.status || 'itinerary-created');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Follow-up Management</h3>
              <p className="text-slate-500 text-sm">Update follow-up status for {client.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-2">Current Status</h4>
            <p className="text-slate-700">
              {getStatusLabel(client.followUpStatus?.status || 'itinerary-created')}
            </p>
            {client.followUpStatus?.remarks && (
              <p className="text-sm text-slate-600 mt-1">
                Last remarks: {client.followUpStatus.remarks}
              </p>
            )}
          </div>

          {/* Update Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Update Follow-up Status *
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as FollowUpStatus['status'])}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Remarks *
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                errors.remarks ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
              }`}
              placeholder="Enter detailed remarks about this follow-up..."
            />
            {errors.remarks && (
              <p className="text-red-600 text-sm mt-1">{errors.remarks}</p>
            )}
          </div>

          {/* Next Follow-up Date & Time */}
          {requiresFollowUpDate(selectedStatus) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Follow-up Date *
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.nextFollowUpDate ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.nextFollowUpDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.nextFollowUpDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Next Follow-up Time *
                </label>
                <input
                  type="time"
                  value={nextFollowUpTime}
                  onChange={(e) => setNextFollowUpTime(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.nextFollowUpTime ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
                {errors.nextFollowUpTime && (
                  <p className="text-red-600 text-sm mt-1">{errors.nextFollowUpTime}</p>
                )}
              </div>
            </div>
          )}

          {/* Final Status Info */}
          {!requiresFollowUpDate(selectedStatus) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-blue-900 font-medium">Final Status</p>
                  <p className="text-blue-700 text-sm">
                    This status doesn't require a follow-up date as it represents a final outcome.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={handleWhatsAppChat}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Start Conversation
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Update Follow-up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;