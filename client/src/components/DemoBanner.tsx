import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { AlertCircle, Shield, MapPin, LogIn, LogOut } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { currentUser, switchUserRole, isDemoAuth, firebaseUser, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="bg-gradient-to-r from-navy-900 via-slate-900 to-navy-900 border-b border-cyan-500/30 px-3 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            {firebaseUser ? 'FIREBASE AUTH CONNECTED' : 'HACKATHON DEMO MODE'}
          </span>
          <span className="hidden sm:inline text-slate-400">
            {firebaseUser
              ? `Logged in via Google: ${firebaseUser.email}`
              : 'Simulated demonstration environment. All road hazard records are seeded for testing.'}
          </span>
          <span className="inline-flex items-center gap-1 text-slate-400 border-l border-slate-700 pl-2">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Kochi, Kerala (Sample Region)</span>
          </span>
        </div>

        {/* Role Switcher & Firebase Auth button */}
        <div className="flex items-center gap-2 ml-auto">
          {firebaseUser ? (
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-red-950/80 text-red-300 border border-red-500/40 hover:bg-red-900 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-white text-navy-950 hover:bg-slate-200 transition-all shadow-sm"
              title="Sign in with your real Google Account"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Sign-In</span>
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            <span className="text-slate-400 font-medium mr-1 hidden md:inline">Roles:</span>
            {(['citizen', 'authority', 'admin'] as UserRole[]).map(role => {
              const isActive = currentUser?.role === role;
              return (
                <button
                  key={role}
                  onClick={() => switchUserRole(role)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all ${
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
          </div>

          <div className="hidden lg:flex items-center gap-1 pl-1 text-cyan-300">
            <Shield className="w-3 h-3" />
            <span className="truncate max-w-[130px] text-[11px]" title={currentUser?.displayName}>
              {currentUser?.displayName}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
