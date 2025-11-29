import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu,
  X,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  MapPin,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/app');
    }
  }, [authState.isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2">
              <MapPin className={`w-8 h-8 ${isScrolled ? 'text-emerald-600' : 'text-white'}`} />
              <span className={`text-xl md:text-2xl font-bold ${
                isScrolled ? 'text-slate-900' : 'text-white'
              }`}>
                Nomadller Bali
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('destinations')}
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                }`}
              >
                Destinations
              </button>
              <button
                onClick={() => scrollToSection('why-us')}
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                }`}
              >
                Why Us
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-slate-600 hover:text-emerald-600' : 'text-white hover:text-emerald-200'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => navigate('/app')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isScrolled
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                Login
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className={isScrolled ? 'text-slate-900' : 'text-white'} />
              ) : (
                <Menu className={isScrolled ? 'text-slate-900' : 'text-white'} />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('destinations')}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                Destinations
              </button>
              <button
                onClick={() => scrollToSection('why-us')}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                Why Us
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
              >
                Contact
              </button>
              <button
                onClick={() => navigate('/app')}
                className="block w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Premium Travel Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight">
              Discover the Magic of
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">
                Bali Paradise
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Streamline your travel agency operations with our comprehensive itinerary management platform designed for Bali adventures
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => navigate('/app')}
                className="group px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Travel Agencies
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage Bali itineraries efficiently and delight your clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Itinerary Builder</h3>
              <p className="text-slate-600">
                Create detailed day-by-day itineraries with hotels, activities, and transportation seamlessly integrated
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Team Collaboration</h3>
              <p className="text-slate-600">
                Multi-role access for admin, sales, operations, and agents with role-specific dashboards
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Cost Management</h3>
              <p className="text-slate-600">
                Automated cost calculations, markup management, and detailed pricing breakdowns for transparency
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-teal-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Tracking</h3>
              <p className="text-slate-600">
                Monitor client follow-ups, booking statuses, and operations checklists in real-time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Explore Beautiful Bali
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From pristine beaches to ancient temples, manage unforgettable experiences across all of Bali
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-green-400 to-emerald-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Ubud</h3>
                <p className="text-white/90">Cultural heart with rice terraces and art galleries</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-blue-400 to-cyan-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Seminyak</h3>
                <p className="text-white/90">Trendy beach town with world-class dining</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-orange-400 to-red-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Uluwatu</h3>
                <p className="text-white/90">Dramatic cliffs and stunning sunset views</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-teal-400 to-blue-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Nusa Penida</h3>
                <p className="text-white/90">Pristine island paradise with crystal waters</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-400 to-orange-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Canggu</h3>
                <p className="text-white/90">Surfer's haven with vibrant nightlife</p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all">
              <div className="aspect-[4/3] bg-gradient-to-br from-emerald-400 to-green-600"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-bold text-white mb-2">Sanur</h3>
                <p className="text-white/90">Peaceful beach town perfect for families</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why Choose Nomadller?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Built by travel professionals, for travel professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Streamlined Operations</h3>
                <p className="text-white/80">
                  Reduce manual work by 70% with automated itinerary generation and cost calculations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Client Satisfaction</h3>
                <p className="text-white/80">
                  Deliver professional, detailed itineraries that wow your clients every time
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Team Coordination</h3>
                <p className="text-white/80">
                  Seamless communication between sales and operations teams with built-in chat
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-emerald-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Data-Driven Insights</h3>
                <p className="text-white/80">
                  Make informed decisions with comprehensive analytics and reporting tools
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-white/80">Itineraries Created</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <div className="text-white/80">Travel Agents</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
                <div className="text-white/80">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Loved by Travel Professionals
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our users have to say about transforming their workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "This platform has revolutionized how we handle Bali itineraries. The automated cost calculations alone save us hours every week!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-lg">SA</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Sarah Anderson</div>
                  <div className="text-sm text-slate-500">Travel Agency Owner</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "The team collaboration features are outstanding. Sales and operations finally work in sync, and our clients notice the difference."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">MR</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Michael Rodriguez</div>
                  <div className="text-sm text-slate-500">Operations Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 mb-6">
                "Our clients are impressed with the professional itineraries we now deliver. It's elevated our brand and increased repeat bookings."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">LP</span>
                </div>
                <div>
                  <div className="font-bold text-slate-900">Lisa Patel</div>
                  <div className="text-sm text-slate-500">Sales Agent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Footer Section */}
      <section id="contact" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-8 h-8 text-emerald-400" />
                <span className="text-2xl font-bold">Nomadller Bali</span>
              </div>
              <p className="text-slate-400 mb-6">
                Empowering travel agencies with cutting-edge technology to create unforgettable Bali experiences.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('destinations')} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Destinations
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('why-us')} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Why Choose Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/app')} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Login
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-400">info@nomadller.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-400">+62 123 456 7890</span>
                </li>
                <li className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span className="text-slate-400">Ubud, Bali, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Nomadller Bali. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
