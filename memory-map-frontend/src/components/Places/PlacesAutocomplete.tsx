import React, { useEffect, useRef, useState } from 'react';

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: {
    description: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  onPlaceSelect,
  placeholder = "Search for a place...",
  className = "",
  value = "",
  onChange,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);
  const predictionsService = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    const initializePlaces = () => {
      if (!inputRef.current) return;

      // Initialize AutocompleteService for predictions
      predictionsService.current = new google.maps.places.AutocompleteService();
      
      // Initialize PlacesService for getting place details
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );
      setPlacesService(service);
    };

    // Load Places library if not already loaded
    if (window.google?.maps?.places) {
      initializePlaces();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = initializePlaces;
      document.head.appendChild(script);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    if (newValue.length > 2 && predictionsService.current) {
      setIsLoading(true);
      
      predictionsService.current.getPlacePredictions(
        {
          input: newValue,
          types: ['establishment', 'geocode'],
          componentRestrictions: undefined // Allow worldwide suggestions
        },
        (predictions, status) => {
          setIsLoading(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions as PlaceResult[]);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  const handlePlaceSelect = (prediction: PlaceResult) => {
    if (!placesService) return;

    setIsLoading(true);
    setShowPredictions(false);
    
    // Get place details including geometry
    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'name', 'formatted_address']
      },
      (place, status) => {
        setIsLoading(false);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const location = place.geometry.location;
          setInputValue(prediction.description);
          onChange?.(prediction.description);
          
          onPlaceSelect({
            description: prediction.description,
            lat: location.lat(),
            lng: location.lng(),
            placeId: prediction.place_id
          });
        }
      }
    );
  };

  const handleInputFocus = () => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding predictions to allow for click events
    setTimeout(() => setShowPredictions(false), 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border border-warmgray bg-white text-charcoal placeholder-warmgray focus:outline-none focus:border-coral transition-colors ${className}`}
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Search icon */}
        {!isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-warmgray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Predictions dropdown */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-warmgray rounded-xl shadow-neu-sw max-h-60 overflow-y-auto z-50">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handlePlaceSelect(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-mint transition-colors flex items-start gap-3 border-b border-warmgray last:border-b-0"
            >
              <div className="flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-coral" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-charcoal truncate">
                  {prediction.structured_formatting.main_text}
                </div>
                <div className="text-sm text-warmgray truncate">
                  {prediction.structured_formatting.secondary_text}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;