import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { AlertCircle, UserCheck, Shield, MapPin } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, switchUserRole, isDemoAuth } = useAuth();

  if (!isDemoAuth) return null;

  return (
    <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border-b border-cyan-500/30 px-3 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            HACKATHON DEMO MODE
          </span>
          <span className="hidden sm:inline text-slate-400">
            Simulated demonstration environment. All road hazard records are seeded for testing.
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 border-l border-slate-700 pl-2">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Kochi, Kerala (Sample Region)</span>
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-slate-400 font-medium mr-1 hidden md:inline">Switch Role:</span>
          {(['citizen', 'authority', 'admin'] as UserRole[]).map(role => {
            const isActive = currentUser?.role === role;
            return (
              <button
                key={role}
                onClick={() => switchUserRole(role)}
                className={`px-2.5 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300'
                    : 'bg-navy-800 text-slate-300 hover:bg-navy-700 border border-slate-700'
                }`}
              >
                {role === 'citizen' && 'Citizen'}
                {role === 'authority' && 'Authority'}
                {role === 'admin' && 'Admin'}
              </button>
            );
          })}
          <div className="hidden lg:flex items-center gap-1 pl-2 text-cyan-300 border-l border-slate-700">
            <Shield className="w-3.5 h-3.5" />
            <span className="truncate max-w-[170px]" title={currentUser?.displayName}>
              {currentUser?.displayName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
