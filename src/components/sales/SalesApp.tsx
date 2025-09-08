import React, { useState } from 'react';
import { DataProvider } from '../../contexts/DataContext';

// Sales Components
import SalesDashboard from './SalesDashboard';
import SalesGuestManagement from './SalesGuestManagement';

// Itinerary Builder (Sales version)
import SalesItineraryBuilder from '../itinerary/SalesItineraryBuilder';

// Navigation
import { 
  Home, Plus, Menu, X, Users, LogOut, TrendingUp, UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type SalesSection = 'dashboard' | 'itinerary' | 'guests';

const SalesApp: React.FC = () => {
  const { logout, state: authState } = useAuth();
  const [activeSection, setActiveSection] = useState<SalesSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sales navigation
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, description: 'Sales overview & metrics' },
    { id: 'itinerary', name: 'Itinerary Builder', icon: Plus, description: 'Create travel packages' },
    { id: 'guests', name: 'Guest Management', icon: UserCheck, description: 'Manage clients & leads' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <SalesDashboard />;
      case 'itinerary':
        return <SalesItineraryBuilder />;
      case 'guests':
        return <SalesGuestManagement />;
      default:
        return <SalesDashboard />;
    }
  };

  return (
    <DataProvider>
      <div className="flex h-screen bg-slate-50">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  {authState.user?.company_name || authState.user?.full_name || 'Sales Portal'}
                </h1>
                <p className="text-xs text-slate-500">Sales Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info & Logout */}
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">
                  {authState.user?.full_name || 'Sales User'}
                </div>
                <div className="text-xs text-slate-500 capitalize">{authState.user?.role}</div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as SalesSection);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${
                    activeSection === item.id ? 'text-purple-100' : 'text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900 bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Sales Portal</h1>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </DataProvider>
  );
};

export default SalesApp;