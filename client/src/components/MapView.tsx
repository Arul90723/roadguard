import React, { useEffect, useRef, useState } from 'react';
import { Incident, RoadSegment, RouteOption } from '../types';
import { Layers, TrafficCone, Compass, Satellite } from 'lucide-react';

declare const google: any;

interface Props {
  incidents: Incident[];
  roadSegments?: RoadSegment[];
  selectedIncident?: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  activeRoute?: RouteOption | null;
  userLocation?: { lat: number; lng: number } | null;
  onMapClick?: (lat: number, lng: number) => void;
  heightClass?: string;
}

// Custom Dark Navy Theme Style for Google Maps
const DARK_NAVY_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0b132b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#070d1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0c2238' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1c2541' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#273459' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1c2541' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#061325' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0284c7' }],
  },
];

export const MapView: React.FC<Props> = ({
  incidents,
  roadSegments = [],
  selectedIncident,
  onSelectIncident,
  activeRoute,
  userLocation,
  onMapClick,
  heightClass = 'h-[550px]'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const routePolylineRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);

  const [isTrafficActive, setIsTrafficActive] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current) return;
    if (typeof google === 'undefined' || !google.maps) {
      console.warn('Google Maps API not yet loaded.');
      return;
    }

    if (!googleMapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 9.9816, lng: 76.2999 }, // Kochi, Kerala
        zoom: 13,
        styles: DARK_NAVY_MAP_STYLE,
        disableDefaultUI: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
        },
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      infoWindowRef.current = new google.maps.InfoWindow();
      trafficLayerRef.current = new google.maps.TrafficLayer();

      if (onMapClick) {
        map.addListener('click', (e: any) => {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        });
      }

      googleMapRef.current = map;
      setMapLoaded(true);
    }
  }, []);

  // Toggle Traffic Layer
  const toggleTraffic = () => {
    if (!googleMapRef.current || !trafficLayerRef.current) return;
    if (isTrafficActive) {
      trafficLayerRef.current.setMap(null);
      setIsTrafficActive(false);
    } else {
      trafficLayerRef.current.setMap(googleMapRef.current);
      setIsTrafficActive(true);
    }
  };

  // Update Hazard Markers
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // User Location Marker
    if (userLocation) {
      const userMarker = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: googleMapRef.current,
        title: 'Your Current GPS Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#06b6d4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userMarker);
    }

    // Incidents Markers
    incidents.forEach(inc => {
      let fillColor = '#eab308'; // Moderate (Yellow)
      let strokeColor = '#fef08a';
      let scale = 9;

      if (inc.status === 'resolved') {
        fillColor = '#10b981'; // Green
        strokeColor = '#a7f3d0';
      } else if (inc.severity === 'critical') {
        fillColor = '#ef4444'; // Red
        strokeColor = '#fecaca';
        scale = 11;
      } else if (inc.severity === 'high') {
        fillColor = '#f97316'; // Orange
        strokeColor = '#ffedd5';
        scale = 10;
      } else if (inc.severity === 'low') {
        fillColor = '#3b82f6'; // Blue
        strokeColor = '#dbeafe';
      }

      const isSelected = selectedIncident?.id === inc.id;

      const marker = new google.maps.Marker({
        position: { lat: inc.latitude, lng: inc.longitude },
        map: googleMapRef.current,
        title: inc.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? scale + 3 : scale,
          fillColor,
          fillOpacity: 0.95,
          strokeColor: isSelected ? '#38bdf8' : strokeColor,
          strokeWeight: isSelected ? 4 : 2,
        },
      });

      marker.addListener('click', () => {
        onSelectIncident(inc);

        const content = `
          <div style="color: #0b132b; font-family: sans-serif; padding: 4px; max-width: 240px;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">
              ${inc.category.replace(/_/g, ' ')}
            </div>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">
              ${inc.title}
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 4px;">
              ${inc.locationName}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
              <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; background: #f1f5f9; border-radius: 4px;">
                ${inc.severity.toUpperCase()}
              </span>
              <span style="font-size: 11px; font-weight: bold; color: #0891b2;">
                Priority: ${inc.priorityScore}/100
              </span>
            </div>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  }, [incidents, selectedIncident, userLocation, mapLoaded]);

  // Update Road Risk Segments
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    roadSegments.forEach(seg => {
      let strokeColor = '#06b6d4';
      if (seg.riskScore > 75) strokeColor = '#ef4444';
      else if (seg.riskScore > 50) strokeColor = '#f97316';

      const polyline = new google.maps.Polyline({
        path: [
          { lat: seg.startLat, lng: seg.startLng },
          { lat: seg.endLat, lng: seg.endLng }
        ],
        geodesic: true,
        strokeColor,
        strokeOpacity: 0.8,
        strokeWeight: 6,
        map: googleMapRef.current,
      });

      polylinesRef.current.push(polyline);
    });
  }, [roadSegments, mapLoaded]);

  // Update Route Polyline
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    if (activeRoute && activeRoute.coordinates.length > 0) {
      let strokeColor = '#06b6d4';
      if (activeRoute.routeQualityScore === 'D') strokeColor = '#ef4444';
      else if (activeRoute.routeQualityScore === 'C') strokeColor = '#f97316';
      else if (activeRoute.routeQualityScore === 'B') strokeColor = '#eab308';

      const path = activeRoute.coordinates.map(([lat, lng]) => ({ lat, lng }));

      const poly = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: googleMapRef.current,
      });

      routePolylineRef.current = poly;

      // Fit map to route bounds
      const bounds = new google.maps.LatLngBounds();
      path.forEach(pt => bounds.extend(pt));
      googleMapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
    }
  }, [activeRoute, mapLoaded]);

  // Center on Selected Incident
  useEffect(() => {
    if (selectedIncident && googleMapRef.current && mapLoaded) {
      googleMapRef.current.panTo({
        lat: selectedIncident.latitude,
        lng: selectedIncident.longitude
      });
      googleMapRef.current.setZoom(16);
    }
  }, [selectedIncident, mapLoaded]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTraffic}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-lg ${
            isTrafficActive
              ? 'bg-emerald-600 text-white border-emerald-400'
              : 'bg-navy-900/90 text-slate-300 border-slate-700 hover:bg-navy-800'
          }`}
        >
          <TrafficCone className="w-3.5 h-3.5" />
          <span>{isTrafficActive ? 'Traffic Layer ON' : 'Live Google Traffic'}</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-navy-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 shadow-xl pointer-events-none">
        <div className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Google Maps Hazard Radar</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};
