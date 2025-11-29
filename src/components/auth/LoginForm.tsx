import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Lock, User, Eye, EyeOff, AlertCircle, UserPlus, Mail, ArrowLeft } from 'lucide-react';
import AgentRegistration from './AgentRegistration';
import ForgotPassword from './ForgotPassword';
import SignUpForm from './SignUpForm';

type AuthView = 'login' | 'register' | 'forgot' | 'signup';

const LoginForm: React.FC = () => {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleDemoLogin = (role: 'admin' | 'agent' | 'sales') => {
    if (role === 'admin') {
      setFormData({ email: 'admin@nomadller.com', password: 'admin123' });
    } else if (role === 'agent') {
      setFormData({ email: 'agent@nomadller.com', password: 'agent123' });
    } else if (role === 'sales') {
      setFormData({ email: 'sales@nomadller.com', password: 'sales123' });
    }
  };

  const handleRegistrationSuccess = () => {
    setCurrentView('login');
    // You could also set a success message here
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setError('');
  };

  // Render different views based on current state
  if (currentView === 'register') {
    return <AgentRegistration onBack={handleBackToLogin} onSuccess={handleRegistrationSuccess} />;
  }

  if (currentView === 'forgot') {
    return <ForgotPassword onBack={handleBackToLogin} />;
  }

  if (currentView === 'signup') {
    return <SignUpForm onBack={handleBackToLogin} onSuccess={handleRegistrationSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 md:px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Nomadller Solution</h1>
                <p className="text-blue-100 mt-1 text-sm md:text-base">Travel Agency Management</p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="p-6 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-slate-600 mt-2 text-sm md:text-base">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    placeholder="Enter your email address"
                    disabled={state.isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm md:text-base"
                    placeholder="Enter your password"
                    disabled={state.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={state.isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentView('forgot')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  disabled={state.isLoading}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={state.isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 text-sm md:text-base"
              >
                {state.isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Agent Registration Link */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-slate-600 text-sm mb-3">
                  Are you a travel agency?
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('register')}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 text-sm md:text-base flex items-center justify-center space-x-2"
                  disabled={state.isLoading}
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register as Travel Agent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;