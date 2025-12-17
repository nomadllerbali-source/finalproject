import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  Camera,
  Tag,
  Package
} from 'lucide-react';

interface Package {
  id: string;
  title: string;
  description: string;
  duration: string;
  price_from: number;
  image_url: string;
  highlights: string[];
  inclusions: string;
  exclusions: string;
  is_featured: boolean;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discount_percentage: number;
  valid_from: string;
  valid_until: string;
}

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const packagesRef = useRef<HTMLDivElement>(null);
  const destinationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/app');
    }
  }, [authState.isAuthenticated, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setScrollY(window.scrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [packages, promotions]);

  useEffect(() => {
    loadPackages();
    loadPromotions();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('valid_from', today)
        .gte('valid_until', today)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPromotions(data || []);
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
  };

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

  const openPackageModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowPackageModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closePackageModal = () => {
    setShowPackageModal(false);
    document.body.style.overflow = 'unset';
    setTimeout(() => setSelectedPackage(null), 300);
  };

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(50px);
        }
        .animate-in {
          animation: slide-up 0.8s ease forwards;
        }
        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .glass-morphism {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 30px 60px rgba(16, 185, 129, 0.3);
        }
      `}} />
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-3xl animate-float"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-3xl animate-float"
          style={{
            top: '50%',
            right: '10%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-float"
          style={{
            bottom: '10%',
            left: '50%',
            animationDelay: '4s',
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * -0.02}px)`
          }}
        />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'glass-morphism shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <MapPin className={`w-8 h-8 transition-all duration-300 ${isScrolled ? 'text-emerald-400' : 'text-emerald-300'} group-hover:scale-110 group-hover:rotate-12`} />
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              </div>
              <span className={`text-xl md:text-2xl font-bold transition-all duration-300 ${
                isScrolled ? 'text-white' : 'text-white'
              }`}>
                Nomadller Solution
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className={`font-medium transition-all duration-300 hover:scale-105 relative group ${
                  isScrolled ? 'text-slate-200 hover:text-emerald-300' : 'text-white hover:text-emerald-300'
                }`}
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('destinations')}
                className={`font-medium transition-all duration-300 hover:scale-105 relative group ${
                  isScrolled ? 'text-slate-200 hover:text-emerald-300' : 'text-white hover:text-emerald-300'
                }`}
              >
                Destinations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('why-us')}
                className={`font-medium transition-all duration-300 hover:scale-105 relative group ${
                  isScrolled ? 'text-slate-200 hover:text-emerald-300' : 'text-white hover:text-emerald-300'
                }`}
              >
                Why Us
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className={`font-medium transition-all duration-300 hover:scale-105 relative group ${
                  isScrolled ? 'text-slate-200 hover:text-emerald-300' : 'text-white hover:text-emerald-300'
                }`}
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:w-full transition-all duration-300" />
              </button>
              <button
                onClick={() => navigate('/app')}
                className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/50 hover:scale-105 relative overflow-hidden group"
              >
                <span className="relative z-10">Login</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          <div className="md:hidden glass-morphism border-t border-white/10 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all duration-300"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('destinations')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all duration-300"
              >
                Destinations
              </button>
              <button
                onClick={() => scrollToSection('why-us')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all duration-300"
              >
                Why Us
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block w-full text-left px-4 py-2 text-white hover:bg-emerald-500/20 hover:text-emerald-300 rounded-lg transition-all duration-300"
              >
                Contact
              </button>
              <button
                onClick={() => navigate('/app')}
                className="block w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ transform: `translateY(${parallaxOffset}px)` }}>
          <img
            src="https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bali Temple"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-emerald-900/80 to-teal-900/90"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.3),transparent)]" />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-teal-400 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 glass-morphism px-6 py-3 rounded-full text-white animate-float border border-emerald-400/30">
              <Sparkles className="w-5 h-5 text-emerald-300 animate-glow" />
              <span className="text-sm font-semibold tracking-wide">Premium Travel Management Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-white leading-tight">
              <span className="block mb-4">Discover the Magic of</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 animate-gradient text-glow">
                Bali Paradise
              </span>
            </h1>

            <p className="text-xl sm:text-2xl md:text-3xl text-slate-200 max-w-4xl mx-auto leading-relaxed font-light">
              Next-generation travel management platform powered by <span className="text-emerald-300 font-semibold">AI</span> and automation.
              <br className="hidden sm:block" />
              Transform your Bali adventures into <span className="text-teal-300 font-semibold">unforgettable experiences</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <button
                onClick={() => navigate('/app')}
                className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center space-x-3 overflow-hidden"
              >
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={() => scrollToSection('destinations')}
                className="group px-10 py-5 glass-morphism text-white rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 border-2 border-emerald-400/30 hover:border-emerald-400/60 hover:scale-105 flex items-center space-x-3"
              >
                <span>Explore Destinations</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="flex justify-center gap-12 pt-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-emerald-300 mb-1">500+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Itineraries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-teal-300 mb-1">50+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Agents</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-cyan-300 mb-1">98%</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-emerald-400/50 rounded-full flex items-start justify-center p-2">
            <div className="w-2 h-4 bg-emerald-400/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full text-emerald-300 mb-6">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">Cutting-Edge Technology</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Powerful Features for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Modern Agencies</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Everything you need to manage Bali itineraries efficiently and delight your clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="animate-on-scroll stagger-1 glass-morphism p-8 rounded-3xl card-hover border border-emerald-500/20 group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-slate-300 leading-relaxed">
                Build complete itineraries in minutes with AI-powered suggestions and smart automation
              </p>
            </div>

            <div className="animate-on-scroll stagger-2 glass-morphism p-8 rounded-3xl card-hover border border-cyan-500/20 group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Team Sync</h3>
              <p className="text-slate-300 leading-relaxed">
                Real-time collaboration with built-in chat, role-based access, and instant notifications
              </p>
            </div>

            <div className="animate-on-scroll stagger-3 glass-morphism p-8 rounded-3xl card-hover border border-amber-500/20 group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Shield className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure & Reliable</h3>
              <p className="text-slate-300 leading-relaxed">
                Enterprise-grade security with automated backups and 99.9% uptime guarantee
              </p>
            </div>

            <div className="animate-on-scroll stagger-4 glass-morphism p-8 rounded-3xl card-hover border border-teal-500/20 group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analytics</h3>
              <p className="text-slate-300 leading-relaxed">
                Advanced insights, revenue tracking, and performance metrics at your fingertips
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      {promotions.length > 0 && (
        <section className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 animate-on-scroll">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Tag className="w-10 h-10 text-yellow-200 animate-bounce" />
                <h2 className="text-4xl md:text-5xl font-bold text-white">Special Offers</h2>
                <Sparkles className="w-10 h-10 text-yellow-200 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <p className="text-xl text-white/90">Limited time deals you don't want to miss</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promotions.map((promo, index) => (
                <div key={promo.id} className={`animate-on-scroll stagger-${(index % 4) + 1} glass-morphism rounded-3xl p-6 card-hover border border-white/20 group overflow-hidden`}>
                  {promo.image_url && (
                    <div className="relative overflow-hidden rounded-2xl mb-6 h-48">
                      <img
                        src={promo.image_url}
                        alt={promo.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 text-xl font-bold rounded-full shadow-lg animate-pulse">
                        {promo.discount_percentage}% OFF
                      </div>
                    </div>
                  )}
                  <h3 className="text-2xl font-bold text-white mb-3">{promo.title}</h3>
                  <p className="text-slate-200 mb-4 leading-relaxed">{promo.description}</p>
                  <p className="text-sm text-yellow-200 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Valid until: {new Date(promo.valid_until).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => navigate('/app')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 rounded-xl font-bold hover:shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <span>Book Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Packages Section */}
      {packages.length > 0 && (
        <section ref={packagesRef} id="packages" className="py-32 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20 animate-on-scroll">
              <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full text-purple-300 mb-6 border border-purple-500/20">
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Curated Travel Packages</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                Our Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Travel Packages</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Handpicked packages designed to give you the best Bali experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {packages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className={`animate-on-scroll stagger-${(index % 4) + 1} group glass-morphism rounded-3xl overflow-hidden card-hover border border-purple-500/20 cursor-pointer`}
                  onClick={() => openPackageModal(pkg)}
                >
                  {pkg.image_url && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={pkg.image_url}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                      {pkg.is_featured && (
                        <div className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-900 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                          <Star className="w-4 h-4 fill-current" />
                          Featured
                        </div>
                      )}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-emerald-300 text-sm mb-2">
                          <Clock className="w-4 h-4" />
                          {pkg.duration}
                        </div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {pkg.title}
                        </h3>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-slate-300 mb-4 line-clamp-2">{pkg.description}</p>

                    {pkg.highlights && pkg.highlights.length > 0 && (
                      <div className="mb-6 space-y-2">
                        {pkg.highlights.slice(0, 3).map((highlight, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <div className="text-sm text-slate-400">Starting from</div>
                        <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">${pkg.price_from}</div>
                      </div>
                      <button className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2">
                        Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Destinations Section - Enhanced with Detailed Info */}
      <section ref={destinationsRef} id="destinations" className="py-32 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full text-blue-300 mb-6 border border-blue-500/20">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">Discover Paradise</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Explore Beautiful <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">Bali Destinations</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              From pristine beaches to ancient temples, discover comprehensive guides to Bali's most captivating locations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <div
                key={destination.id}
                className={`animate-on-scroll stagger-${(index % 4) + 1} group relative overflow-hidden rounded-3xl card-hover border border-blue-500/20 cursor-pointer`}
                onClick={() => openDestinationModal(destination)}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent flex flex-col justify-end p-6 group-hover:from-blue-900/95 transition-all duration-500">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1.5 glass-morphism text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/30">
                      {destination.bestTime}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2 group-hover:translate-x-2 transition-transform">
                    {destination.name}
                  </h3>
                  <p className="text-slate-200 text-sm mb-4 group-hover:translate-x-2 transition-transform">
                    {destination.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-slate-300 text-sm">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{destination.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-white group-hover:translate-x-2 transition-transform">
                      <span className="text-sm font-semibold">Read More</span>
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
      <section id="why-us" className="py-32 relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Bali Beach"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/95 via-teal-900/95 to-cyan-900/95"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
        </div>
        <div className="relative z-10 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 animate-on-scroll">
              <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full text-emerald-300 mb-6 border border-emerald-400/30">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Why Choose Us</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">Nomadller Solution?</span>
              </h2>
              <p className="text-xl text-slate-200 max-w-2xl mx-auto">
                Built by travel professionals, for travel professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
              <div className="animate-on-scroll stagger-1 glass-morphism p-8 rounded-3xl border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Zap className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-emerald-300">Streamlined Operations</h3>
                    <p className="text-slate-200 leading-relaxed">
                      Reduce manual work by 70% with automated itinerary generation and cost calculations
                    </p>
                  </div>
                </div>
              </div>

              <div className="animate-on-scroll stagger-2 glass-morphism p-8 rounded-3xl border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Star className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-teal-300">Client Satisfaction</h3>
                    <p className="text-slate-200 leading-relaxed">
                      Deliver professional, detailed itineraries that wow your clients every time
                    </p>
                  </div>
                </div>
              </div>

              <div className="animate-on-scroll stagger-3 glass-morphism p-8 rounded-3xl border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-cyan-300">Team Coordination</h3>
                    <p className="text-slate-200 leading-relaxed">
                      Seamless communication between sales and operations teams with built-in chat
                    </p>
                  </div>
                </div>
              </div>

              <div className="animate-on-scroll stagger-4 glass-morphism p-8 rounded-3xl border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300 group">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-blue-300">Data-Driven Insights</h3>
                    <p className="text-slate-200 leading-relaxed">
                      Make informed decisions with comprehensive analytics and reporting tools
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll glass-morphism rounded-3xl p-10 md:p-16 max-w-6xl mx-auto border border-emerald-400/30 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="group">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Plane className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-6xl md:text-7xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">500+</div>
                  <div className="text-slate-200 font-semibold text-lg">Itineraries Created</div>
                </div>
                <div className="group">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Globe className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-6xl md:text-7xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">50+</div>
                  <div className="text-slate-200 font-semibold text-lg">Travel Agents</div>
                </div>
                <div className="group">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Waves className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-6xl md:text-7xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">98%</div>
                  <div className="text-slate-200 font-semibold text-lg">Client Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-on-scroll">
            <div className="inline-flex items-center space-x-2 glass-morphism px-4 py-2 rounded-full text-amber-300 mb-6 border border-amber-400/20">
              <Star className="w-5 h-5" />
              <span className="text-sm font-medium">Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">Travel Professionals</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              See what our users have to say about transforming their workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-on-scroll stagger-1 glass-morphism p-8 rounded-3xl border border-amber-500/20 card-hover">
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 mb-8 text-lg leading-relaxed">
                "This platform has revolutionized how we handle Bali itineraries. The automated cost calculations alone save us hours every week!"
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">SA</span>
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Sarah Anderson</div>
                  <div className="text-sm text-slate-400">Travel Agency Owner</div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll stagger-2 glass-morphism p-8 rounded-3xl border border-blue-500/20 card-hover">
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 mb-8 text-lg leading-relaxed">
                "The team collaboration features are outstanding. Sales and operations finally work in sync, and our clients notice the difference."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">MR</span>
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Michael Rodriguez</div>
                  <div className="text-sm text-slate-400">Operations Manager</div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll stagger-3 glass-morphism p-8 rounded-3xl border border-teal-500/20 card-hover">
              <div className="flex items-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-200 mb-8 text-lg leading-relaxed">
                "Our clients are impressed with the professional itineraries we now deliver. It's elevated our brand and increased repeat bookings."
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">LP</span>
                </div>
                <div>
                  <div className="font-bold text-white text-lg">Lisa Patel</div>
                  <div className="text-sm text-slate-400">Sales Agent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact/Footer Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-slate-950 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6 group">
                <div className="relative">
                  <MapPin className="w-10 h-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Nomadller Solution</span>
              </div>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                Empowering travel agencies with cutting-edge technology to create unforgettable Bali experiences.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center hover:bg-emerald-500/20 transition-all duration-300 hover:scale-110 border border-emerald-400/20">
                  <Facebook className="w-5 h-5 text-emerald-400" />
                </a>
                <a href="#" className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center hover:bg-emerald-500/20 transition-all duration-300 hover:scale-110 border border-emerald-400/20">
                  <Instagram className="w-5 h-5 text-emerald-400" />
                </a>
                <a href="#" className="w-12 h-12 glass-morphism rounded-full flex items-center justify-center hover:bg-emerald-500/20 transition-all duration-300 hover:scale-110 border border-emerald-400/20">
                  <Twitter className="w-5 h-5 text-emerald-400" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-300">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-slate-300 hover:text-emerald-300 transition-all duration-300 hover:translate-x-1 inline-block">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('destinations')} className="text-slate-300 hover:text-emerald-300 transition-all duration-300 hover:translate-x-1 inline-block">
                    Destinations
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('why-us')} className="text-slate-300 hover:text-emerald-300 transition-all duration-300 hover:translate-x-1 inline-block">
                    Why Choose Us
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/app')} className="text-slate-300 hover:text-emerald-300 transition-all duration-300 hover:translate-x-1 inline-block">
                    Login
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-teal-300">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 group">
                  <Mail className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300">info@nomadller.com</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <Phone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300">+62 123 456 7890</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <MapPin className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300">Ubud, Bali, Indonesia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-slate-400">&copy; 2024 Nomadller Solution. All rights reserved.</p>
          </div>
        </div>
      </section>

      {/* Package Detail Modal */}
      {showPackageModal && selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-slate-900 bg-opacity-75"
              onClick={closePackageModal}
            ></div>

            <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
              <button
                onClick={closePackageModal}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {selectedPackage.image_url && (
                <img
                  src={selectedPackage.image_url}
                  alt={selectedPackage.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedPackage.title}</h2>
                    <div className="flex items-center gap-4 text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{selectedPackage.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-2xl font-bold text-purple-600">${selectedPackage.price_from}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPackage.is_featured && (
                    <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      Featured
                    </div>
                  )}
                </div>

                <p className="text-slate-700 text-lg mb-6">{selectedPackage.description}</p>

                {selectedPackage.highlights && selectedPackage.highlights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackage.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPackage.inclusions && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      Inclusions
                    </h3>
                    <p className="text-slate-700 whitespace-pre-line">{selectedPackage.inclusions}</p>
                  </div>
                )}

                {selectedPackage.exclusions && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <X className="w-6 h-6 text-red-600" />
                      Exclusions
                    </h3>
                    <p className="text-slate-700 whitespace-pre-line">{selectedPackage.exclusions}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    closePackageModal();
                    navigate('/app');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Book This Package</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={closePackageModal}
                  className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
