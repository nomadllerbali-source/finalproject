# Nomadller Solutions - Travel Agency Management System

A comprehensive travel agency management system built with React, TypeScript, and Supabase.

## 🚀 Features

- **Multi-role Authentication**: Admin and Agent access levels
- **Itinerary Builder**: Create detailed travel packages
- **Cost Management**: Automatic pricing calculations with profit margins
- **Client Management**: Track leads and customer information
- **Inventory Management**: Hotels, transportation, activities, and meals
- **PDF Export**: Generate professional itinerary documents
- **Real-time Data**: Powered by Supabase for live updates

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

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

#### Option A: Demo Mode (No Database)
The application can run in demo mode with local storage. Use these credentials:
- **Admin**: `admin@nomadller.com` / `admin123`
- **Agent**: `agent@nomadller.com` / `agent123`
- **Sales**: `sales@nomadller.com` / `sales123`

All data is stored in your browser's local storage and persists between sessions.

#### Option B: Connect to Supabase (Production Ready)
1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Set up Database Schema**:
   - Use the Supabase Dashboard SQL Editor
   - Run the migration files to create tables and policies
   - Or use the "Connect to Supabase" button in the app

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🏗️ Database Schema

When connected to Supabase, the system includes these main entities:

- **Users & Authentication**: Profiles, agent registrations
- **Travel Inventory**: Hotels, transportations, sightseeings, activities, meals
- **Client Management**: Clients, itineraries, day plans
- **Pricing**: Room types, activity options, entry tickets

## 🔐 Security Features

- **Row Level Security (RLS)**: All tables protected with proper policies
- **Role-based Access**: Admins see everything, agents see only their data
- **Authentication**: Secure email/password auth with Supabase
- **Data Validation**: Comprehensive form validation and error handling

## 👥 User Roles

### Admin Features:
- Full system access
- Manage all inventory (hotels, transportation, etc.)
- Approve/manage travel agents
- View all client data and itineraries
- Complete cost breakdown and analytics

### Agent Features:
- Create travel packages for clients
- Access to inventory for package building
- Limited cost visibility (base cost + their profit)
- Client package management

## 📱 Responsive Design

- Mobile-first design approach
- Touch-friendly interface
- Optimized for tablets and desktop
- Progressive web app capabilities

## 🚀 Deployment

The application is deployed at: https://www.balitourpackages.in

For custom deployment:
```bash
npm run build
```

### Database Migration
Database migrations will be created when you connect to Supabase.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software for Nomadller Solutions.

## 🆘 Support

For technical support or questions:
- Check the demo mode first for testing
- Ensure Supabase is properly configured for production
- Review the migration file for database setup
- Contact the development team for assistance

---

**Built with ❤️ for the travel industry**