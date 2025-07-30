import React, { useState } from 'react';

interface MapType {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface MapTypeSelectorProps {
  selectedMapType: string;
  onMapTypeChange: (mapType: string) => void;
  isDarkMode: boolean;
  onDarkModeToggle: () => void;
  is3D: boolean;
  on3DToggle: () => void;
}

const mapTypes: MapType[] = [
  {
    id: 'roadmap',
    name: 'Road',
    icon: '🗺️',
    description: 'Default road map view'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    icon: '🛰️',
    description: 'Satellite imagery'
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    icon: '🔄',
    description: 'Satellite with road overlay'
  },
  {
    id: 'terrain',
    name: 'Terrain',
    icon: '🏔️',
    description: 'Topographical terrain view'
  },
  {
    id: 'globe',
    name: 'Globe',
    icon: '🌍',
    description: 'Global sphere view of Earth'
  }
];

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({
  selectedMapType,
  onMapTypeChange,
  isDarkMode,
  onDarkModeToggle,
  is3D,
  on3DToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMap = mapTypes.find(type => type.id === selectedMapType) || mapTypes[0];

  return (
    <div className="absolute top-4 left-4 z-50">
      {/* Map Type Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white backdrop-blur-sm bg-opacity-90 rounded-xl px-3 py-2 shadow-neu-btn hover:shadow-neu-in transition-all border border-warmgray flex items-center gap-2 text-charcoal font-medium"
        >
          <span className="text-lg">{selectedMap.icon}</span>
          <span className="text-sm">{selectedMap.name}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 bg-white backdrop-blur-sm bg-opacity-95 rounded-xl shadow-neu-sw border border-warmgray min-w-48 overflow-hidden">
            {mapTypes.map((mapType) => (
              <button
                key={mapType.id}
                onClick={() => {
                  onMapTypeChange(mapType.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-mint transition-colors flex items-center gap-3 ${
                  selectedMapType === mapType.id ? 'bg-mint' : ''
                }`}
              >
                <span className="text-lg">{mapType.icon}</span>
                <div>
                  <div className="font-medium text-charcoal">{mapType.name}</div>
                  <div className="text-xs text-warmgray">{mapType.description}</div>
                </div>
                {selectedMapType === mapType.id && (
                  <svg className="w-4 h-4 ml-auto text-coral" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
            
            {/* 3D Toggle */}
            <div className="border-t border-warmgray px-4 py-3">
              <button
                onClick={on3DToggle}
                className={`w-full flex items-center gap-3 hover:bg-mint rounded-lg px-2 py-2 transition-colors ${
                  !['satellite', 'hybrid', 'globe'].includes(selectedMapType) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!['satellite', 'hybrid', 'globe'].includes(selectedMapType)}
              >
                <span className="text-lg">🏢</span>
                <div>
                  <div className="font-medium text-charcoal">3D View</div>
                  <div className="text-xs text-warmgray">
                    {['satellite', 'hybrid', 'globe'].includes(selectedMapType) 
                      ? (selectedMapType === 'globe' ? '3D globe perspective' : '3D buildings and terrain')
                      : 'Available in satellite/hybrid/globe mode'
                    }
                  </div>
                </div>
                <div className={`ml-auto w-12 h-6 rounded-full border-2 border-warmgray relative transition-colors ${
                  is3D ? 'bg-coral' : 'bg-cream'
                }`}>
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${
                    is3D ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>
            
            {/* Day/Night Toggle */}
            <div className="border-t border-warmgray px-4 py-3">
              <button
                onClick={onDarkModeToggle}
                className="w-full flex items-center gap-3 hover:bg-mint rounded-lg px-2 py-2 transition-colors"
              >
                <span className="text-lg">{isDarkMode ? '🌙' : '☀️'}</span>
                <div>
                  <div className="font-medium text-charcoal">
                    {isDarkMode ? 'Night Mode' : 'Day Mode'}
                  </div>
                  <div className="text-xs text-warmgray">
                    {isDarkMode ? 'Switch to day theme' : 'Switch to night theme'}
                  </div>
                </div>
                <div className={`ml-auto w-12 h-6 rounded-full border-2 border-warmgray relative transition-colors ${
                  isDarkMode ? 'bg-charcoal' : 'bg-cream'
                }`}>
                  <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTypeSelector;