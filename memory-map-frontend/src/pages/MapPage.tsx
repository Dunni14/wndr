import React, { useState, useMemo } from "react";
import MapContainer from "../components/Map/MapContainer";
import MemoryForm from "../components/Memory/MemoryForm";

interface Memory {
  lat: number;
  lng: number;
  imageUrl?: string;
  title?: string;
  description?: string;
  visitDate?: string;
}

const MapPage: React.FC = () => {
  const [pending, setPending] = useState<{ lat: number; lng: number } | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [memoryNavIndex, setMemoryNavIndex] = useState<number>(0);

  // Group memories by location (rounded lat/lng)
  const groupedMemories = useMemo(() => {
    const groups: Record<string, Memory[]> = {};
    memories.forEach(mem => {
      const key = `${mem.lat.toFixed(5)},${mem.lng.toFixed(5)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(mem);
    });
    return groups;
  }, [memories]);

  // When a memory is selected, set nav index to its position in the group
  const handleSelectMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    const key = `${memory.lat.toFixed(5)},${memory.lng.toFixed(5)}`;
    const group = groupedMemories[key] || [];
    const idx = group.findIndex(m => m === memory);
    setMemoryNavIndex(idx >= 0 ? idx : 0);
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

  const handleSubmit = (data: any) => {
    const addMemory = (imageUrl?: string) => {
      setMemories((prev) => [
        ...prev,
        {
          lat: pending!.lat,
          lng: pending!.lng,
          imageUrl,
          title: data.title,
          description: data.description,
          visitDate: data.visitDate,
        },
      ]);
    };
    if (data.files && data.files.length > 0) {
      const file = data.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        addMemory(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      addMemory();
    }
    setPending(null);
  };

  return (
    <div className="h-screen relative bg-cream w-full">
      {/* Centered WNDR title overlay */}
      <div
        className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none font-logo text-4xl tracking-wider text-charcoal drop-shadow-lg"
      >
        WNDR
      </div>
      {/* Plus button in top right */}
      <button
        className="absolute top-4 right-4 z-50 bg-coral text-charcoal rounded-xl w-14 h-14 flex items-center justify-center shadow-neu-btn hover:shadow-neu-in text-3xl focus:outline-none transition-all border border-warmgray"
        onClick={handlePlusClick}
        aria-label="Add Memory"
      >
        +
      </button>
      <MapContainer
        onMapClick={() => {}}
        memories={memories}
        onMarkerClick={handleSelectMemory}
      />
      {pending && (
        <MemoryForm
          latitude={pending.lat}
          longitude={pending.lng}
          onSubmit={handleSubmit}
          onCancel={() => setPending(null)}
        />
      )}
      {selectedMemory && (() => {
        const key = `${selectedMemory.lat.toFixed(5)},${selectedMemory.lng.toFixed(5)}`;
        const group = groupedMemories[key] || [];
        const current = group[memoryNavIndex] || selectedMemory;
        return (
          <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-lavender bg-opacity-70 pointer-events-auto"
              onClick={() => setSelectedMemory(null)}
            />
            {/* Bottom sheet */}
            <div
              className="relative w-full max-w-2xl mx-auto bg-mint rounded-t-3xl p-6 shadow-neu-sw pointer-events-auto animate-slideUp border-t-2 border-warmgray"
              style={{ minHeight: '40vh' }}
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
                <h3 className="text-lg font-semibold mb-1 text-center text-warmgray">{current.visitDate}</h3>
                <h1 className="text-2xl font-bold mb-2 text-center text-charcoal">{current.title}</h1>
                <p className="text-charcoal text-center mb-2">{current.description}</p>
              </div>
              {/* Arrows for navigation if multiple memories */}
              {group.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    className="pointer-events-auto bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
                    style={{ visibility: memoryNavIndex > 0 ? 'visible' : 'hidden' }}
                    onClick={() => setMemoryNavIndex(i => Math.max(0, i - 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-charcoal">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    className="pointer-events-auto bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition"
                    style={{ visibility: memoryNavIndex < group.length - 1 ? 'visible' : 'hidden' }}
                    onClick={() => setMemoryNavIndex(i => Math.min(group.length - 1, i + 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6 text-charcoal">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              {/* Drag handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-warmgray rounded-full mb-4" />
            </div>
          </div>
        );
      })()}
      {locationError && (
        <div className="fixed top-20 right-4 bg-coral text-charcoal px-4 py-2 rounded shadow-neu-btn z-50 border border-warmgray">
          {locationError}
        </div>
      )}
      {/* Pill-shaped profile nav bar (smaller, centered) */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center">
        <div className="flex items-center justify-between px-4 py-2 bg-white rounded-full shadow-neu-sw backdrop-blur-md max-w-md w-full mx-auto">
          {/* Profile Avatar */}
          <div className="w-10 h-10 rounded-full shadow-neu-in bg-warmgray flex items-center justify-center">
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
          </div>
          {/* Nav Buttons */}
          <div className="flex gap-4 mx-auto text-sm font-medium text-gray-700">
            <button className="hover:text-black transition">Challenges</button>
            <button className="hover:text-black transition">Memories</button>
            <button className="hover:text-black transition">Friends</button>
          </div>
          {/* Settings Cogwheel */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
              className="w-5 h-5 text-gray-700"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8c-.962 0-1.842.389-2.475 1.025a3.5 3.5 0 000 4.95A3.482 3.482 0 0012 15.5a3.5 3.5 0 100-7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v1.5m6.364 1.636l-1.06 1.06m2.121 4.304H21m-1.636 6.364l-1.06-1.06M12 21v-1.5m-6.364-1.636l1.06-1.06M3 12h1.5m1.636-6.364l1.06 1.06" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage; 