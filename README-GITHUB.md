# Nomadller Solutions - Travel Agency Management System

A comprehensive travel agency management system built with React, TypeScript, and Supabase.

## 🚀 Features

- **Multi-role Authentication**: Admin, Agent, and Sales access levels
- **Itinerary Builder**: Create detailed travel packages with 4-step process
- **Advanced Guest Management**: Client relationship management with follow-ups
- **Real-time Updates**: Auto-save functionality with version control
- **Cost Management**: Automatic pricing calculations with profit margins
- **Inventory Management**: Hotels, transportation, activities, and meals
- **PDF Export**: Generate professional itinerary documents
- **WhatsApp Integration**: Direct client communication
- **Mobile Responsive**: Optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Real-time)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **PDF Generation**: jsPDF

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account (for production)
- Modern web browser

## 🔧 Quick Start

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd nomadller-solutions
npm install
```

### 2. Configure Database (Optional)

#### Option A: Demo Mode
The app works out of the box with demo data stored in local storage.

#### Option B: Supabase (Production)
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Use the "Connect to Supabase" button in the app to set up the database

### 3. Start Development Server
```bash
npm run dev
```

### 4. Demo Access
The application works out of the box with demo data:
- **Admin**: `admin@nomadller.com` / `admin123`
- **Agent**: `agent@nomadller.com` / `agent123`
- **Sales**: `sales@nomadller.com` / `sales123`

## 🗄️ Database Schema

### Core Tables (When using Supabase)
- **User Management**: profiles, agent_registrations
- **Client Management**: clients with follow-up system
- **Inventory**: hotels, room_types, transportations, sightseeings, activities, activity_options, entry_tickets, meals
- **Itinerary Management**: itineraries, day_plans with version control

## 👥 User Roles

### Admin Features
- Complete system management
- Inventory management (hotels, transportation, activities, meals)
- Agent approval and management
- Advanced client relationship management with follow-ups
- Full cost visibility and profit margin control
- Real-time itinerary editing with version control

### Agent Features
- Create travel packages for clients
- Access to inventory for package building
- Limited cost visibility (base cost + their profit only)
- Client package management
- Simplified itinerary builder

### Sales Features
- Lead generation and management
- Sales-specific itinerary builder
- Commission-based pricing
- Client conversion tracking
- Performance metrics

## 🔐 Security Features

- **Row Level Security (RLS)**: All tables protected with proper policies
- **Role-based Access**: Different permissions for admin/agent/sales
- **Authentication**: Secure email/password auth with Supabase
- **Data Validation**: Comprehensive form validation and error handling

## 🎨 Key Features

### 1. Itinerary Builder (4-Step Process)
1. **Client Details** - Personal info, travel dates, passengers
2. **Day Planning** - Sightseeing, hotels, activities, meals per day
3. **Review & Costing** - Pricing calculations with profit margins
4. **Final Summary** - Complete package with export options

### 2. Advanced Guest Management System
- **Three-tab interface**: All Clients | Confirmed Clients | Today's Follow-ups
- **Comprehensive client actions**: View, Edit, Follow-up, WhatsApp Chat, Delete, View Latest Itinerary
- **Smart Follow-up Management** with auto-progression logic
- **Real-time Itinerary System** with automatic version control

### 3. Real-time Features
- **Auto-save functionality** with debounced updates
- **Version control system** with complete change tracking
- **Live synchronization** across all views
- **Visual save indicators** (saving/saved status)

## 📱 Mobile Responsive Design

- Mobile-first design approach
- Touch-friendly interface
- Optimized for tablets and desktop
- Collapsible navigation for small screens

## 🚀 Production Setup

### Environment Variables
```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup
Database schema will be created automatically when you connect to Supabase through the app.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Nomadller Solutions.

## 🆘 Support

For technical support:
- Check demo mode first for testing
- Ensure Supabase is properly configured for production
- Review the migration files for database setup

---

**Built with ❤️ for the travel industry**