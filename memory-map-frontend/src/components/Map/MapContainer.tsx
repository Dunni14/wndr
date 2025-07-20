import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Memory {
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
  onMarkerClick?: (memory: Memory) => void;
}

const pinEmojiDataUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text x="0" y="40" font-size="48">📍</text></svg>`
  );

function groupMemories(memories: Memory[]) {
  const groups: Record<string, Memory[]> = {};
  memories.forEach(mem => {
    const key = `${mem.lat.toFixed(5)},${mem.lng.toFixed(5)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(mem);
  });
  return groups;
}

const MapContainer: React.FC<MapContainerProps> = ({ onMapClick, memories = [], onMarkerClick }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
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

    const groups = groupMemories(memories);
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
            this.div.style.zIndex = '1';
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
            this.div.onclick = () => onMarkerClick && onMarkerClick(mostRecent);
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
          marker.addListener('click', () => onMarkerClick(mostRecent));
        }
        markersRef.current.push(marker);
      }

      // Add badge overlay if more than 1 memory at this location
      if (count > 1) {
        class BadgeOverlay extends window.google.maps.OverlayView {
          div: HTMLDivElement | null = null;
          onAdd() {
            this.div = document.createElement('div');
            this.div.className = 'absolute';
            this.div.style.position = 'absolute';
            this.div.style.top = '-8px';
            this.div.style.right = '-8px';
            this.div.style.background = '#FFD2C2'; // coral
            this.div.style.color = '#333';
            this.div.style.fontWeight = 'bold';
            this.div.style.fontSize = '0.75rem';
            this.div.style.width = '22px';
            this.div.style.height = '22px';
            this.div.style.display = 'flex';
            this.div.style.alignItems = 'center';
            this.div.style.justifyContent = 'center';
            this.div.style.borderRadius = '50%';
            this.div.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
            this.div.style.zIndex = '1000';
            this.div.innerText = `+${count - 1}`;
            const panes = this.getPanes();
            if (panes) panes.overlayMouseTarget.appendChild(this.div);
          }
          draw() {
            if (!this.div) return;
            const projection = this.getProjection();
            const pos = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(position.lat, position.lng));
            if (pos) {
              this.div.style.left = `${pos.x + 10}px`;
              this.div.style.top = `${pos.y - 32}px`;
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
  }, [map, memories, onMarkerClick]);

  return <div ref={mapRef} className="w-full h-screen" />;
};

export default MapContainer; 