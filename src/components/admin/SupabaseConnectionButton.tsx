import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Loader, Database, AlertTriangle } from 'lucide-react';

const SupabaseConnectionButton: React.FC = () => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleConnectToSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setMessage('Supabase is not configured. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      return;
    }

    setStatus('connecting');
    setMessage('Connecting to Supabase...');

    try {
      // Test connection by fetching user
      const { data: { user }, error: userError } = await supabase!.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }

      // Test database connection by fetching profiles
      const { data: profiles, error: profilesError } = await supabase!.from('profiles').select('count').single();
      
      if (profilesError) {
        throw new Error(`Database connection error: ${profilesError.message}`);
      }

      setStatus('success');
      setMessage('Successfully connected to Supabase! Your data will now be stored in the cloud database.');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error: any) {
      setStatus('error');
      setMessage(`Connection failed: ${error.message || error.toString()}`);
      console.error('Supabase connection failed:', error);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-yellow-800 font-medium">Supabase Not Configured</h4>
            <p className="text-yellow-700 text-sm mt-1">
              To enable cloud database features, please add your Supabase project URL and Anon Key to your <code className="bg-yellow-200 px-1 rounded">.env</code> file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 mb-6 ${
      status === 'success' ? 'bg-green-50 border-green-200' :
      status === 'error' ? 'bg-red-50 border-red-200' :
      status === 'connecting' ? 'bg-blue-50 border-blue-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className={`h-5 w-5 flex-shrink-0 ${
            status === 'success' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            status === 'connecting' ? 'text-blue-600' :
            'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-medium ${
              status === 'success' ? 'text-green-800' :
              status === 'error' ? 'text-red-800' :
              status === 'connecting' ? 'text-blue-800' :
              'text-blue-800'
            }`}>
              {status === 'success' ? 'Connected to Supabase' :
               status === 'error' ? 'Connection Failed' :
               status === 'connecting' ? 'Connecting...' :
               'Supabase Ready'}
            </h4>
            <p className={`text-sm mt-1 ${
              status === 'success' ? 'text-green-700' :
              status === 'error' ? 'text-red-700' :
              status === 'connecting' ? 'text-blue-700' :
              'text-blue-700'
            }`}>
              {message || (status === 'idle' ? 'Click to test your Supabase connection and enable cloud database features.' : '')}
            </p>
          </div>
        </div>
        
        {status === 'idle' && (
          <button
            onClick={handleConnectToSupabase}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
          >
            Connect to Supabase
          </button>
        )}
        
        {status === 'connecting' && (
          <div className="flex items-center space-x-2">
            <Loader className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-blue-700 text-sm">Testing connection...</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-700 text-sm font-medium">Connected</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex items-center space-x-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <button
              onClick={handleConnectToSupabase}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnectionButton;