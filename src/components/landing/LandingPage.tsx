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
  Twitter,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Waves,
  Plane,
  ChevronRight,
  Image,
  Clock,
  Utensils,
  Home,
  Mountain,
  Palmtree,
  Camera
} from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  highlights: string[];
  bestFor: string[];
  topAttractions: { name: string; description: string }[];
  travelTips: string[];
  bestTime: string;
  duration: string;
}

const destinations: Destination[] = [
  {
    id: 'ubud',
    name: 'Ubud',
    tagline: 'The Cultural Heart of Bali',
    description: 'Nestled in the uplands of Bali, Ubud is the island\'s cultural and spiritual center. Famous for its lush rice terraces, ancient temples, and thriving arts scene, Ubud offers a perfect blend of natural beauty and Balinese tradition.',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Tegallalang Rice Terraces',
      'Sacred Monkey Forest Sanctuary',
      'Traditional Art Markets',
      'Yoga and Wellness Retreats'
    ],
    bestFor: ['Culture Enthusiasts', 'Nature Lovers', 'Wellness Seekers', 'Art Collectors'],
    topAttractions: [
      {
        name: 'Tegallalang Rice Terraces',
        description: 'Iconic stepped rice paddies showcasing traditional Balinese irrigation system (subak). Perfect for photography and scenic walks.'
      },
      {
        name: 'Ubud Monkey Forest',
        description: 'Sacred sanctuary home to over 700 Balinese long-tailed monkeys. Features ancient temple ruins and lush jungle pathways.'
      },
      {
        name: 'Tirta Empul Temple',
        description: 'Holy spring water temple where locals perform purification rituals. Experience authentic Balinese spiritual practices.'
      }
    ],
    travelTips: [
      'Visit rice terraces early morning for best light and fewer crowds',
      'Dress modestly when visiting temples (sarong required)',
      'Book cooking classes in advance',
      'Rent a scooter for easy exploration'
    ],
    bestTime: 'April - October (Dry Season)',
    duration: '3-4 days recommended'
  },
  {
    id: 'seminyak',
    name: 'Seminyak',
    tagline: 'Bali\'s Sophisticated Beach Resort',
    description: 'Seminyak is Bali\'s most stylish beach resort, known for its upscale dining, designer boutiques, and world-class beach clubs. This trendy coastal town offers golden sunsets, international cuisine, and vibrant nightlife.',
    image: 'https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Luxury Beach Clubs',
      'Fine Dining Restaurants',
      'Designer Shopping',
      'Stunning Sunset Views'
    ],
    bestFor: ['Luxury Travelers', 'Beach Lovers', 'Foodies', 'Nightlife Enthusiasts'],
    topAttractions: [
      {
        name: 'Potato Head Beach Club',
        description: 'Iconic beach club with infinity pools, international DJs, and sustainable architecture. Perfect spot for sunset cocktails.'
      },
      {
        name: 'Seminyak Beach',
        description: 'Wide sandy beach perfect for surfing, sunbathing, and beachfront dining. Legendary sunsets attract crowds nightly.'
      },
      {
        name: 'Eat Street (Jalan Kayu Aya)',
        description: 'Culinary hotspot featuring international restaurants, trendy cafes, and artisan gelato shops.'
      }
    ],
    travelTips: [
      'Book beach club daybeds in advance during peak season',
      'Arrive at beach early for best spots',
      'Try surfing lessons in the morning when waves are calmer',
      'Explore nearby Petitenget Temple for culture'
    ],
    bestTime: 'May - September',
    duration: '2-3 days recommended'
  },
  {
    id: 'uluwatu',
    name: 'Uluwatu',
    tagline: 'Dramatic Cliffs & World-Class Surf',
    description: 'Perched on towering limestone cliffs, Uluwatu is famous for its breathtaking ocean views, world-renowned surf breaks, and the iconic clifftop temple. This southern peninsula destination combines natural drama with Balinese spirituality.',
    image: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Clifftop Uluwatu Temple',
      'World-Class Surf Breaks',
      'Kecak Fire Dance',
      'Hidden Beach Clubs'
    ],
    bestFor: ['Surfers', 'Adventure Seekers', 'Photographers', 'Sunset Chasers'],
    topAttractions: [
      {
        name: 'Uluwatu Temple',
        description: 'Ancient sea temple perched 70 meters above the ocean. Watch traditional Kecak dance performances at sunset against dramatic backdrop.'
      },
      {
        name: 'Padang Padang Beach',
        description: 'Small but stunning beach reached through a rock cave. Famous surf break and crystal-clear waters perfect for swimming.'
      },
      {
        name: 'Single Fin',
        description: 'Legendary clifftop bar with panoramic ocean views. Sunday sunset sessions with live music are unmissable.'
      }
    ],
    travelTips: [
      'Arrive at temple before 4 PM to avoid crowds',
      'Watch your belongings around monkeys at temple',
      'Book Kecak dance tickets online in advance',
      'Bring cash - many venues don\'t accept cards'
    ],
    bestTime: 'April - October',
    duration: '2-3 days recommended'
  },
  {
    id: 'nusa-penida',
    name: 'Nusa Penida',
    tagline: 'Untouched Island Paradise',
    description: 'Nusa Penida is a rugged, relatively untouched island featuring some of Bali\'s most dramatic coastal scenery. With towering cliffs, crystal-clear waters, and diverse marine life, it\'s a paradise for adventurers and nature enthusiasts.',
    image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Kelingking Beach T-Rex',
      'Angel\'s Billabong',
      'Manta Ray Diving',
      'Pristine Beaches'
    ],
    bestFor: ['Adventure Travelers', 'Divers', 'Nature Photographers', 'Beach Hoppers'],
    topAttractions: [
      {
        name: 'Kelingking Beach',
        description: 'Iconic T-Rex shaped cliff formation. Steep descent to secluded white sand beach below. Instagram\'s most photographed Bali spot.'
      },
      {
        name: 'Angel\'s Billabong & Broken Beach',
        description: 'Natural infinity pool and circular cove with natural archway. Stunning turquoise waters perfect for photos (swimming not recommended).'
      },
      {
        name: 'Crystal Bay',
        description: 'Best snorkeling and diving spot on the island. Chance to swim with manta rays and see diverse coral reefs.'
      }
    ],
    travelTips: [
      'Take fast boat from Sanur (45 minutes)',
      'Hire a driver for full-day tour',
      'Start early to beat crowds at Kelingking',
      'Wear sturdy shoes for cliff walks',
      'Bring water and snacks - limited facilities'
    ],
    bestTime: 'April - October (calm seas)',
    duration: 'Full day trip or 2-day stay'
  },
  {
    id: 'canggu',
    name: 'Canggu',
    tagline: 'Bohemian Beach Town Vibes',
    description: 'Once a quiet fishing village, Canggu has evolved into Bali\'s hippest coastal town. With black sand beaches, incredible surf, trendy cafes, and a thriving digital nomad community, it perfectly blends laid-back beach life with modern amenities.',
    image: 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Surf Breaks for All Levels',
      'Trendy Cafes & Brunch Spots',
      'Vibrant Nightlife',
      'Digital Nomad Hub'
    ],
    bestFor: ['Surfers', 'Digital Nomads', 'Cafe Hoppers', 'Young Travelers'],
    topAttractions: [
      {
        name: 'Echo Beach',
        description: 'Popular surf break and beach club scene. Watch surfers tackle waves while enjoying beachfront dining and cold Bintangs.'
      },
      {
        name: 'Tanah Lot Temple',
        description: 'Iconic sea temple on rocky outcrop (20 min drive). One of Bali\'s most photographed temples, spectacular at sunset.'
      },
      {
        name: 'Old Man\'s Beach',
        description: 'Beginner-friendly surf break lined with beach bars. Heart of Canggu\'s social scene with sunset parties and live music.'
      }
    ],
    travelTips: [
      'Rent a scooter or bicycle for getting around',
      'Try different cafes - amazing brunch scene',
      'Book surf lessons early morning',
      'Explore rice field walks away from the beach',
      'Join beach cleanups - help keep Canggu beautiful'
    ],
    bestTime: 'May - September',
    duration: '3-5 days recommended'
  },
  {
    id: 'sanur',
    name: 'Sanur',
    tagline: 'Bali\'s Peaceful Beach Escape',
    description: 'Sanur is Bali\'s first beach resort, offering a more relaxed and family-friendly atmosphere compared to busier areas. With calm waters, a scenic beachfront promenade, and authentic local culture, it\'s perfect for those seeking tranquility.',
    image: 'https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800',
    highlights: [
      'Calm Beach Waters',
      'Sunrise Views',
      '5km Beach Promenade',
      'Traditional Fishing Village'
    ],
    bestFor: ['Families', 'Couples', 'Relaxation Seekers', 'Sunrise Lovers'],
    topAttractions: [
      {
        name: 'Sanur Beach Walk',
        description: '5km paved promenade perfect for morning jogs, cycling, or sunset strolls. Lined with restaurants and traditional fishing boats.'
      },
      {
        name: 'Le Mayeur Museum',
        description: 'Historic home of Belgian painter showcasing his Balinese-inspired artwork. Beautiful traditional architecture and gardens.'
      },
      {
        name: 'Serangan Island (Turtle Island)',
        description: 'Short boat ride to turtle conservation center. Learn about sea turtle protection and see hatchlings being released.'
      }
    ],
    travelTips: [
      'Wake early for stunning sunrise views',
      'Rent bicycles to explore the beachfront',
      'Try local warungs for authentic Balinese food',
      'Book boat trips to Nusa Penida from here',
      'Visit Sunday morning markets for local crafts'
    ],
    bestTime: 'Year-round (less crowded than other areas)',
    duration: '2-3 days recommended'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDestinationModal, setShowDestinationModal] = useState(false);

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

  const openDestinationModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setShowDestinationModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDestinationModal = () => {
    setShowDestinationModal(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedDestination(null), 300);
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
                Nomadller Solution
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
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bali Temple"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-teal-900/70 to-cyan-900/80"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.2),transparent)]" />
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-200 animate-pulse">
                Bali Paradise
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto drop-shadow-lg">
              Next-generation travel management platform powered by AI and automation. Transform your Bali adventures into unforgettable experiences.
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
                onClick={() => scrollToSection('destinations')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Explore Destinations
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
      <section id="features" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Travel Agencies
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to manage Bali itineraries efficiently and delight your clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-slate-100 hover:border-emerald-200 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600">
                Build complete itineraries in minutes with AI-powered suggestions and smart automation
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-slate-100 hover:border-blue-200 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Team Sync</h3>
              <p className="text-slate-600">
                Real-time collaboration with built-in chat, role-based access, and instant notifications
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-slate-100 hover:border-amber-200 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Reliable</h3>
              <p className="text-slate-600">
                Enterprise-grade security with automated backups and 99.9% uptime guarantee
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all group border border-slate-100 hover:border-teal-200 hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Analytics</h3>
              <p className="text-slate-600">
                Advanced insights, revenue tracking, and performance metrics at your fingertips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section - Enhanced with Detailed Info */}
      <section id="destinations" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Explore Beautiful Bali Destinations
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From pristine beaches to ancient temples, discover comprehensive guides to Bali's most captivating locations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
                onClick={() => openDestinationModal(destination)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 group-hover:from-emerald-900/95 transition-all duration-300">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full">
                      {destination.bestTime}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform">
                    {destination.name}
                  </h3>
                  <p className="text-white/95 text-sm mb-3 group-hover:translate-x-2 transition-transform">
                    {destination.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-white/80 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{destination.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white group-hover:translate-x-2 transition-transform">
                      <span className="text-sm font-medium">Read More</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destination Modal */}
      {showDestinationModal && selectedDestination && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeDestinationModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div className="relative h-64 md:h-80">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <button
                onClick={closeDestinationModal}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl font-bold text-white mb-2">{selectedDestination.name}</h2>
                <p className="text-xl text-white/90">{selectedDestination.tagline}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8">
              {/* Description */}
              <div className="mb-8">
                <p className="text-lg text-slate-700 leading-relaxed">{selectedDestination.description}</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-slate-900">Best Time to Visit</h4>
                  </div>
                  <p className="text-slate-700">{selectedDestination.bestTime}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-slate-900">Recommended Duration</h4>
                  </div>
                  <p className="text-slate-700">{selectedDestination.duration}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-emerald-600" />
                  Highlights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedDestination.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Attractions */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-emerald-600" />
                  Top Attractions
                </h3>
                <div className="space-y-4">
                  {selectedDestination.topAttractions.map((attraction, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-slate-900 mb-2">{attraction.name}</h4>
                      <p className="text-slate-700">{attraction.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-emerald-600" />
                  Perfect For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.bestFor.map((category, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Travel Tips */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                  <Camera className="w-6 h-6 mr-2 text-emerald-600" />
                  Pro Travel Tips
                </h3>
                <div className="space-y-3">
                  {selectedDestination.travelTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-emerald-600 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    closeDestinationModal();
                    navigate('/app');
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center space-x-2"
                >
                  <span>Plan Your Trip to {selectedDestination.name}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bali Beach"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/95 to-teal-600/95"></div>
        </div>
        <div className="relative z-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Why Choose Nomadller Solution?
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

            <div className="mt-16 bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-white/20 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="transform hover:scale-110 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <Plane className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">500+</div>
                  <div className="text-white/90 font-semibold">Itineraries Created</div>
                </div>
                <div className="transform hover:scale-110 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">50+</div>
                  <div className="text-white/90 font-semibold">Travel Agents</div>
                </div>
                <div className="transform hover:scale-110 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <Waves className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-white">98%</div>
                  <div className="text-white/90 font-semibold">Client Satisfaction</div>
                </div>
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
                <span className="text-2xl font-bold">Nomadller Solution</span>
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
            <p>&copy; 2024 Nomadller Solution. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
