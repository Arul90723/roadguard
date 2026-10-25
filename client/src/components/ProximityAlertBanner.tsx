import React from 'react';
import { Incident } from '../types';
import { AlertTriangle, Zap, ShieldAlert, PhoneCall } from 'lucide-react';

interface Props {
  criticalIncidents: Incident[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectIncident?: (incident: Incident) => void;
}

export const ProximityAlertBanner: React.FC<Props> = ({
  criticalIncidents,
  onSelectIncident
}) => {
  if (criticalIncidents.length === 0) return null;

  const topCritical = criticalIncidents[0];
  const isElectrical = topCritical.category === 'fallen_electrical_wire';

  return (
    <aside aria-label="Hazard Warnings" className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-navy-950 border-b-2 border-red-500/80 px-4 py-2.5 shadow-lg shadow-red-950/50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-600/30 border border-red-500/60 text-red-400 shrink-0 mt-0.5">
            {isElectrical ? <Zap className="w-5 h-5 animate-bounce" /> : <AlertTriangle className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-extrabold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-500/50">
                CRITICAL SAFETY WARNING
              </span>
              <span className="text-xs text-red-300 font-semibold">
                Near {topCritical.locationName}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 mt-0.5">
              {topCritical.title}
            </p>
            {isElectrical && (
              <p className="text-xs text-red-200 mt-0.5 font-semibold flex items-center gap-1">
                <span>⚠️ STRICT ADVISORY: Maintain at least 10 meters distance. Do not touch or cross fallen lines. Call KSEB Emergency: <strong>1912</strong> or <strong>112</strong> immediately.</span>
              </p>
            )}
            <p className="text-[11px] text-slate-400 mt-0.5">
              Never operate your device while actively driving. Pull over safely before inspecting routes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {topCritical.category === 'fallen_electrical_wire' && (
            <a
              href="tel:1912"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call KSEB (1912)
            </a>
          )}
          {onSelectIncident && (
            <button
              onClick={() => onSelectIncident(topCritical)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition-colors"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
