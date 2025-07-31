# WNDR 🗺️

**WNDR** is a memory mapping application that allows users to capture, organize, and explore their life experiences through an interactive map interface. Create visual memories tied to specific locations and watch your personal journey unfold geographically.

## 🎯 What is WNDR?

WNDR transforms the way you document and revisit your life experiences. Instead of scattered photos and notes, WNDR creates a geographical timeline of your memories. Whether it's a perfect sunset at the beach, a cozy café discovery, or an adventure in a new city, WNDR helps you map your story.

## ✨ Key Features

- **📍 Interactive Memory Mapping**: Pin memories to exact locations on Google Maps
- **📱 Dual Location Options**: Use current GPS location or manually select any spot on the map
- **📸 Rich Memory Creation**: Add photos, titles, descriptions, moods, and visit dates
- **🔗 Smart Clustering**: Memories automatically group based on zoom level (like Apple Photos)
- **🔐 Secure Authentication**: Email/password authentication with confirmation flow
- **📊 Multiple Views**: Map, gallery, and chronological timeline views
- **✏️ Cross-Platform Editing**: Edit memories from any view in the app
- **🎨 Modern Design**: Racing Sans One font with neumorphic design elements
- **🤖 AI-Assisted Creation**: Optional AI-powered title and description generation
- **🏷️ Mood-Based Tagging**: Automatic tag generation based on selected mood (6 different moods)

## 🏗️ Architecture

WNDR is built as a modern serverless application using Supabase:

### Frontend (`/memory-map-frontend`)
- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Google Maps JavaScript API
- Supabase client for authentication and data management

### Backend (Supabase BaaS)
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** database with Row Level Security (RLS)
- **Supabase Auth** for email/password authentication
- **Supabase Storage** for secure file uploads
- **Real-time subscriptions** for live data updates

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dunni14/wndr.git
   cd wndr
   ```

2. **Setup Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor
   - Run the storage policies from `supabase-storage-policies.sql`
   - Enable email authentication in Supabase Auth settings

3. **Setup Frontend**
   ```bash
   cd memory-map-frontend
   npm install
   # Configure .env with Supabase and Google Maps API keys
   npm run dev
   ```

4. **Environment Variables**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

## 🌟 Use Cases

- **Travel Documentation**: Map your travel experiences with photos and stories
- **Local Exploration**: Discover and remember hidden gems in your city
- **Life Timeline**: Create a geographical autobiography of significant moments
- **Memory Sharing**: Organize experiences to share with friends and family
- **Adventure Planning**: Reference past visits when planning future trips

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Google Maps API
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **Authentication**: Supabase Auth with email/password + confirmation flow
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Storage**: Supabase Storage for secure file uploads
- **Deployment**: Vercel (frontend) + Supabase (backend services)

## 📱 Screenshots & Demo

WNDR features a clean, intuitive interface that makes memory mapping effortless:
- Interactive map with memory clustering
- Beautiful chronological memory timeline
- AI-powered memory creation with mood-based tags
- Real-time password validation and smart forms
- Smooth animations and transitions
- Mobile-responsive design

## 🔧 Development Features

### Supabase Backend Architecture
- **Row Level Security (RLS)**: Database-level security ensuring users only see their own data
- **Real-time subscriptions**: Live data synchronization across sessions
- **Automatic email confirmation**: Secure user registration flow
- **Cloud storage**: Secure file uploads with automatic public URL generation

### AI-Powered Enhancements
- **Smart AI Generation**: Optional "✨ AI Generate" button for title/description creation
- **Mood-Based Tags**: 6 different moods with automatic tag generation
- **User Input Protection**: AI never overwrites user-typed content
- **Context-Aware**: AI uses mood and location for relevant suggestions

### Security & Deployment
- **Environment Variables**: Sensitive keys stored securely
- **CI/CD Pipeline**: Automatic deployments on GitHub push
- **Serverless Architecture**: No server maintenance required
- **Enterprise-grade**: Supabase provides enterprise-level security and performance

## 🤝 Contributing

WNDR is built with modern web technologies and follows best practices for scalability and maintainability. The Supabase backend eliminates server management complexity while providing enterprise-grade security and performance.

## 📄 License

Personal memory mapping application project.

---

**Built with ❤️, Racing Sans One font, and powered by Supabase** 🗺️✨