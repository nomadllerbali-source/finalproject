import React, { useState } from 'react';
import { DataProvider } from '../../contexts/DataContext';

// Admin Components
import Dashboard from './Dashboard';
import TransportationManager from './TransportationManager';
import HotelManager from './HotelManager';
import SightseeingManager from './SightseeingManager';
import EntryTicketManager from './EntryTicketManager';
import ActivityManager from './ActivityManager';
import MealManager from './MealManager';
import AgentManagement from './AgentManagement';
import GuestManagement from './GuestManagement';
import SalesManagement from './SalesManagement';
import OperationsManagement from './OperationsManagement';
import FixedItineraryManager from './FixedItineraryManager';
import AreaManager from './AreaManager';

// Itinerary Builder (Admin version)
import ItineraryBuilder from '../itinerary/ItineraryBuilder';

// Navigation
import { 
  Home, Settings, Building2, Car, MapPin, Camera, Ticket, Utensils, 
  Plus, Menu, X, Users, LogOut, UserCheck, TrendingUp, FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AdminSection = 'dashboard' | 'itinerary' | 'transportation' | 'hotels' | 'sightseeing' | 'activities' | 'meals' | 'tickets' | 'agents' | 'guests' | 'sales' | 'operations' | 'fixedItineraries' | 'areas';

const AdminApp: React.FC = () => {
  const { logout, state: authState } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Refresh agent data when switching to agent management
  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
    
    // If switching to agent management, refresh the agent data
    if (section === 'agents') {
      const savedAgents = localStorage.getItem('registeredAgents');
      if (savedAgents) {
        try {
          const agents = JSON.parse(savedAgents);
          // Force refresh through a small delay to ensure state updates
          setTimeout(() => {
            window.dispatchEvent(new Event('refreshAgents'));
          }, 50);
        } catch (error) {
          console.error('Error loading agents:', error);
        }
      }
    }
  };

  // Admin navigation (full access)
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, description: 'Overview & client leads' },
    { id: 'itinerary', name: 'Itinerary Builder', icon: Plus, description: 'Create new packages' },
    { id: 'agents', name: 'Agent Management', icon: UserCheck, description: 'Manage travel agents' },
    { id: 'sales', name: 'Sales Management', icon: TrendingUp, description: 'Manage sales team & performance' },
    { id: 'operations', name: 'Operations Management', icon: Settings, description: 'Manage operations team & bookings' },
    { id: 'fixedItineraries', name: 'Fixed Itineraries', icon: FileText, description: 'Manage itinerary templates' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard onNavigateToSection={setActiveSection} />;
      case 'itinerary':
        return <ItineraryBuilder />;
      case 'transportation':
        return <TransportationManager />;
      case 'hotels':
        return <HotelManager />;
      case 'sightseeing':
        return <SightseeingManager />;
      case 'activities':
        return <ActivityManager />;
      case 'tickets':
        return <EntryTicketManager />;
      case 'meals':
        return <MealManager />;
      case 'agents':
        return <AgentManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'operations':
        return <OperationsManagement />;
      case 'fixedItineraries':
        return <FixedItineraryManager />;
      case 'areas':
        return <AreaManager />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 max-w-md">
                <div className="bg-blue-100 p-4 rounded-lg mb-4 inline-block">
                  <Settings className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
                <p className="text-slate-600 mb-4">
                  The {activeSection} management module is currently under development.
                </p>
                <button
                  onClick={() => setActiveSection('dashboard')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
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
          <div className="flex items-center justify-between p-6 border-b border-slate-200 h-20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Nomadller Solution</h1>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">Admin Panel</p>
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
                  {authState.user?.name}
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
                  handleSectionChange(item.id as AdminSection);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium shadow-md'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className={`text-xs ${
                    activeSection === item.id ? 'text-blue-100' : 'text-slate-500'
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
          <div className="lg:hidden bg-white shadow-sm border-b border-slate-200 px-4 py-4">
            <div className="flex items-center justify-between h-10">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700 -ml-2"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors -mr-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
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

export default AdminApp;