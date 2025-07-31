import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/SupabaseAuthContext";
import MapContainer from "../components/Map/MapContainer";
import MapTypeSelector from "../components/Map/MapTypeSelector";
import StreetViewModal from "../components/Map/StreetViewModal";
import MemoryForm from "../components/Memory/MemoryForm";
import MemoryGallery from "../components/Memory/MemoryGallery";
import MemoryEditForm from "../components/Memory/MemoryEditForm";
import MemoryTimeline from "../components/Timeline/MemoryTimeline";
import { memoryService } from "../services/memoryService";
import { formatMemoryDate } from "../utils/dateUtils";

interface Memory {
  id?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  title?: string;
  description?: string;
  visitDate?: string;
}

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth()!;
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [_memoryNavIndex, setMemoryNavIndex] = useState<number>(0);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryMemories, setGalleryMemories] = useState<Memory[]>([]);
  const [_loading, setLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [mapType, setMapType] = useState<string>('roadmap');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [is3D, setIs3D] = useState<boolean>(false);
  const [streetViewMemory, setStreetViewMemory] = useState<Memory | null>(null);
  const [showTimeline, setShowTimeline] = useState<boolean>(false);
  
  // Handle location change from MemoryForm
  const handleLocationChange = (lat: number, lng: number) => {
    setPending({ lat, lng });
  };

  // Handle timeline memory click
  const handleTimelineMemoryClick = (memory: Memory) => {
    setShowTimeline(false);
    setSelectedMemory(memory);
  };

  // Dynamic grouping function (same as MapContainer)
  const _groupMemoriesByZoom = (_memories: Memory[], _zoomLevel: number) => {
    const groups: Record<string, Memory[]> = {};
    
    let precision: number;
    if (zoomLevel >= 16) {
      precision = 5;
    } else if (zoomLevel >= 14) {
      precision = 4;
    } else if (zoomLevel >= 12) {
      precision = 3;
    } else if (zoomLevel >= 10) {
      precision = 2;
    } else {
      precision = 1;
    }
    
    memories.forEach(mem => {
      const key = `${mem.lat.toFixed(precision)},${mem.lng.toFixed(precision)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(mem);
    });
    
    return groups;
  };

  // Load user memories on component mount
  useEffect(() => {
    const loadMemories = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const memories = await memoryService.getUserMemories();
        // Convert database memories to frontend format
        const formattedMemories = memories.map((memory: any) => ({
          id: memory.id,
          lat: memory.latitude,
          lng: memory.longitude,
          imageUrl: memory.image_url,
          title: memory.title,
          description: memory.description,
          visitDate: memory.visit_date,
        }));
        setMemories(formattedMemories);
      } catch (error) {
        console.error("Error loading memories:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, [user]);

  // When a memory is selected, use the group passed from MapContainer
  const handleSelectMemory = (memory: Memory, allMemoriesInGroup: Memory[]) => {
    if (allMemoriesInGroup.length > 1) {
      // Show gallery for multiple memories
      setGalleryMemories(allMemoriesInGroup);
      setShowGallery(true);
    } else {
      // Show single memory detail
      setSelectedMemory(memory);
      setMemoryNavIndex(0);
    }
  };

  // Handle selecting a specific memory from the gallery
  const handleGalleryMemorySelect = (memory: Memory) => {
    setShowGallery(false);
    setSelectedMemory(memory);
    setMemoryNavIndex(0);
  };

  // Handle editing a memory
  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setSelectedMemory(null);
    setShowGallery(false);
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
      const updatedMemory = await memoryService.updateMemory(editingMemory.id, {
        title: updatedData.title,
        description: updatedData.description,
        mood: updatedData.mood,
        visit_date: updatedData.visitDate,
        image_url: updatedData.imageUrl
      });
      
      // Update the memory in the local state
      setMemories(prev => prev.map(mem => 
        mem.id === editingMemory.id 
          ? {
              ...mem,
              title: updatedMemory.title,
              description: updatedMemory.description,
              visitDate: updatedMemory.visit_date,
              // Note: We don't update lat/lng as they can't be changed
            }
          : mem
      ));
      setEditingMemory(null);
    } catch (error) {
      console.error("Error updating memory:", error);
      setLocationError("Failed to update memory. Please try again.");
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
      setLocationError("Failed to delete memory. Please try again.");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePlusClick = () => {
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPending({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocationError('Could not get your location. Please allow location access.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  };

  // Handle manual location selection by clicking on the map
  const handleMapClick = (lat: number, lng: number) => {
    setLocationError(null);
    setPending({ lat, lng });
  };

  const handleSubmit = async (data: any) => {
    console.log("HandleSubmit called with data:", data);
    console.log("User available:", !!user);
    console.log("Pending location:", pending);

    if (!user || !pending) {
      console.error("Missing user or pending location");
      setLocationError("Authentication error. Please try logging in again.");
      return;
    }

    setLoading(true);
    try {
      const processAndSaveMemory = async (imageUrl?: string) => {
        const memoryData = {
          title: data.title,
          description: data.description,
          mood: data.mood,
          latitude: pending.lat,
          longitude: pending.lng,
          image_url: imageUrl,
          visit_date: data.visitDate,
        };

        console.log("Saving memory with data:", memoryData);
        
        try {
          const newMemory = await memoryService.createMemory(memoryData);
          console.log("Create memory response:", newMemory);
          
          // Add to local state for immediate UI update
          const formattedMemory = {
            id: newMemory.id,
            lat: pending.lat,
            lng: pending.lng,
            imageUrl: newMemory.image_url,
            title: data.title,
            description: data.description,
            visitDate: data.visitDate,
          };
          setMemories((prev) => [...prev, formattedMemory]);
          console.log("Memory added to local state");
        } catch (saveError) {
          console.error("Error in createMemory:", saveError);
          setLocationError("Failed to save memory. Please check your connection.");
        }
      };

      if (data.files && data.files.length > 0) {
        const file = data.files[0];
        
        try {
          // Upload image to Supabase storage
          const imageUrl = await memoryService.uploadImage(file);
          await processAndSaveMemory(imageUrl);
        } catch (fileError) {
          console.error("Error uploading image:", fileError);
          setLocationError("Failed to upload image. Please try again.");
        }
      } else {
        await processAndSaveMemory();
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setLocationError("Failed to save memory. Please try again.");
    } finally {
      setLoading(false);
      setPending(null);
    }
  };

  return (
    <div className="h-screen relative bg-cream w-full">
      {/* Centered WNDR title overlay */}
      <div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none font-logo text-4xl tracking-wider text-charcoal drop-shadow-lg"
      >
        WNDR
      </div>
      
      {/* Instruction overlay */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full shadow-neu-btn text-sm text-charcoal font-medium">
          📍 Click anywhere on the map to add a memory
        </div>
      </div>
      {/* Plus button in top right */}
      <button
        className="absolute top-4 right-4 z-50 bg-coral text-charcoal rounded-xl w-14 h-14 flex items-center justify-center shadow-neu-btn hover:shadow-neu-in text-3xl focus:outline-none transition-all border border-warmgray"
        onClick={handlePlusClick}
        aria-label="Add Memory at Current Location"
        title="Add memory at your current location"
      >
        +
      </button>
      <MapTypeSelector
        selectedMapType={mapType}
        onMapTypeChange={setMapType}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
        is3D={is3D}
        on3DToggle={() => setIs3D(!is3D)}
      />
      <MapContainer
        onMapClick={handleMapClick}
        memories={memories}
        onMarkerClick={handleSelectMemory}
        mapType={mapType}
        isDarkMode={isDarkMode}
        is3D={is3D}
      />
      {pending && (
        <MemoryForm
          latitude={pending.lat}
          longitude={pending.lng}
          onSubmit={handleSubmit}
          onCancel={() => setPending(null)}
          onLocationChange={handleLocationChange}
        />
      )}
      {editingMemory && (
        <MemoryEditForm
          memory={editingMemory}
          onSave={handleSaveMemory}
          onCancel={() => setEditingMemory(null)}
          onDelete={handleDeleteMemory}
          loading={editLoading}
        />
      )}
      {showGallery && (
        <MemoryGallery
          memories={galleryMemories}
          onClose={() => setShowGallery(false)}
          onSelectMemory={handleGalleryMemorySelect}
          onEditMemory={handleEditMemory}
        />
      )}
      <AnimatePresence>
        {selectedMemory && !showGallery && (() => {
          const current = selectedMemory;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-charcoal bg-opacity-70 backdrop-blur-sm pointer-events-auto"
                onClick={() => setSelectedMemory(null)}
              />
              {/* Centered Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative w-full max-w-md mx-4 bg-mint rounded-2xl p-6 shadow-neu-sw pointer-events-auto border-2 border-warmgray"
                onClick={e => e.stopPropagation()}
              >
              <div className="flex flex-col items-center">
                {current.imageUrl && (
                  <img
                    src={current.imageUrl}
                    alt={current.title || 'Memory'}
                    className="w-24 h-24 rounded-full shadow-neu-in object-cover mb-4 border-4 border-cream"
                  />
                )}
                <h3 className="text-lg font-semibold mb-1 text-center text-warmgray">
                  {formatMemoryDate(current.visitDate)}
                </h3>
                <h1 className="text-2xl font-bold mb-2 text-center text-charcoal">{current.title}</h1>
                <p className="text-charcoal text-center mb-4">{current.description}</p>
                
                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStreetViewMemory(current)}
                    className="bg-mint text-charcoal px-4 py-2 rounded-lg font-medium hover:bg-opacity-80 transition flex items-center gap-2"
                  >
                    <span className="text-lg">👁️</span>
                    Street View
                  </button>
                  <button
                    onClick={() => handleEditMemory(current)}
                    className="bg-coral text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition flex items-center gap-2"
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
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-coral hover:bg-opacity-80 transition-colors flex items-center justify-center text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
      {locationError && (
        <div className="fixed top-20 right-4 bg-coral text-charcoal px-4 py-2 rounded shadow-neu-btn z-50 border border-warmgray">
          {locationError}
        </div>
      )}
      {/* Pill-shaped profile nav bar (smaller, centered) */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <div className="flex items-center justify-between px-4 py-2 bg-white rounded-full shadow-neu-sw backdrop-blur-md max-w-md w-full mx-auto">
          {/* Profile Avatar */}
          <button
            onClick={() => navigate("/account")}
            className="w-10 h-10 rounded-full shadow-neu-in bg-warmgray flex items-center justify-center hover:bg-opacity-80 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>
          {/* Nav Buttons */}
          <div className="flex gap-4 mx-auto text-sm font-medium text-gray-700">
            <button 
              onClick={() => navigate("/home")}
              className="hover:text-black transition"
            >
              Home
            </button>
            <button 
              onClick={() => navigate("/memories")}
              className="hover:text-black transition"
            >
              Memories
            </button>
            <button 
              onClick={() => setShowTimeline(true)}
              className="hover:text-black transition flex items-center gap-1"
            >
              <span>📅</span>
              Timeline
            </button>
            <button className="hover:text-black transition">Friends</button>
          </div>
          {/* Logout Button */}
          <button 
            onClick={() => navigate('/login')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-100 transition-all group"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              className="w-5 h-5 text-gray-700 group-hover:text-red-600 transition-colors"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Street View Modal */}
      {streetViewMemory && (
        <StreetViewModal
          lat={streetViewMemory.lat}
          lng={streetViewMemory.lng}
          isOpen={!!streetViewMemory}
          onClose={() => setStreetViewMemory(null)}
          title={streetViewMemory.title}
        />
      )}
      
      {/* Memory Timeline */}
      <MemoryTimeline
        memories={memories}
        onMemoryClick={handleTimelineMemoryClick}
        onClose={() => setShowTimeline(false)}
        isOpen={showTimeline}
      />
    </div>
  );
};

export default MapPage; 