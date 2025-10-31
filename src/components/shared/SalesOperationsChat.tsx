import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getChatMessages,
  sendChatMessage,
  subscribeToAssignmentChat,
  markMessagesAsRead,
  ChatMessage
} from '../../lib/operationsHelpers';
import { getAssignmentForClient } from '../../lib/operationsHelpers';

interface SalesOperationsChatProps {
  clientId: string;
  clientName: string;
  onClose: () => void;
}

const SalesOperationsChat: React.FC<SalesOperationsChatProps> = ({
  clientId,
  clientName,
  onClose
}) => {
  const { state: authState } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [userType, setUserType] = useState<'sales' | 'operations' | null>(null);
  const [userName, setUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatData();
  }, [clientId, authState.user]);

  const loadChatData = async () => {
    if (!authState.user?.id) return;

    try {
      setLoading(true);

      const assignment = await getAssignmentForClient(clientId);
      if (!assignment) {
        console.error('No assignment found for this client');
        setLoading(false);
        return;
      }

      setAssignmentId(assignment.id);

      const isSales = assignment.sales_person_id === authState.user.id;
      const isOperations = assignment.operations_person_id === authState.user.id;

      if (isSales) {
        setUserType('sales');
        setUserName(authState.user.email || 'Sales Person');
      } else if (isOperations) {
        setUserType('operations');
        setUserName(authState.user.email || 'Operations Person');
      }

      const chatMessages = await getChatMessages(assignment.id);
      setMessages(chatMessages);

      await markMessagesAsRead(assignment.id, authState.user.id);

      const subscription = subscribeToAssignmentChat(assignment.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        if (newMessage.sender_id !== authState.user.id) {
          markMessagesAsRead(assignment.id, authState.user.id);
        }
      });

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !assignmentId || !userType || !authState.user?.id) return;

    setSending(true);
    try {
      await sendChatMessage(
        assignmentId,
        authState.user.id,
        userType,
        userName,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-teal-600 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Chat with {userType === 'sales' ? 'Operations' : 'Sales'}
              </h3>
              <p className="text-sm text-blue-100">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-slate-600">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h4 className="text-slate-900 font-medium mb-2">No messages yet</h4>
                <p className="text-slate-500 text-sm">Start a conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwnMessage = msg.sender_id === authState.user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isOwnMessage
                          ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-900'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-xs font-semibold ${
                            msg.sender_type === 'sales' ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {msg.sender_type === 'sales' ? 'Sales' : 'Operations'}
                          </span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-white rounded-b-xl">
          <div className="flex space-x-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              disabled={sending || !assignmentId}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || !assignmentId}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
            >
              {sending ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          {!assignmentId && !loading && (
            <p className="text-xs text-red-600 mt-2">
              No assignment found. This client may not be confirmed yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesOperationsChat;
