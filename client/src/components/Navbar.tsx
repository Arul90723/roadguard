import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  MapPin,
  Camera,
  Activity,
  Navigation,
  FileText,
  Menu,
  X,
  Compass,
  User,
  LogIn,
  LogOut
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser, firebaseUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'map', label: 'Road Map', icon: MapPin },
    { id: 'report', label: 'Report Hazard', icon: Camera, highlight: true },
    { id: 'sensor', label: 'Sensor Lab', icon: Activity },
    { id: 'routes', label: 'Safe Routes', icon: Navigation },
    {
      id: 'authority',
      label: 'Authority Portal',
      icon: Shield,
      roleBadge: currentUser?.role !== 'citizen' ? 'Officer' : undefined,
    },
    { id: 'docs', label: 'Docs & Cloud', icon: FileText },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-navy-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-navy-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-mono">
                  ROAD<span className="text-cyan-400">GUARD</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                  Kerala Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block tracking-wide">
                Safer Roads. Smarter Routes. Faster Repairs.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-navy-950 font-bold text-sm shadow-md shadow-cyan-500/25 transition-all transform active:scale-95"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-navy-800 text-cyan-400 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.roleBadge && (
                    <span className="text-[10px] bg-indigo-900/80 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/40">
                      {item.roleBadge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Prominent Authentication Button */}
            <div className="pl-2 border-l border-slate-800 ml-1">
              {firebaseUser ? (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-700 text-xs font-semibold text-cyan-300"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500 text-navy-950 flex items-center justify-center font-bold text-[10px]">
                    {firebaseUser.displayName?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[90px] truncate">{firebaseUser.displayName || 'Account'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenAuth}
              className="p-1.5 px-2.5 rounded-lg bg-navy-800 border border-slate-700 text-cyan-400 text-xs font-semibold flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{firebaseUser ? 'Account' : 'Login'}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-navy-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-navy-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.roleBadge && (
                  <span className="text-[10px] bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/40">
                    {item.roleBadge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
