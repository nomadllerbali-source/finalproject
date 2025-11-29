import React from 'react';
import { MapPin, Users, Calendar, DollarSign } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  hideHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, hideHeader = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!hideHeader && (
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
          <div className="w-full mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 overflow-hidden">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-xl font-bold text-slate-900 truncate">Nomadller Solution</h1>
                  <p className="text-xs text-slate-500 hidden sm:block truncate">Travel Agency Management</p>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-6 sm:pb-8 overflow-x-hidden ${hideHeader ? 'pt-4' : ''}`}>
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900 break-words">{title}</h2>
          {subtitle && (
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600 break-words">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;