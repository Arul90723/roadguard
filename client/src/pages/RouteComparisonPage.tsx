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
  Car
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

  const [originIndex, setOriginIndex] = useState<number>(0); // Edappally Toll
  const [destIndex, setDestIndex] = useState<number>(1);   // MG Road Shenoys
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

  const getQualityBadge = (score: 'A' | 'B' | 'C' | 'D') => {
    const map = {
      A: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      B: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
      C: 'bg-amber-950 text-amber-300 border-amber-500/40',
      D: 'bg-red-950 text-red-300 border-red-500/40',
    };
    return (
      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${map[score]}`}>
        Grade {score} Pavement
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
          <Navigation className="w-6 h-6 text-cyan-400" />
          <span>Road Condition & Hazard-Aware Route Comparison</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic route scoring prioritizing verified defect avoidance and vehicle structural safety.
        </p>
      </div>

      {/* Honest Scientific Disclaimer Alert */}
      <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Analytical Safety Assessment Notice:</span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {disclaimer || 'Route scoring evaluates reported potholes, flooded segments, and downed wires within a 120m transit corridor. It does not guarantee zero risk. Live driving conditions require continuous driver caution.'}
          </p>
        </div>
      </div>

      {/* Origin, Destination & Vehicle Selector */}
      <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Origin */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Starting Location (Origin)
            </label>
            <select
              value={originIndex}
              onChange={e => setOriginIndex(parseInt(e.target.value))}
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {presetLocations.map((loc, idx) => (
                <option key={loc.name} value={idx} disabled={idx === destIndex}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Destination Location
            </label>
            <select
              value={destIndex}
              onChange={e => setDestIndex(parseInt(e.target.value))}
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {presetLocations.map((loc, idx) => (
                <option key={loc.name} value={idx} disabled={idx === originIndex}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Type (Fuel Consumption Inputs) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              <span>Vehicle Profile (Fuel Model)</span>
            </label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="hatchback">Petrol Hatchback (~15 km/L avg)</option>
              <option value="suv">SUV / Crossover (~10 km/L avg)</option>
              <option value="two_wheeler">Two-Wheeler / Scooter (~45 km/L)</option>
              <option value="electric">Electric Vehicle (~0.15 kWh/km)</option>
            </select>
          </div>
        </div>

        {isDemoRouting && (
          <div className="text-[11px] text-cyan-400 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>OSRM Public Routing connected. Local geometric routing corridor active for Kerala demonstration area.</span>
          </div>
        )}
      </div>

      {/* Main Grid: Map + Route Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map with Route Polyline */}
        <div className="lg:col-span-2">
          <MapView
            incidents={incidents}
            activeRoute={activeRoute}
            onSelectIncident={onSelectIncident}
            heightClass="h-[520px]"
          />
        </div>

        {/* Route Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span>RECOMMENDED ALTERNATIVES ({routes.length})</span>
            <span className="text-cyan-400 font-mono text-[11px]">HAZARD-WEIGHTED</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Calculating hazard corridor ratings...
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
                      ? 'bg-navy-900 border-cyan-400 shadow-xl shadow-cyan-950 ring-1 ring-cyan-400/50'
                      : 'bg-navy-900/60 border-slate-800 hover:bg-navy-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs uppercase font-extrabold text-white">
                          {r.name}
                        </span>
                        {r.preference === 'safest' && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-500/40">
                            SAFEST
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {r.recommendationExplanation}
                      </p>
                    </div>
                    {getQualityBadge(r.routeQualityScore)}
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Distance</span>
                      <span className="font-bold text-slate-200">{r.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Duration</span>
                      <span className="font-bold text-slate-200">{r.durationMinutes} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Est. Fuel</span>
                      <span className="font-bold text-cyan-400">{r.estimatedFuelLiters} L</span>
                    </div>
                  </div>

                  {/* Hazards on this Route */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${r.nearbyVerifiedHazards === 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                      <span className="text-slate-300">
                        {r.nearbyVerifiedHazards === 0
                          ? 'Zero Hazards in Corridor'
                          : `${r.nearbyVerifiedHazards} Hazard(s) Nearby`}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Risk Index: <strong>{r.severityWeightedHazardScore}</strong>
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
