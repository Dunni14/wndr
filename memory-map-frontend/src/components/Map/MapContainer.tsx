import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Memory {
  id?: string;
  lat: number;
  lng: number;
  imageUrl?: string;
  title?: string;
  description?: string;
  visitDate?: string;
}

interface MapContainerProps {
  onMapClick: (lat: number, lng: number) => void;
  memories?: Memory[];
  onMarkerClick?: (memory: Memory, allMemoriesInGroup: Memory[]) => void;
}

const pinEmojiDataUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text x="0" y="40" font-size="48">📍</text></svg>`
  );

function groupMemoriesByZoom(memories: Memory[], zoomLevel: number) {
  const groups: Record<string, Memory[]> = {};
  
  // Dynamic precision based on zoom level
  // Higher zoom = more precision = less grouping
  // Lower zoom = less precision = more grouping
  let precision: number;
  if (zoomLevel >= 16) {
    precision = 5; // Very detailed - group only exact locations
  } else if (zoomLevel >= 14) {
    precision = 4; // Detailed - group very close memories
  } else if (zoomLevel >= 12) {
    precision = 3; // Medium - group nearby memories
  } else if (zoomLevel >= 10) {
    precision = 2; // Broad - group memories in same area
  } else {
    precision = 1; // Very broad - group memories in same city/region
  }
  
  memories.forEach(mem => {
    const key = `${mem.lat.toFixed(precision)},${mem.lng.toFixed(precision)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(mem);
  });
  
  return groups;
}

const MapContainer: React.FC<MapContainerProps> = ({ onMapClick, memories = [], onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const overlaysRef = useRef<google.maps.OverlayView[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['places'],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // default to NYC
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          gestureHandling: 'cooperative',
        });

        // Try to center on user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              mapInstance.setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              console.warn('User denied geolocation');
            }
          );
        }

        // Handle map click
        mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick(e.latLng.lat(), e.latLng.lng());
          }
        });

        // Handle zoom change for dynamic clustering
        mapInstance.addListener('zoom_changed', () => {
          const newZoom = mapInstance.getZoom() || 12;
          setZoomLevel(newZoom);
        });

        // Set initial zoom level
        setZoomLevel(mapInstance.getZoom() || 12);
        setMap(mapInstance);
      }
    });
  }, [onMapClick]);

  // Add markers for grouped memories
  useEffect(() => {
    if (!map) return;
    // Remove old markers and overlays
    markersRef.current.forEach(marker => marker.setMap(null));
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    const groups = groupMemoriesByZoom(memories, zoomLevel);
    Object.entries(groups).forEach(([key, group]) => {
      const mostRecent = group[group.length - 1];
      const count = group.length;
      const position = { lat: mostRecent.lat, lng: mostRecent.lng };
      let marker: google.maps.Marker | null = null;
      let overlay: google.maps.OverlayView | null = null;
      if (mostRecent.imageUrl) {
        // Custom overlay for image marker
        class ImageOverlay extends window.google.maps.OverlayView {
          div: HTMLDivElement | null = null;
          onAdd() {
            this.div = document.createElement('div');
            this.div.style.position = 'absolute';
            this.div.style.width = '56px';
            this.div.style.height = '56px';
            this.div.style.display = 'flex';
            this.div.style.alignItems = 'center';
            this.div.style.justifyContent = 'center';
            this.div.style.borderRadius = '16px';
            this.div.style.background = '#fff';
            this.div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
            this.div.style.border = '3px solid #fff';
            this.div.style.overflow = 'hidden';
            this.div.style.zIndex = count > 1 ? '10' : '1'; // Higher z-index for multi-memory markers
            // Image
            const img = document.createElement('img');
            img.src = mostRecent.imageUrl!;
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '12px';
            this.div.appendChild(img);
            // Pointer
            const pointer = document.createElement('div');
            pointer.style.position = 'absolute';
            pointer.style.left = '50%';
            pointer.style.bottom = '-12px';
            pointer.style.transform = 'translateX(-50%)';
            pointer.style.width = '0';
            pointer.style.height = '0';
            pointer.style.borderLeft = '10px solid transparent';
            pointer.style.borderRight = '10px solid transparent';
            pointer.style.borderTop = '12px solid #fff';
            this.div.appendChild(pointer);
            // Click handler
            this.div.style.cursor = 'pointer';
            this.div.onclick = () => onMarkerClick && onMarkerClick(mostRecent, group);
            const panes = this.getPanes();
            if (panes) panes.overlayMouseTarget.appendChild(this.div);
          }
          draw() {
            if (!this.div) return;
            const projection = this.getProjection();
            const pos = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(position.lat, position.lng));
            if (pos) {
              this.div.style.left = `${pos.x - 28}px`;
              this.div.style.top = `${pos.y - 56}px`;
            }
          }
          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
            }
          }
        }
        overlay = new ImageOverlay();
        overlay.setMap(map);
        overlaysRef.current.push(overlay);
      } else {
        marker = new window.google.maps.Marker({
          position,
          map,
          icon: {
            url: pinEmojiDataUrl,
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
        if (onMarkerClick) {
          marker.addListener('click', () => onMarkerClick(mostRecent, group));
        }
        markersRef.current.push(marker);
      }

      // Add badge overlay if more than 1 memory at this location
      if (count > 1) {
        const isImageMarker = !!mostRecent.imageUrl;
        
        class BadgeOverlay extends window.google.maps.OverlayView {
          div: HTMLDivElement | null = null;
          onAdd() {
            this.div = document.createElement('div');
            this.div.style.position = 'absolute';
            this.div.style.background = '#FF6B6B'; // More visible red background
            this.div.style.color = '#fff';
            this.div.style.fontWeight = 'bold';
            this.div.style.fontSize = '0.7rem';
            this.div.style.minWidth = '20px';
            this.div.style.height = '20px';
            this.div.style.display = 'flex';
            this.div.style.alignItems = 'center';
            this.div.style.justifyContent = 'center';
            this.div.style.borderRadius = '10px';
            this.div.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
            this.div.style.zIndex = '1001';
            this.div.style.border = '2px solid #fff';
            this.div.style.padding = '2px 4px';
            this.div.innerText = `+${count - 1}`;
            const panes = this.getPanes();
            if (panes) panes.overlayMouseTarget.appendChild(this.div);
          }
          draw() {
            if (!this.div) return;
            const projection = this.getProjection();
            const pos = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(position.lat, position.lng));
            if (pos) {
              // Adjust position based on marker type
              if (isImageMarker) {
                // Position for image markers (56px wide)
                this.div.style.left = `${pos.x + 18}px`;
                this.div.style.top = `${pos.y - 68}px`;
              } else {
                // Position for pin markers (40px wide)
                this.div.style.left = `${pos.x + 12}px`;
                this.div.style.top = `${pos.y - 45}px`;
              }
            }
          }
          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
            }
          }
        }
        const badgeOverlay = new BadgeOverlay();
        badgeOverlay.setMap(map);
        overlaysRef.current.push(badgeOverlay);
      }
    });
  }, [map, memories, onMarkerClick, zoomLevel]);

  return <div ref={mapRef} className="w-full h-screen cursor-crosshair" />;
};

export default MapContainer; 