import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { memoryService } from "../services/memoryService";
import { motion } from "framer-motion";

interface Memory {
  id: string;
  title: string;
  description?: string;
  mood?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  visitDate: string;
  createdAt: string;
}

interface GroupedMemories {
  [dateKey: string]: Memory[];
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth()!;
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: GroupedMemories = {};
    
    memories.forEach(memory => {
      const date = new Date(memory.visitDate);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(memory);
    });

    // Sort each group by time (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
    });

    return groups;
  }, [memories]);

  // Sort date keys (newest first)
  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedMemories).sort((a, b) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [groupedMemories]);

  useEffect(() => {
    const loadMemories = async () => {
      if (!user) return;
      
      try {
        const memories = await memoryService.getUserMemories();
        const formattedMemories = memories.map(mem => ({
          id: mem.id,
          title: mem.title,
          description: mem.description,
          mood: mem.mood,
          latitude: mem.latitude,
          longitude: mem.longitude,
          imageUrl: mem.image_url,
          visitDate: mem.visit_date,
          createdAt: mem.created_at
        }));
        setMemories(formattedMemories);
      } catch (err) {
        setError("Failed to load memories");
        console.error("Error loading memories:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-charcoal font-medium">Loading your memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Modern Header */}
      <div className="bg-cream sticky top-0 z-20 backdrop-blur-md border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* WNDR Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-logo text-3xl text-charcoal tracking-wider"
            >
              WNDR
            </motion.div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/account")}
                className="w-11 h-11 rounded-full bg-white shadow-neu-btn hover:shadow-neu-in transition-all flex items-center justify-center group"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-5 h-5 text-warmgray group-hover:text-charcoal transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </button>
              <button 
                onClick={signOut}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-white shadow-neu-btn hover:shadow-neu-in transition-all group"
                title="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  className="w-5 h-5 text-warmgray group-hover:text-red-500 transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-charcoal mb-4 tracking-tight">
            Your Memory Gallery
          </h1>
          <p className="text-warmgray text-lg mb-8 max-w-2xl mx-auto">
            Explore your captured moments and discover the stories behind each location
          </p>
          
          {/* Go to Maps Button */}
          <motion.button
            onClick={() => navigate("/map")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-neu-btn hover:shadow-neu-in transition-all font-semibold text-charcoal border border-white/40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-5 h-5 text-coral"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Go to Maps
          </motion.button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-200 rounded-2xl p-6 mb-8 shadow-neu-btn"
          >
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-2">⚠️</div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {memories.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="bg-white rounded-3xl p-12 shadow-neu-btn max-w-md mx-auto">
              <div className="text-6xl mb-6">📷</div>
              <h2 className="text-2xl font-bold text-charcoal mb-4">No memories yet</h2>
              <p className="text-warmgray mb-8 leading-relaxed">
                Start your journey by creating your first memory on the map
              </p>
              <button
                onClick={() => navigate("/map")}
                className="bg-coral text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition shadow-neu-btn"
              >
                Create First Memory
              </button>
            </div>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {memories.length > 0 && (
          <div className="space-y-12">
            {sortedDateKeys.map((dateKey, groupIndex) => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="space-y-6"
              >
                {/* Date Header */}
                <div className="text-center">
                  <div className="inline-block bg-white px-6 py-3 rounded-full shadow-neu-btn">
                    <h2 className="text-lg font-bold text-charcoal">
                      {formatDate(dateKey)}
                    </h2>
                  </div>
                </div>

                {/* Memories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {groupedMemories[dateKey].map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="bg-white rounded-2xl shadow-neu-btn hover:shadow-neu-in transition-all duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => navigate("/memories")}
                    >
                      {/* Image */}
                      <div className="aspect-square overflow-hidden">
                        {memory.imageUrl ? (
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-mint to-lavender flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              className="w-12 h-12 text-white/70"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Memory Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-charcoal text-sm mb-2 line-clamp-2 leading-tight">
                          {memory.title || 'Untitled Memory'}
                        </h3>
                        <p className="text-xs text-warmgray line-clamp-2 mb-3 leading-relaxed">
                          {memory.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-coral font-semibold bg-coral/10 px-2 py-1 rounded-full">
                            {new Date(memory.visitDate).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                          {memory.mood && (
                            <div className="text-xs bg-lavender text-charcoal px-2 py-1 rounded-full font-medium">
                              {memory.mood}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom Spacer */}
        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default Home;