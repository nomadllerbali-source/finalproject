import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/landing/LandingPage';
import LoginForm from './components/auth/LoginForm';
import GuestAuth from './components/guest/GuestAuth';
import GuestDashboard from './components/guest/GuestDashboard';

// Separate Apps
import AdminApp from './components/admin/AdminApp';
import AgentApp from './components/agent/AgentApp';
import SalesApp from './components/sales/SalesApp';
import OperationsApp from './components/operations/OperationsApp';

function ProtectedAppRoute() {
  const { state: authState } = useAuth();

  // Show login form if not authenticated
  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

  // Route to appropriate app based on user role
  if (authState.user?.role === 'admin') {
    return <AdminApp />;
  } else if (authState.user?.role === 'agent') {
    return <AgentApp />;
  } else if (authState.user?.role === 'sales') {
    return <SalesApp />;
  } else if (authState.user?.role === 'operations') {
    return <OperationsApp />;
  }

  // Fallback (shouldn't happen)
  return <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<ProtectedAppRoute />} />
        <Route path="/guest-auth" element={<GuestAuth />} />
        <Route path="/guest-dashboard" element={<GuestDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;