import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, XCircle, Loader, Database, AlertTriangle } from 'lucide-react';

const SupabaseConnectionButton: React.FC = () => {
  const { state } = useData();
  const { state: authState } = useAuth();
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');

  // Check connection status on mount and when auth state changes
  useEffect(() => {
    const checkConnection = async () => {
      if (!isSupabaseConfigured()) {
        setStatus('idle');
        return;
      }

      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          setStatus('connected');
          setMessage('Connected to Supabase');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
      }
    };

    checkConnection();
  }, [authState.isAuthenticated]);

  const handleConnectToSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setStatus('error');
      setMessage('Supabase is not configured');
      setErrorDetails('Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
      return;
    }

    setStatus('connecting');
    setMessage('Testing connection...');
    setErrorDetails('');

    try {
      // Test connection by checking auth session
      const { data: { session }, error: sessionError } = await supabase!.auth.getSession();

      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      // Test database connection
      const { error: dbError } = await supabase!
        .from('profiles')
        .select('count')
        .limit(1);

      if (dbError) {
        throw new Error(`Database connection error: ${dbError.message}`);
      }

      setStatus('connected');
      setMessage('Successfully connected to Supabase');

    } catch (error: any) {
      setStatus('error');
      setMessage('Connection failed');
      setErrorDetails(error.message || error.toString());
      console.error('Supabase connection failed:', error);
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
      status === 'connected' ? 'bg-green-50 border-green-200' :
      status === 'error' ? 'bg-red-50 border-red-200' :
      status === 'connecting' ? 'bg-blue-50 border-blue-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Database className={`h-5 w-5 flex-shrink-0 ${
            status === 'connected' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            status === 'connecting' ? 'text-blue-600' :
            'text-blue-600'
          }`} />
          <div className="min-w-0 flex-1">
            <h4 className={`font-medium ${
              status === 'connected' ? 'text-green-800' :
              status === 'error' ? 'text-red-800' :
              status === 'connecting' ? 'text-blue-800' :
              'text-blue-800'
            }`}>
              {status === 'connected' ? 'Connected to Supabase' :
               status === 'error' ? 'Connection Failed' :
               status === 'connecting' ? 'Connecting...' :
               'Supabase Database'}
            </h4>
            <p className={`text-sm mt-1 ${
              status === 'connected' ? 'text-green-700' :
              status === 'error' ? 'text-red-700' :
              status === 'connecting' ? 'text-blue-700' :
              'text-blue-700'
            }`}>
              {message || (status === 'idle' ? 'Test your Supabase connection' : '')}
            </p>
            {errorDetails && (
              <p className="text-xs mt-1 text-red-600 break-words">
                {errorDetails}
              </p>
            )}
          </div>
        </div>

        {(status === 'idle' || status === 'connected') && (
          <button
            onClick={handleConnectToSupabase}
            className={`px-4 py-2 rounded-lg transition-colors flex-shrink-0 ml-4 ${
              status === 'connected'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {status === 'connected' ? 'Test Again' : 'Test Connection'}
          </button>
        )}

        {status === 'connecting' && (
          <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
            <Loader className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-blue-700 text-sm">Testing...</span>
          </div>
        )}

        {status === 'error' && (
          <button
            onClick={handleConnectToSupabase}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex-shrink-0 ml-4"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default SupabaseConnectionButton;