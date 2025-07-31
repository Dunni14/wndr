import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlacesAutocomplete from '../Places/PlacesAutocomplete';

interface MemoryFormProps {
  latitude: number;
  longitude: number;
  onSubmit: (data: {
    title: string;
    description: string;
    mood: string;
    visitDate: string;
    files: File[];
  }) => void;
  onCancel: () => void;
  onLocationChange?: (lat: number, lng: number) => void;
}

// Add your Google Maps API key here or import from config
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Helper to fetch location name from lat/lng
async function getLocationName(lat: number, lng: number): Promise<string> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK' && data.results.length > 0) {
      // Use the first result's formatted address or a more specific component
      return data.results[0].formatted_address;
    }
    return `(${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  } catch (e) {
    return `(${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  }
}

// Mood-based tags mapping
const moodTags: Record<string, string[]> = {
  happy: ['joy', 'celebration', 'sunshine', 'laughter'],
  peaceful: ['calm', 'serene', 'tranquil', 'meditation'],
  adventurous: ['exploration', 'journey', 'discovery', 'thrill'],
  nostalgic: ['memories', 'reflection', 'vintage', 'reminiscence'],
  romantic: ['love', 'intimate', 'dreamy', 'heart'],
  exciting: ['energy', 'dynamic', 'vibrant', 'rush']
};

// Placeholder for AI generation function
async function aiGenerateTitleAndDescription(mood: string, locationName: string) {
  // Simulate API call delay
  await new Promise(res => setTimeout(res, 800));
  return {
    title: `A ${mood} memory at ${locationName}`,
    description: `This is a ${mood} experience I had at ${locationName}.`
  };
}

const MemoryForm: React.FC<MemoryFormProps> = ({
  latitude,
  longitude,
  onSubmit,
  onCancel,
  onLocationChange
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('');
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [files, setFiles] = useState<File[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [currentLatitude, setCurrentLatitude] = useState(latitude);
  const [currentLongitude, setCurrentLongitude] = useState(longitude);
  const [userHasTypedTitle, setUserHasTypedTitle] = useState(false);
  const [userHasTypedDescription, setUserHasTypedDescription] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch location name when lat/lng change
  useEffect(() => {
    let isMounted = true;
    getLocationName(currentLatitude, currentLongitude).then(name => {
      if (isMounted) setLocationName(name);
    });
    return () => { isMounted = false; };
  }, [currentLatitude, currentLongitude]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place: {
    description: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => {
    setCurrentLatitude(place.lat);
    setCurrentLongitude(place.lng);
    onLocationChange?.(place.lat, place.lng);
  };

  // Update tags when mood changes
  useEffect(() => {
    if (mood && moodTags[mood]) {
      setSelectedTags(moodTags[mood]);
    } else {
      setSelectedTags([]);
    }
  }, [mood]);

  // Handle AI generation
  const handleAIGeneration = async () => {
    if (!mood || !locationName) return;
    
    setLoadingAI(true);
    try {
      const { title, description } = await aiGenerateTitleAndDescription(mood, locationName);
      
      // Only set title if user hasn't typed anything
      if (!userHasTypedTitle) {
        setTitle(title);
      }
      
      // Only set description if user hasn't typed anything
      if (!userHasTypedDescription) {
        setDescription(description);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onCancel}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative"
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">New Memory</h2>
          <form onSubmit={e => {
            e.preventDefault();
            onSubmit({ title, description, mood, visitDate, files });
          }} className="space-y-4">
            {/* Location Search */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <PlacesAutocomplete
                onPlaceSelect={handlePlaceSelect}
                placeholder="Search for a location or use current position"
                value={locationName}
                disabled={loadingAI}
              />
              <div className="text-xs text-gray-500">
                📍 Current: {currentLatitude.toFixed(6)}, {currentLongitude.toFixed(6)}
              </div>
            </div>
            
            <input
              type="text" placeholder="Title"
              value={title} 
              onChange={e => {
                setTitle(e.target.value);
                setUserHasTypedTitle(e.target.value.length > 0);
              }}
              required
              className="w-full px-3 py-2 border rounded"
              disabled={loadingAI}
            />
            <textarea
              placeholder="Description" rows={3}
              value={description} 
              onChange={e => {
                setDescription(e.target.value);
                setUserHasTypedDescription(e.target.value.length > 0);
              }}
              className="w-full px-3 py-2 border rounded"
              disabled={loadingAI}
            />
            <select
              value={mood} onChange={e => setMood(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={loadingAI}
            >
              <option value="">Select mood</option>
              <option value="happy">Happy</option>
              <option value="peaceful">Peaceful</option>
              <option value="adventurous">Adventurous</option>
              <option value="nostalgic">Nostalgic</option>
              <option value="romantic">Romantic</option>
              <option value="exciting">Exciting</option>
            </select>
            
            {/* Mood-based tags display */}
            {selectedTags.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Mood Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <input
              type="date" value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              disabled={loadingAI}
            />
            <div className="flex gap-2">
              <input
                type="file" accept="image/*,video/*" multiple
                onChange={e => setFiles(Array.from(e.target.files || []))}
                className="flex-1"
                disabled={loadingAI}
              />
              <button
                type="button"
                onClick={handleAIGeneration}
                disabled={loadingAI || !mood || !locationName}
                className={`px-3 py-2 text-sm rounded whitespace-nowrap ${
                  loadingAI || !mood || !locationName
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {loadingAI ? '...' : '✨ AI Generate'}
              </button>
            </div>
            {loadingAI && (
              <div className="text-center text-blue-500">Generating title and description...</div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-200 rounded"
                disabled={loadingAI}
              >
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loadingAI}
              >
                Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemoryForm; 