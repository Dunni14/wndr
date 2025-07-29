# WNDR 🗺️

**WNDR** is a memory mapping application that allows users to capture, organize, and explore their life experiences through an interactive map interface. Create visual memories tied to specific locations and watch your personal journey unfold geographically.

## 🎯 What is WNDR?

WNDR transforms the way you document and revisit your life experiences. Instead of scattered photos and notes, WNDR creates a geographical timeline of your memories. Whether it's a perfect sunset at the beach, a cozy café discovery, or an adventure in a new city, WNDR helps you map your story.

## ✨ Key Features

- **📍 Interactive Memory Mapping**: Pin memories to exact locations on Google Maps
- **📱 Dual Location Options**: Use current GPS location or manually select any spot on the map
- **📸 Rich Memory Creation**: Add photos, titles, descriptions, moods, and visit dates
- **🔗 Smart Clustering**: Memories automatically group based on zoom level (like Apple Photos)
- **🔐 Secure Authentication**: Phone-based login with SMS verification
- **📊 Multiple Views**: Map, gallery, and chronological timeline views
- **✏️ Cross-Platform Editing**: Edit memories from any view in the app
- **🎨 Modern Design**: Racing Sans One font with neumorphic design elements

## 🏗️ Architecture

WNDR is built as a full-stack TypeScript application:

### Frontend (`/memory-map-frontend`)
- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- Google Maps JavaScript API
- Phone-based authentication flow

### Backend (`/memory-map-backend`) 
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT authentication + Twilio SMS
- RESTful API for memory CRUD operations

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dunni14/wndr.git
   cd wndr
   ```

2. **Setup Backend**
   ```bash
   cd memory-map-backend
   npm install
   # Configure .env with database and API keys
   npx prisma migrate dev
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../memory-map-frontend
   npm install
   # Configure .env with Google Maps API key
   npm run dev
   ```

## 🌟 Use Cases

- **Travel Documentation**: Map your travel experiences with photos and stories
- **Local Exploration**: Discover and remember hidden gems in your city
- **Life Timeline**: Create a geographical autobiography of significant moments
- **Memory Sharing**: Organize experiences to share with friends and family
- **Adventure Planning**: Reference past visits when planning future trips

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Google Maps API
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Authentication**: JWT + Twilio SMS verification
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vite build system with modern web standards

## 📱 Screenshots & Demo

WNDR features a clean, intuitive interface that makes memory mapping effortless:
- Interactive map with memory clustering
- Beautiful chronological memory timeline
- Smooth animations and transitions
- Mobile-responsive design

## 🤝 Contributing

WNDR is built with modern web technologies and follows best practices. Contributions are welcome!

## 📄 License

Personal memory mapping application project.

---

**Start mapping your memories with WNDR today! 🗺️✨**