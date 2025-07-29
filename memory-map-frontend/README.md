# WNDR 🗺️

**WNDR** is a memory mapping application that allows users to capture, organize, and explore their life experiences through an interactive map interface. Create visual memories tied to specific locations and watch your personal journey unfold geographically.

## ✨ Features

### 🎯 Core Functionality
- **Interactive Memory Mapping**: Pin memories to any location on an interactive Google Maps interface
- **Dual Location Selection**: Add memories at your current GPS location or manually select any location by clicking on the map
- **Rich Memory Creation**: Attach photos, titles, descriptions, moods, and visit dates to each memory
- **Smart Memory Clustering**: Dynamic grouping of nearby memories based on zoom level, similar to Apple Photos app

### 📱 User Experience
- **Phone-Based Authentication**: Secure login using SMS OTP verification via Twilio
- **Account Management**: Comprehensive user profiles with name, email, and phone information
- **Memory Organization**: View memories in multiple formats:
  - **Map View**: Interactive map with clustered memory markers
  - **Gallery View**: Grid layout for memories at the same location
  - **Memories Page**: Chronological timeline organized by date

### 🛠️ Memory Management
- **Full CRUD Operations**: Create, read, update, and delete memories
- **Cross-Platform Editing**: Edit memories from any view (map, gallery, or memories page)
- **Image Compression**: Automatic image optimization for faster uploads
- **User-Specific Data**: Each user's memories are private and secure

### 🎨 Design & UI
- **Racing Sans One Font**: Modern, sleek typography throughout the entire application
- **Neumorphic Design**: Soft, modern UI elements with subtle shadows
- **Responsive Layout**: Optimized for both desktop and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Google Maps JavaScript API** for interactive mapping
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL database
- **JWT** for authentication
- **Twilio** for SMS verification
- **CORS** configured for secure cross-origin requests

## 📁 Project Structure

```
wndr/
├── memory-map-backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── routes/auth.ts       # Authentication and memory endpoints
│   │   └── index.ts             # Express server configuration
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database migrations
│   └── package.json
├── memory-map-frontend/         # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── context/             # React context providers
│   │   └── services/            # API service functions
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google Maps API key
- Twilio account for SMS verification

### Backend Setup
```bash
cd memory-map-backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd memory-map-frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in both backend and frontend directories with the required API keys and database configuration.

## 🌟 Key Features in Detail

### Dynamic Memory Clustering
WNDR implements intelligent memory clustering that adapts to your zoom level:
- **Zoomed Out**: Memories group by city/region for easier navigation
- **Medium Zoom**: Memories cluster by neighborhood or area
- **Zoomed In**: Individual memories show with precise locations

### Cross-View Memory Editing
Edit your memories from anywhere in the app:
- Edit button in map view memory details
- Hover-to-edit in gallery view
- Edit button in memories page modal

### Smart Image Handling
- Automatic image compression to 800x800 max resolution
- 80% JPEG quality for optimal file sizes
- 50MB payload limit support for high-quality images

## 🤝 Contributing

WNDR is built with modern web technologies and follows best practices for scalability and maintainability. Contributions are welcome!

## 📄 License

This project is part of a personal memory mapping application.

---

**Built with ❤️ and Racing Sans One font**