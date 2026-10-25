import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
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
  ChevronDown,
  User,
  CheckCircle2,
  Sparkles,
  LogIn,
  LogOut,
  Radio
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { currentUser, switchUserRole, firebaseUser, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'report', label: 'Report', icon: Camera, highlight: true },
    { id: 'sensor', label: 'Sensor HUD', icon: Activity },
    { id: 'routes', label: 'Safe Routes', icon: Navigation },
    {
      id: 'authority',
      label: 'Ops Command',
      icon: Shield,
      roleBadge: currentUser?.role !== 'citizen' ? 'Officer' : undefined,
    },
    { id: 'docs', label: 'Docs', icon: FileText },
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string; desc: string }> = {
    citizen: {
      label: 'Citizen Commuter',
      badge: 'Civic Mesh',
      color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      desc: 'Real-time hazard reports & navigation'
    },
    authority: {
      label: 'PWD Authority',
      badge: 'Officer Portal',
      color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      desc: 'Field verification & repair dispatch'
    },
    admin: {
      label: 'State Administrator',
      badge: 'Gov Command',
      color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      desc: 'Statewide safety KPIs & quality audit'
    }
  };

  const activeRoleConfig = roleLabels[currentUser?.role || 'citizen'];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="glass-panel rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between border border-white/10 shadow-glass">
          {/* Brand Logo */}
          <div
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-600 flex items-center justify-center shadow-glow-cyan group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-obsidian-950 stroke-[2.5]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 border-2 border-obsidian-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  ROAD<span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">GUARD</span>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Kochi Grid Active
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-medium hidden sm:block">
                Smart Road Safety & Infrastructure Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Pill style) */}
          <nav className="hidden lg:flex items-center bg-obsidian-900/80 p-1 rounded-xl border border-white/5 space-x-0.5 shadow-inner">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              if (item.highlight) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs text-obsidian-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:brightness-110 shadow-glow-cyan transition-all transform active:scale-95"
                  >
                    <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-400 shadow-sm border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.roleBadge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.roleBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Role Switcher Capsule + Auth */}
          <div className="flex items-center gap-2">
            {/* Persona Switcher Capsule */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${activeRoleConfig.color} hover:brightness-125 shadow-sm`}
                title="Switch User Persona (Citizen, Authority, Admin)"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] opacity-75 font-mono uppercase tracking-wider">{activeRoleConfig.badge}</div>
                  <div className="text-xs font-bold leading-tight">{currentUser?.displayName?.split(' ')[0] || 'User'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {/* Persona Switcher Dropdown */}
              {roleDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setRoleDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-2 shadow-2xl border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Switch Platform Persona
                      </span>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Test citizen reporting, engineer verification, or admin oversight.
                      </p>
                    </div>

                    <div className="space-y-1">
                      {(['citizen', 'authority', 'admin'] as UserRole[]).map(r => {
                        const isCurrent = currentUser?.role === r;
                        const conf = roleLabels[r];
                        return (
                          <button
                            key={r}
                            onClick={() => {
                              switchUserRole(r);
                              setRoleDropdownOpen(false);
                            }}
                            className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                              isCurrent
                                ? 'bg-cyan-500/15 border border-cyan-500/40 text-white'
                                : 'hover:bg-slate-800/60 text-slate-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              {r === 'citizen' && <User className="w-4 h-4 text-cyan-400" />}
                              {r === 'authority' && <Shield className="w-4 h-4 text-indigo-400" />}
                              {r === 'admin' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{conf.label}</span>
                                {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{conf.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Authentication Button */}
            {firebaseUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition-all shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-400 text-obsidian-950 flex items-center justify-center font-bold text-[10px]">
                  {firebaseUser.displayName?.charAt(0) || 'U'}
                </div>
                <span className="hidden md:inline max-w-[80px] truncate">{firebaseUser.displayName || 'Account'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-glow-cyan"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 glass-panel rounded-2xl p-3 border border-white/10 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.roleBadge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {item.roleBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
