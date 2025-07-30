import React, { useEffect, useRef, useState } from 'react';

interface StreetViewModalProps {
  lat: number;
  lng: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const StreetViewModal: React.FC<StreetViewModalProps> = ({
  lat,
  lng,
  isOpen,
  onClose,
  title
}) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [streetViewService, setStreetViewService] = useState<google.maps.StreetViewService | null>(null);
  const [hasStreetView, setHasStreetView] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !streetViewRef.current) return;

    const initStreetView = () => {
      const service = new google.maps.StreetViewService();
      setStreetViewService(service);
      setIsLoading(true);

      // Check if Street View is available at this location
      service.getPanorama({
        location: { lat, lng },
        radius: 100, // Increased radius for better coverage
        source: google.maps.StreetViewSource.DEFAULT
      }, (data, status) => {
        setIsLoading(false);
        
        if (status === google.maps.StreetViewStatus.OK && data && streetViewRef.current) {
          setHasStreetView(true);
          
          // Create Street View panorama
          const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
            position: data.location?.latLng || { lat, lng },
            pov: {
              heading: 0,
              pitch: 0
            },
            zoom: 1,
            addressControl: true,
            fullscreenControl: true,
            motionTracking: false,
            motionTrackingControl: false,
            showRoadLabels: true,
            enableCloseButton: false
          });

          // Simple heading calculation without geometry library
          if (data.location?.latLng) {
            const panoramaLat = data.location.latLng.lat();
            const panoramaLng = data.location.latLng.lng();
            
            // Calculate bearing from panorama to memory location
            const dLng = (lng - panoramaLng) * Math.PI / 180;
            const lat1 = panoramaLat * Math.PI / 180;
            const lat2 = lat * Math.PI / 180;
            
            const y = Math.sin(dLng) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
            
            let heading = Math.atan2(y, x) * 180 / Math.PI;
            heading = (heading + 360) % 360; // Normalize to 0-360
            
            panorama.setPov({
              heading: heading,
              pitch: 0
            });
          }
        } else {
          setHasStreetView(false);
          console.log('Street View not available:', status);
        }
      });
    };

    // Initialize Street View if Google Maps is already loaded
    if (window.google?.maps?.StreetViewService) {
      initStreetView();
    } else {
      // Google Maps not loaded yet, wait for it
      const checkGoogleMaps = () => {
        if (window.google?.maps?.StreetViewService) {
          initStreetView();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };
      checkGoogleMaps();
    }
  }, [isOpen, lat, lng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-charcoal bg-opacity-70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl h-full max-h-[80vh] mx-4 bg-white rounded-2xl shadow-neu-sw overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-warmgray bg-cream">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👁️</span>
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Street View</h2>
              {title && <p className="text-sm text-warmgray">{title}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-coral hover:bg-opacity-80 transition-colors flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="relative" style={{ height: '450px' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-coral border-t-transparent rounded-full animate-spin"></div>
                <p className="text-warmgray">Loading Street View...</p>
              </div>
            </div>
          )}
          
          {!isLoading && !hasStreetView && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream">
              <div className="text-center max-w-md mx-4">
                <div className="text-6xl mb-4">🚫</div>
                <h3 className="text-xl font-semibold text-charcoal mb-2">Street View Not Available</h3>
                <p className="text-warmgray mb-4">
                  Street View imagery is not available for this location. This may be due to:
                </p>
                <ul className="text-left text-sm text-warmgray space-y-1">
                  <li>• Remote or private location</li>
                  <li>• Indoor venue</li>
                  <li>• Recently developed area</li>
                  <li>• Privacy restrictions</li>
                </ul>
              </div>
            </div>
          )}
          
          <div 
            ref={streetViewRef} 
            className="w-full h-96 min-h-96"
            style={{ 
              display: hasStreetView && !isLoading ? 'block' : 'none',
              height: '400px'
            }}
          />
        </div>

        {/* Footer */}
        {hasStreetView && (
          <div className="p-4 bg-cream border-t border-warmgray">
            <div className="flex items-center justify-between text-sm text-warmgray">
              <div className="flex items-center gap-4">
                <span>🎯 Lat: {lat.toFixed(6)}</span>
                <span>🧭 Lng: {lng.toFixed(6)}</span>
              </div>
              <div className="text-xs">
                Use mouse to look around • Scroll to zoom
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreetViewModal;