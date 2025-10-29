import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';

// Separate Apps
import AdminApp from './components/admin/AdminApp';
import AgentApp from './components/agent/AgentApp';
import SalesApp from './components/sales/SalesApp';
import OperationsApp from './components/operations/OperationsApp';

function AppContent() {
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
      <AppContent />
    </AuthProvider>
  );
}

export default App;