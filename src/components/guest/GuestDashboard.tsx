import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Package,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Palmtree,
  Waves,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  start_date: string;
  end_date: string;
  num_guests: number;
  total_cost: number;
  status: string;
  notes: string;
}

export default function GuestDashboard() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [guestProfile, setGuestProfile] = useState<any>(null);

  useEffect(() => {
    if (!authState.isAuthenticated || authState.user?.role !== 'guest') {
      navigate('/');
      return;
    }

    loadGuestData();
  }, [authState, navigate]);

  const loadGuestData = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authState.user?.id)
        .single();

      setGuestProfile(profile);

      if (profile?.email) {
        const { data: bookingsData, error } = await supabase
          .from('sales_clients')
          .select('*')
          .eq('client_email', profile.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(bookingsData || []);
      }
    } catch (error) {
      console.error('Error loading guest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-900 font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI0ZCOTIzQyIgc3Ryb2tlLXdpZHRoPSIuNSIgb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30" />

      <Waves className="absolute top-10 right-10 w-32 h-32 text-amber-200/30 animate-pulse" />
      <Palmtree className="absolute bottom-20 left-10 w-40 h-40 text-orange-200/30 animate-bounce" style={{ animationDuration: '4s' }} />

      <div className="relative">
        <nav className="bg-white/80 backdrop-blur-xl border-b border-amber-200/50 shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-amber-900 hover:text-orange-600 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-xl">Bali Paradise</span>
              </button>

              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-amber-700">Welcome back,</p>
                  <p className="font-bold text-amber-900">{guestProfile?.full_name || 'Guest'}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-rose-500/50 transition-all hover:scale-105"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-orange-600" />
              My Bookings
            </h1>
            <p className="text-amber-700 text-lg">View and manage your travel reservations</p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-12 text-center border border-amber-200/50">
              <Package className="w-24 h-24 text-amber-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-amber-900 mb-2">No Bookings Yet</h3>
              <p className="text-amber-700 mb-6">You haven't made any bookings yet. Start planning your Bali adventure!</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105"
              >
                Explore Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-amber-200/50 hover:scale-105 cursor-pointer group"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(booking.status)} flex items-center gap-2`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{booking.client_name}</h3>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center text-amber-900">
                      <Calendar className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <p className="text-sm text-amber-700">Travel Dates</p>
                        <p className="font-semibold">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-900">
                      <Users className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <p className="text-sm text-amber-700">Guests</p>
                        <p className="font-semibold">{booking.num_guests} People</p>
                      </div>
                    </div>

                    <div className="flex items-center text-amber-900">
                      <DollarSign className="w-5 h-5 mr-3 text-orange-600" />
                      <div>
                        <p className="text-sm text-amber-700">Total Cost</p>
                        <p className="font-semibold text-xl">${booking.total_cost.toLocaleString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/50 transition-all group-hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Package className="w-8 h-8" />
                  Booking Details
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <span className={`px-6 py-2 rounded-full text-base font-bold border ${getStatusColor(selectedBooking.status)} flex items-center gap-2`}>
                  {getStatusIcon(selectedBooking.status)}
                  Status: {selectedBooking.status}
                </span>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Guest Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-amber-700">Full Name</p>
                      <p className="font-semibold text-amber-900">{selectedBooking.client_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-amber-700">Email</p>
                      <p className="font-semibold text-amber-900">{selectedBooking.client_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-amber-700">Phone</p>
                      <p className="font-semibold text-amber-900">{selectedBooking.client_phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6" />
                  Trip Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-700 mb-1">Check-in Date</p>
                    <p className="font-semibold text-amber-900 text-lg">
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 mb-1">Check-out Date</p>
                    <p className="font-semibold text-amber-900 text-lg">
                      {new Date(selectedBooking.end_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 mb-1">Number of Guests</p>
                    <p className="font-semibold text-amber-900 text-2xl">{selectedBooking.num_guests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-700 mb-1">Total Cost</p>
                    <p className="font-bold text-orange-600 text-3xl">${selectedBooking.total_cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-gradient-to-br from-rose-50 to-amber-50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Additional Notes
                  </h3>
                  <p className="text-amber-800 whitespace-pre-wrap">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 border-2 border-amber-300">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  Important Information
                </h4>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li>• Please arrive at the meeting point 15 minutes before departure</li>
                  <li>• Bring valid ID and booking confirmation</li>
                  <li>• Contact us if you need to make any changes</li>
                  <li>• Check weather conditions before your trip</li>
                </ul>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
