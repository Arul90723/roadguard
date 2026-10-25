import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident, RoadSegment, RouteOption } from '../types';

// Fix Leaflet's default marker icons in Vite bundler
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const segmentsLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default center: Kochi, Kerala
    const map = L.map(mapContainerRef.current, {
      center: [9.9816, 76.2999],
      zoom: 13,
      zoomControl: true,
    });

    // Dark-themed OpenStreetMap tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    segmentsLayerRef.current = L.layerGroup().addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    // User Location Pulse Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-loc-icon',
        html: `
          <div class="relative flex items-center justify-center w-7 h-7">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-lg"></span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .bindTooltip('Your Current GPS Location', { direction: 'top' })
        .addTo(markersLayerRef.current);
    }

    // Incident Markers
    incidents.forEach(inc => {
      let colorClass = 'bg-amber-500 border-amber-300';
      if (inc.status === 'resolved') {
        colorClass = 'bg-emerald-500 border-emerald-300';
      } else if (inc.severity === 'critical') {
        colorClass = 'bg-red-500 border-red-300 animate-pulse';
      } else if (inc.severity === 'high') {
        colorClass = 'bg-orange-500 border-orange-300';
      } else if (inc.severity === 'low') {
        colorClass = 'bg-blue-500 border-blue-300';
      }

      const isSelected = selectedIncident?.id === inc.id;
      const markerHtml = `
        <div class="cursor-pointer group">
          <div class="w-8 h-8 rounded-full ${colorClass} border-2 flex items-center justify-center shadow-lg shadow-black/60 transition-transform ${
            isSelected ? 'scale-125 ring-4 ring-cyan-400' : 'hover:scale-110'
          }">
            <div class="w-2.5 h-2.5 rounded-full bg-navy-950"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-hazard-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

      const popupHtml = `
        <div class="text-navy-950 p-1 min-w-[200px]">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${inc.category.replace(/_/g, ' ')}</div>
          <div class="font-bold text-sm text-slate-900 mt-0.5">${inc.title}</div>
          <div class="text-xs text-slate-600 mt-1">${inc.locationName}</div>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">${inc.severity.toUpperCase()}</span>
            <span class="text-xs font-bold text-cyan-700">Priority: ${inc.priorityScore}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        onSelectIncident(inc);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [incidents, selectedIncident, userLocation]);

  // Update Road Risk Segments
  useEffect(() => {
    if (!segmentsLayerRef.current || !mapInstanceRef.current) return;
    segmentsLayerRef.current.clearLayers();

    roadSegments.forEach(seg => {
      let color = '#06b6d4'; // Low risk
      if (seg.riskScore > 75) color = '#ef4444'; // High risk
      else if (seg.riskScore > 50) color = '#f97316'; // Moderate risk

      const poly = L.polyline(
        [
          [seg.startLat, seg.startLng],
          [seg.endLat, seg.endLng]
        ],
        {
          color,
          weight: 6,
          opacity: 0.75,
          dashArray: seg.riskScore > 75 ? '6, 6' : undefined,
        }
      );

      poly.bindTooltip(
        `<b>${seg.name}</b><br/>Risk Score: <b>${seg.riskScore}/100</b> (${seg.activeHazardCount} active hazards)`,
        { sticky: true }
      );

      poly.addTo(segmentsLayerRef.current!);
    });
  }, [roadSegments]);

  // Update Route Polyline
  useEffect(() => {
    if (!routeLayerRef.current || !mapInstanceRef.current) return;
    routeLayerRef.current.clearLayers();

    if (activeRoute && activeRoute.coordinates.length > 0) {
      let routeColor = '#06b6d4'; // Safest
      if (activeRoute.routeQualityScore === 'D') routeColor = '#ef4444';
      else if (activeRoute.routeQualityScore === 'C') routeColor = '#f97316';
      else if (activeRoute.routeQualityScore === 'B') routeColor = '#eab308';

      const poly = L.polyline(activeRoute.coordinates, {
        color: routeColor,
        weight: 6,
        opacity: 0.9,
      }).addTo(routeLayerRef.current);

      // Fit map to route bounds
      const bounds = poly.getBounds();
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [activeRoute]);

  // Center on selected incident
  useEffect(() => {
    if (selectedIncident && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [selectedIncident.latitude, selectedIncident.longitude],
        16,
        { animate: true }
      );
    }
  }, [selectedIncident]);

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}>
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-navy-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 shadow-xl pointer-events-none">
        <div className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          Road Hazard Severity
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
