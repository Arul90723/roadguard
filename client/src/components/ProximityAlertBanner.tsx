import React, { useState } from 'react';
import { Incident } from '../types';
import { AlertTriangle, Zap, PhoneCall, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

interface Props {
  criticalIncidents: Incident[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectIncident?: (incident: Incident) => void;
}

export const ProximityAlertBanner: React.FC<Props> = ({
  criticalIncidents,
  onSelectIncident
}) => {
  const [minimized, setMinimized] = useState(false);

  if (criticalIncidents.length === 0) return null;

  const topCritical = criticalIncidents[0];
  const isElectrical = topCritical.category === 'fallen_electrical_wire';

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 mb-3 transition-all animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-950/70 to-obsidian-900 border border-red-500/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(239,68,68,0.25)]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left Alert Info */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 shrink-0 mt-0.5 shadow-glow-rose">
              {isElectrical ? (
                <Zap className="w-5 h-5 text-red-400 animate-bounce" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 border border-red-500/50 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                  LIVE CRITICAL EMERGENCY
                </span>
                <span className="text-xs font-semibold text-red-200">
                  {topCritical.locationName}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-0.5">
                {topCritical.title}
              </h4>

              {!minimized && isElectrical && (
                <p className="text-xs text-red-300/90 mt-1 font-medium leading-relaxed">
                  ⚠️ Stay at least 10 meters clear of live fallen wires. Do not step in wet road puddles.
                </p>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-red-500/20">
            {isElectrical && (
              <a
                href="tel:1912"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-glow-rose transition-all transform active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call KSEB 1912</span>
              </a>
            )}

            {onSelectIncident && (
              <button
                type="button"
                onClick={() => onSelectIncident(topCritical)}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition-colors"
              >
                Details
              </button>
            )}

            <button
              type="button"
              onClick={() => setMinimized(!minimized)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              title={minimized ? 'Expand warning' : 'Collapse warning'}
            >
              {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
