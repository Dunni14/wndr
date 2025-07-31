# WNDR 🗺️

**WNDR** is a memory mapping application that allows users to capture, organize, and explore their life experiences through an interactive map interface. Create visual memories tied to specific locations and watch your personal journey unfold geographically.

## ✨ Features

### 🎯 Core Functionality
- **Interactive Memory Mapping**: Pin memories to any location on an interactive Google Maps interface
- **Dual Location Selection**: Add memories at your current GPS location or manually select any location by clicking on the map
- **Rich Memory Creation**: Attach photos, titles, descriptions, moods, and visit dates to each memory
- **Smart Memory Clustering**: Dynamic grouping of nearby memories based on zoom level, similar to Apple Photos app
- **AI-Assisted Memory Creation**: Optional AI-powered title and description generation based on mood and location
- **Mood-Based Tagging**: Automatic tag generation based on selected mood (6 different moods available)

### 📱 User Experience
- **Email Authentication**: Secure login using email/password with confirmation flow via Supabase Auth
- **Account Management**: Comprehensive user profiles with name and email information
- **Memory Organization**: View memories in multiple formats:
  - **Map View**: Interactive map with clustered memory markers
  - **Gallery View**: Grid layout for memories at the same location
  - **Memories Page**: Chronological timeline organized by date

### 🛠️ Memory Management
- **Full CRUD Operations**: Create, read, update, and delete memories
- **Cross-Platform Editing**: Edit memories from any view (map, gallery, or memories page)
- **Cloud Storage**: Secure image uploads via Supabase Storage
- **User-Specific Data**: Each user's memories are private and secure with Row Level Security (RLS)
- **Smart AI Integration**: AI generation respects user input - only fills empty fields, never overwrites user-typed content

### 🎨 Design & UI
- **Racing Sans One Font**: Modern, sleek typography throughout the entire application
- **Neumorphic Design**: Soft, modern UI elements with subtle shadows
- **Responsive Layout**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Interactive Forms**: Real-time password validation, visibility toggles, and smart form states

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Google Maps JavaScript API** for interactive mapping
- **React Router** for navigation
- **Supabase Client** for authentication and data management

### Backend (Supabase)
- **Supabase** as Backend-as-a-Service (BaaS)
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for email/password authentication
- **Supabase Storage** for secure file uploads
- **Real-time subscriptions** for live data updates

## 📁 Project Structure

```
wndr/
├── memory-map-frontend/         # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Map/             # Map-related components
│   │   │   ├── Memory/          # Memory creation and display
│   │   │   ├── Places/          # Location search components
│   │   │   └── Timeline/        # Timeline visualization
│   │   ├── pages/               # Page components (Home, Login, Map, etc.)
│   │   ├── context/             # React context providers (Auth)
│   │   ├── services/            # API service functions (Supabase)
│   │   ├── lib/                 # Supabase client configuration
│   │   └── utils/               # Utility functions
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── supabase-schema.sql          # Database schema for Supabase
├── supabase-storage-policies.sql # Storage bucket policies
└── README.md
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- Supabase project and API keys
- Google Maps API key

### Supabase Setup
1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
3. Run the storage policies from `supabase-storage-policies.sql`
4. Enable email authentication in Supabase Auth settings

### Frontend Setup
```bash
cd memory-map-frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🌟 Key Features in Detail

### Supabase Backend Architecture
WNDR uses Supabase as a Backend-as-a-Service for:
- **Authentication**: Email/password auth with email confirmation
- **Database**: PostgreSQL with Row Level Security (RLS) for data privacy
- **Storage**: Secure file uploads with automatic public URL generation
- **Real-time**: Live data synchronization across sessions

### Dynamic Memory Clustering
WNDR implements intelligent memory clustering that adapts to your zoom level:
- **Zoomed Out**: Memories group by city/region for easier navigation
- **Medium Zoom**: Memories cluster by neighborhood or area
- **Zoomed In**: Individual memories show with precise locations

### AI-Powered Memory Enhancement
- **Smart AI Generation**: Optional "✨ AI Generate" button for title/description creation
- **Mood-Based Tags**: 6 different moods (happy, peaceful, adventurous, nostalgic, romantic, exciting)
- **User Input Protection**: AI never overwrites user-typed content, only fills empty fields
- **Context-Aware**: AI uses mood and location context for relevant suggestions

### Cross-View Memory Editing
Edit your memories from anywhere in the app:
- Edit button in map view memory details
- Hover-to-edit in gallery view
- Edit button in memories page modal

### Secure Cloud Storage
- **Supabase Storage**: All images stored securely in cloud storage buckets
- **Public URLs**: Automatic generation of optimized public image URLs
- **Access Control**: RLS policies ensure users only access their own files

## 🔧 Development Architecture

### Authentication Flow
1. **Email Signup**: User registers with email/password
2. **Email Confirmation**: Supabase sends confirmation email
3. **Profile Creation**: User profile automatically created on first login
4. **Session Management**: Persistent sessions with automatic token refresh

### Data Security
- **Row Level Security (RLS)**: Database-level security ensuring users only see their own data
- **Authentication Required**: All API calls require valid authentication
- **Environment Variables**: Sensitive keys stored securely in environment variables

### Deployment
- **Frontend**: Deployed on Vercel with automatic GitHub integration
- **Backend**: Managed by Supabase (no server maintenance required)
- **CI/CD**: Automatic deployments on GitHub push to main branch

## 🤝 Contributing

WNDR is built with modern web technologies and follows best practices for scalability and maintainability. The Supabase backend eliminates server management complexity while providing enterprise-grade security and performance.

## 📄 License

This project is part of a personal memory mapping application.

---

**Built with ❤️, Racing Sans One font, and powered by Supabase**