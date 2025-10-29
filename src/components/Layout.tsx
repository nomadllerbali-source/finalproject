import React from 'react';
import { MapPin, Users, Calendar, DollarSign } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-slate-900">Nomadller Solutions</h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Travel Agency Management</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <div className="flex items-center space-x-1 text-slate-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">Clients</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Itineraries</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Revenue</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        <div className="mb-4 sm:mb-8">
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-slate-600">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;