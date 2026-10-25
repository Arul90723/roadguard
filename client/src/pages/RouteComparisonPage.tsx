import React, { useState, useEffect } from 'react';
import { compareRoutes } from '../services/api';
import { Incident, RouteOption } from '../types';
import { MapView } from '../components/MapView';
import { SeverityBadge } from '../components/SeverityBadge';
import {
  Navigation,
  Shield,
  Clock,
  Fuel,
  Compass,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Info,
  Car,
  Bike,
  Zap,
  ArrowUpDown,
  TrendingDown,
  Sparkles,
  MapPin
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export const RouteComparisonPage: React.FC<Props> = ({ incidents, onSelectIncident }) => {
  // Preset prominent Kerala locations in Kochi
  const presetLocations = [
    { name: 'Edappally Toll Junction, Kochi', lat: 10.0248, lng: 76.3079 },
    { name: 'MG Road Shenoys, Ernakulam', lat: 9.9723, lng: 76.2825 },
    { name: 'Vyttila Mobility Hub, Kochi', lat: 9.9678, lng: 76.3188 },
    { name: 'Marine Drive Promenade, Kochi', lat: 9.9804, lng: 76.2755 },
    { name: 'Infopark Phase 1, Kakkanad', lat: 10.0102, lng: 76.3614 },
    { name: 'Palarivattom Bypass Junction', lat: 10.0035, lng: 76.3082 },
  ];

  const vehicleOptions = [
    { id: 'two_wheeler', label: 'Two-Wheeler', sub: 'Scooter / Bike', icon: Bike, riskNote: 'High pothole & spill vulnerability' },
    { id: 'hatchback', label: 'Hatchback / Sedan', sub: 'Low Clearance', icon: Car, riskNote: 'Rim & bumper impact risk' },
    { id: 'suv', label: 'SUV / Crossover', sub: 'High Ground Clearance', icon: Car, riskNote: 'Better pothole resilience' },
    { id: 'electric', label: 'Electric Vehicle', sub: 'Battery Chassis', icon: Zap, riskNote: 'Undercarriage protection focus' },
  ];

  const [originIndex, setOriginIndex] = useState<number>(0);
  const [destIndex, setDestIndex] = useState<number>(1);
  const [vehicleType, setVehicleType] = useState<string>('hatchback');

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoRouting, setIsDemoRouting] = useState<boolean>(false);
  const [disclaimer, setDisclaimer] = useState<string>('');

  const calculate = async () => {
    setIsLoading(true);
    try {
      const origin = presetLocations[originIndex];
      const destination = presetLocations[destIndex];

      const res = await compareRoutes(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        vehicleType
      );

      setRoutes(res.routes || []);
      setIsDemoRouting(res.isDemoService);
      setDisclaimer(res.disclaimer);
      if (res.routes && res.routes.length > 0) {
        setActiveRoute(res.routes[0]);
      }
    } catch (err: any) {
      console.error('Route calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [originIndex, destIndex, vehicleType]);

  const handleSwap = () => {
    const temp = originIndex;
    setOriginIndex(destIndex);
    setDestIndex(temp);
  };

  const getQualityBadge = (score: 'A' | 'B' | 'C' | 'D') => {
    const map = {
      A: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50',
      B: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-cyan-950/50',
      C: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-950/50',
      D: 'bg-red-950/80 text-red-300 border-red-500/50 shadow-red-950/50',
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs border shadow-sm ${map[score]}`}>
        Grade {score} Surface
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Corridor Safety Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                120m Hazard Buffer
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Navigation className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              <span>Hazard-Aware Navigation & Route Scoring</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Compare transit corridors by real-world surface quality. We prioritize vehicle suspension health and flood avoidance over saving 90 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Routing Engine</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">Google Maps GIS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Route & Vehicle Configurator */}
      <div className="glass-panel p-6 rounded-3xl space-y-5 border border-slate-800/80 shadow-2xl">
        {/* Origin & Destination with Swap */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Origin */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Starting Origin</span>
            </label>
            <select
              value={originIndex}
              onChange={e => setOriginIndex(parseInt(e.target.value))}
              className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              {presetLocations.map((loc, idx) => (
                <option key={loc.name} value={idx} disabled={idx === destIndex} className="bg-navy-900 text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl glass-button-secondary text-cyan-400 hover:text-white transition-transform active:rotate-180"
              title="Swap origin and destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Destination</span>
            </label>
            <select
              value={destIndex}
              onChange={e => setDestIndex(parseInt(e.target.value))}
              className="w-full bg-navy-950/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
            >
              {presetLocations.map((loc, idx) => (
                <option key={loc.name} value={idx} disabled={idx === originIndex} className="bg-navy-900 text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tactile Vehicle Cards */}
        <div className="space-y-2 pt-2 border-t border-slate-800/60">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Vehicle Dynamic Profile</span>
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {vehicleOptions.map(veh => {
              const isSelected = vehicleType === veh.id;
              const IconComp = veh.icon;
              return (
                <button
                  key={veh.id}
                  type="button"
                  onClick={() => setVehicleType(veh.id)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/80 to-navy-900 border-cyan-400 shadow-glow-cyan transform scale-[1.01]'
                      : 'bg-navy-950/60 border-slate-800/80 hover:bg-navy-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-white flex items-center gap-1.5">
                      <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{veh.label}</span>
                    </span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan" />}
                  </div>
                  <div className="text-[10px] text-slate-400">{veh.sub}</div>
                  <div className="text-[9px] text-cyan-400/80 font-mono mt-1">{veh.riskNote}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Alternative Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map with Route Polyline */}
        <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl glass-card">
          <MapView
            incidents={incidents}
            activeRoute={activeRoute}
            onSelectIncident={onSelectIncident}
            heightClass="h-[580px]"
          />
        </div>

        {/* Alternative Routes Panel */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="font-mono uppercase tracking-wider text-white">
              Alternative Options ({routes.length})
            </span>
            <span className="text-cyan-400 font-mono text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              HAZARD CORRIDOR
            </span>
          </div>

          {isLoading ? (
            <div className="glass-panel p-12 text-center text-slate-400 text-xs rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
              <p>Analyzing geospatial defect buffers across Kerala corridors...</p>
            </div>
          ) : (
            routes.map(r => {
              const isSelected = activeRoute?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setActiveRoute(r)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/70 to-navy-900 border-cyan-400 shadow-glow-cyan transform scale-[1.01]'
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-extrabold text-white">
                          {r.name}
                        </span>
                        {r.preference === 'safest' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                            ★ RECOMMENDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {r.recommendationExplanation}
                      </p>
                    </div>
                    {getQualityBadge(r.routeQualityScore)}
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-navy-950/70 border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px]">Distance</span>
                      <span className="font-bold text-white text-xs">{r.distanceKm} km</span>
                    </div>
                    <div className="p-2 rounded-xl bg-navy-950/70 border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px]">Duration</span>
                      <span className="font-bold text-white text-xs">{r.durationMinutes}m</span>
                    </div>
                    <div className="p-2 rounded-xl bg-navy-950/70 border border-slate-800/80">
                      <span className="text-slate-500 block text-[10px]">Est. Fuel</span>
                      <span className="font-bold text-cyan-400 text-xs">{r.estimatedFuelLiters} L</span>
                    </div>
                  </div>

                  {/* Hazards on this Route */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${r.nearbyVerifiedHazards === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span className="text-slate-300 font-medium">
                        {r.nearbyVerifiedHazards === 0
                          ? 'Zero Hazards in Corridor'
                          : `${r.nearbyVerifiedHazards} Hazard(s) in Buffer`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Risk Index: <strong className="text-white">{r.severityWeightedHazardScore}</strong>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default RouteComparisonPage;
