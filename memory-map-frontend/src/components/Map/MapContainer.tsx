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
  mapType?: string;
  isDarkMode?: boolean;
  is3D?: boolean;
}

const pinEmojiDataUrl =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><text x="0" y="40" font-size="48">📍</text></svg>`
  );

function groupMemoriesByZoom(memories: Memory[], zoomLevel: number) {
  // Enhanced density-based clustering algorithm
  const groups: Record<string, Memory[]> = {};
  
  // Dynamic clustering parameters based on zoom level
  let clusterRadius: number; // in degrees
  let minPointsForCluster: number;
  
  if (zoomLevel >= 16) {
    clusterRadius = 0.0001; // ~11 meters
    minPointsForCluster = 2;
  } else if (zoomLevel >= 14) {
    clusterRadius = 0.0005; // ~55 meters
    minPointsForCluster = 2;
  } else if (zoomLevel >= 12) {
    clusterRadius = 0.002; // ~220 meters
    minPointsForCluster = 2;
  } else if (zoomLevel >= 10) {
    clusterRadius = 0.008; // ~900 meters
    minPointsForCluster = 2;
  } else if (zoomLevel >= 8) {
    clusterRadius = 0.03; // ~3.3 km
    minPointsForCluster = 2;
  } else if (zoomLevel >= 6) {
    clusterRadius = 0.12; // ~13 km
    minPointsForCluster = 3;
  } else {
    clusterRadius = 0.5; // ~55 km
    minPointsForCluster = 3;
  }

  // DBSCAN-inspired clustering algorithm
  const visited = new Set<number>();
  const clustered = new Set<number>();
  let clusterId = 0;

  const calculateDistance = (mem1: Memory, mem2: Memory): number => {
    const latDiff = mem1.lat - mem2.lat;
    const lngDiff = mem1.lng - mem2.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  const getNeighbors = (memoryIndex: number): number[] => {
    const neighbors: number[] = [];
    const currentMemory = memories[memoryIndex];
    
    memories.forEach((memory, index) => {
      if (index !== memoryIndex && calculateDistance(currentMemory, memory) <= clusterRadius) {
        neighbors.push(index);
      }
    });
    
    return neighbors;
  };

  const expandCluster = (memoryIndex: number, neighbors: number[], cluster: Memory[]): boolean => {
    cluster.push(memories[memoryIndex]);
    clustered.add(memoryIndex);

    for (let i = 0; i < neighbors.length; i++) {
      const neighborIndex = neighbors[i];
      
      if (!visited.has(neighborIndex)) {
        visited.add(neighborIndex);
        const neighborNeighbors = getNeighbors(neighborIndex);
        
        if (neighborNeighbors.length >= minPointsForCluster - 1) {
          neighbors.push(...neighborNeighbors.filter(n => !neighbors.includes(n)));
        }
      }
      
      if (!clustered.has(neighborIndex)) {
        cluster.push(memories[neighborIndex]);
        clustered.add(neighborIndex);
      }
    }
    
    return true;
  };

  // Main clustering loop
  memories.forEach((memory, index) => {
    if (visited.has(index)) return;
    
    visited.add(index);
    const neighbors = getNeighbors(index);
    
    if (neighbors.length >= minPointsForCluster - 1) {
      // Create new cluster
      const cluster: Memory[] = [];
      expandCluster(index, neighbors, cluster);
      
      if (cluster.length > 0) {
        // Use centroid as cluster key
        const centroidLat = cluster.reduce((sum, mem) => sum + mem.lat, 0) / cluster.length;
        const centroidLng = cluster.reduce((sum, mem) => sum + mem.lng, 0) / cluster.length;
        const key = `cluster_${clusterId}_${centroidLat.toFixed(6)}_${centroidLng.toFixed(6)}`;
        groups[key] = cluster;
        clusterId++;
      }
    } else {
      // Single point (noise in DBSCAN terms, but we'll keep it as individual point)
      if (!clustered.has(index)) {
        const key = `single_${index}_${memory.lat.toFixed(6)}_${memory.lng.toFixed(6)}`;
        groups[key] = [memory];
      }
    }
  });

  // Fallback to grid-based clustering for very high zoom levels or if no clusters formed
  if (Object.keys(groups).length === 0 || zoomLevel >= 18) {
    memories.forEach(mem => {
      const precision = Math.max(6, 8 - Math.floor(zoomLevel / 2));
      const key = `grid_${mem.lat.toFixed(precision)}_${mem.lng.toFixed(precision)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(mem);
    });
  }
  
  return groups;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  onMapClick, 
  memories = [], 
  onMarkerClick, 
  mapType = 'roadmap', 
  isDarkMode = false, 
  is3D = false
}) => {
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
          mapTypeId: mapType as google.maps.MapTypeId,
          styles: isDarkMode ? [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }]
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }]
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }]
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }]
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }]
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }]
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }]
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }]
            }
          ] : undefined,
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

  // Update map type when props change
  useEffect(() => {
    if (!map) return;
    
    // Handle globe view separately
    if (mapType === 'globe') {
      // Set to satellite view for the globe effect
      map.setMapTypeId('satellite');
      
      // Globe view: zoom out to show entire Earth and set center to middle of world
      map.setCenter({ lat: 0, lng: 0 });
      map.setZoom(2);
      
      // Apply tilt for 3D globe effect - enhanced if 3D mode is enabled
      map.setTilt(is3D ? 45 : 15);
      map.setHeading(0);
    } else {
      map.setMapTypeId(mapType as google.maps.MapTypeId);
      
      // Apply 3D tilt and heading if 3D mode is enabled
      if (is3D && (mapType === 'satellite' || mapType === 'hybrid')) {
        map.setTilt(45);
        map.setHeading(0);
      } else {
        map.setTilt(0);
        map.setHeading(0);
      }
    }
    
    // Apply dark mode styles only if not in satellite/hybrid/globe mode (as they have their own colors)
    if (mapType === 'roadmap' || mapType === 'terrain') {
      map.setOptions({
        styles: isDarkMode ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }]
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }]
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }]
          }
        ] : undefined
      });
    } else {
      // Remove custom styles for satellite/hybrid/globe modes
      map.setOptions({ styles: undefined });
    }
  }, [map, mapType, isDarkMode, is3D]);

  // Add markers for grouped memories
  useEffect(() => {
    if (!map) return;
    // Remove old markers and overlays
    markersRef.current.forEach(marker => marker.setMap(null));
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    const groups = groupMemoriesByZoom(memories, zoomLevel);
    Object.entries(groups).forEach(([_key, group]) => {
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