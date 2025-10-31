import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, CheckSquare, MessageCircle, Home, LogOut, Menu, X, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import OperationsDashboard from './OperationsDashboard';
import PackageChecklist from './PackageChecklist';

type OperationsSection = 'dashboard' | 'checklist';

interface OperationsPerson {
  id: string;
  full_name: string;
  email: string;
  company_name: string | null;
}

const OperationsApp: React.FC = () => {
  const { logout, state: authState } = useAuth();
  const [activeSection, setActiveSection] = useState<OperationsSection>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [operationsPerson, setOperationsPerson] = useState<OperationsPerson | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchOperationsPerson();
  }, [authState.user]);

  const fetchOperationsPerson = async () => {
    console.log('🔵 OperationsApp: authState.user:', authState.user);
    console.log('🔵 OperationsApp: supabase initialized?', !!supabase);

    if (!authState.user?.email) {
      console.log('❌ No user email available');
      return;
    }

    if (!supabase) {
      console.error('❌ Supabase not initialized');
      return;
    }

    try {
      console.log('🔵 Fetching operations person for email:', authState.user.email);

      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔵 Current session:', session ? 'EXISTS' : 'NULL');

      const { data, error } = await supabase
        .from('operations_persons')
        .select('*')
        .eq('email', authState.user.email)
        .eq('is_active', true)
        .maybeSingle();

      console.log('🔵 Operations person query result:', { data, error });

      if (error) throw error;
      setOperationsPerson(data);
    } catch (error) {
      console.error('❌ Error fetching operations person:', error);
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'My Packages', icon: Home, description: 'View assigned packages' },
  ];

  const handleViewChecklist = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setActiveSection('checklist');
    setIsMobileMenuOpen(false);
  };

  const handleBackToDashboard = () => {
    setSelectedAssignmentId(null);
    setActiveSection('dashboard');
  };

  const renderContent = () => {
    if (activeSection === 'checklist' && selectedAssignmentId) {
      return (
        <PackageChecklist
          assignmentId={selectedAssignmentId}
          operationsPersonId={operationsPerson?.id || ''}
          onBack={handleBackToDashboard}
        />
      );
    }

    return (
      <OperationsDashboard
        operationsPersonId={operationsPerson?.id || ''}
        onViewChecklist={handleViewChecklist}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Operations Portal</h1>
                {operationsPerson && (
                  <p className="text-xs text-slate-600">{operationsPerson.full_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Menu</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id as OperationsSection);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeSection === item.id
                          ? 'bg-orange-50 text-orange-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default OperationsApp;
