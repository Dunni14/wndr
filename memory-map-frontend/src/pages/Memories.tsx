import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/SupabaseAuthContext";
import { memoryService } from "../services/memoryService";
import { motion } from "framer-motion";
import MemoryEditForm from "../components/Memory/MemoryEditForm";

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

const Memories: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth()!;
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Handle editing a memory
  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setSelectedMemory(null);
  };

  // Handle saving edited memory
  const handleSaveMemory = async (updatedData: {
    title: string;
    description: string;
    mood: string;
    visitDate: string;
    imageUrl?: string;
  }) => {
    if (!editingMemory?.id) return;

    setEditLoading(true);
    try {
      const updatedMemory = await memoryService.updateMemory(editingMemory.id, updatedData);
      // Update the memory in the local state
      setMemories(prev => prev.map(mem => 
        mem.id === editingMemory.id 
          ? {
              ...mem,
              title: updatedMemory.title,
              description: updatedMemory.description,
              visit_date: updatedMemory.visit_date,
            }
          : mem
      ));
      setEditingMemory(null);
    } catch (error) {
      console.error("Error updating memory:", error);
      setError("Failed to update memory. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle deleting a memory
  const handleDeleteMemory = async () => {
    if (!editingMemory?.id) return;

    if (!confirm("Are you sure you want to delete this memory?")) return;

    setEditLoading(true);
    try {
      await memoryService.deleteMemory(editingMemory.id);
      // Remove the memory from local state
      setMemories(prev => prev.filter(mem => mem.id !== editingMemory.id));
      setEditingMemory(null);
    } catch (error) {
      console.error("Error deleting memory:", error);
      setError("Failed to delete memory. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

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
        setMemories(memories.map(mem => ({
          id: mem.id,
          title: mem.title,
          description: mem.description,
          mood: mem.mood,
          latitude: mem.latitude,
          longitude: mem.longitude,
          imageUrl: mem.image_url,
          visitDate: mem.visit_date,
          createdAt: mem.created_at
        })));
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
        <div className="text-charcoal">Loading memories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/home")}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-6 h-6 text-charcoal"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-charcoal">Your Memories</h1>
            <div className="w-10 h-10" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {memories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">No memories yet</h2>
            <p className="text-warmgray mb-6">Start creating memories by adding them to the map!</p>
            <button
              onClick={() => navigate("/home")}
              className="bg-coral text-white px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDateKeys.map(dateKey => (
              <motion.div
                key={dateKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Date Header */}
                <div className="sticky top-20 bg-cream py-2 z-5">
                  <h2 className="text-lg font-semibold text-charcoal border-b border-warmgray pb-2">
                    {formatDate(dateKey)}
                  </h2>
                </div>

                {/* Memories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupedMemories[dateKey].map((memory, index) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-neu-btn hover:shadow-neu-in transition-all cursor-pointer overflow-hidden"
                      onClick={() => setSelectedMemory(memory)}
                    >
                      {/* Image */}
                      {memory.imageUrl ? (
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={memory.imageUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-mint flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="w-12 h-12 text-warmgray"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Memory Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-charcoal text-sm mb-1 line-clamp-2">
                          {memory.title}
                        </h3>
                        <p className="text-xs text-warmgray line-clamp-2">
                          {memory.description || 'No description'}
                        </p>
                        <div className="text-xs text-coral mt-2">
                          {new Date(memory.visitDate).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Memory Detail Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSelectedMemory(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full relative z-10"
            onClick={e => e.stopPropagation()}
          >
            {selectedMemory.imageUrl && (
              <img
                src={selectedMemory.imageUrl}
                alt={selectedMemory.title}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
            )}
            <h2 className="text-xl font-bold text-charcoal mb-2">{selectedMemory.title}</h2>
            {selectedMemory.description && (
              <p className="text-charcoal mb-4">{selectedMemory.description}</p>
            )}
            <div className="flex justify-between items-center text-sm text-warmgray mb-4">
              <span>{new Date(selectedMemory.visitDate).toLocaleDateString()}</span>
              {selectedMemory.mood && (
                <span className="bg-coral bg-opacity-20 text-coral px-2 py-1 rounded">
                  {selectedMemory.mood}
                </span>
              )}
            </div>
            
            {/* Edit Button */}
            <button
              onClick={() => handleEditMemory(selectedMemory)}
              className="w-full bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Memory
            </button>
            
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </div>
      )}

      {/* Memory Edit Form */}
      {editingMemory && (
        <MemoryEditForm
          memory={editingMemory}
          onSave={handleSaveMemory}
          onCancel={() => setEditingMemory(null)}
          onDelete={handleDeleteMemory}
          loading={editLoading}
        />
      )}
    </div>
  );
};

export default Memories;