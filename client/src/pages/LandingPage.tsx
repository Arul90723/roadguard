import React, { useState } from 'react';
import { DashboardStats, Incident } from '../types';
import { MapView } from '../components/MapView';
import {
  Shield,
  MapPin,
  Camera,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  FileCheck2,
  Wrench,
  RotateCcw,
  Sparkles,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Navigation
} from 'lucide-react';

interface Props {
  stats: DashboardStats | null;
  incidents: Incident[];
  onNavigate: (tab: string) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const LandingPage: React.FC<Props> = ({
  stats,
  incidents,
  onNavigate,
  onSelectIncident
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const workflowSteps = [
    {
      step: '01',
      title: 'DETECT',
      subtitle: 'In-Vehicle Smartphone Telemetry',
      icon: Cpu,
      summary: 'Automated shockwave & vibration detection without battery drain.',
      desc: 'Smartphones collect acceleration vectors (X, Y, Z) and rotational yaw to identify candidate pavement impacts while commuting. Events are recorded as unverified candidates until corroborated.',
      highlight: 'Honest Telemetry: Only classifies as potential road impacts until verified.',
      accent: 'from-cyan-500 to-blue-500 text-cyan-400 border-cyan-500/40 bg-cyan-950/30'
    },
    {
      step: '02',
      title: 'REPORT',
      subtitle: 'Camera-Only Hardware Evidence',
      icon: Camera,
      summary: 'Strict live viewfinder capture with locked GPS coordinates.',
      desc: 'Citizens snap live photographic evidence through the hardware camera. Gallery uploads are disabled to eliminate fabricated reports, and GPS coordinates are attached with meter-level accuracy.',
      highlight: 'Integrity First: Gallery uploads permanently blocked for civic honesty.',
      accent: 'from-teal-500 to-emerald-500 text-teal-400 border-teal-500/40 bg-teal-950/30'
    },
    {
      step: '03',
      title: 'VERIFY',
      subtitle: 'Spatial Deduplication & Corroboration',
      icon: FileCheck2,
      summary: 'Automated 60-meter radius merging with crowd corroboration.',
      desc: 'Multiple reports of the same pothole or obstruction within a 60-meter radius are automatically merged into a single consolidated incident, increasing confidence scores and evidence weight.',
      highlight: 'Smart Consolidation: Preserves individual citizen reports under 1 master record.',
      accent: 'from-blue-500 to-indigo-500 text-blue-400 border-blue-500/40 bg-blue-950/30'
    },
    {
      step: '04',
      title: 'PRIORITISE',
      subtitle: 'Transparent Municipal Formula',
      icon: TrendingUp,
      summary: 'Math-driven urgency scoring out of 100.',
      desc: 'Priority is calculated deterministically: Severity Weight (35%) + Confidence & Evidence (25%) + Pavement Age (20%) + Traffic Exposure (20%). High-voltage lines and cave-ins jump to the top immediately.',
      highlight: 'Zero Bias: Transparent 100-point algorithm visible to citizens & officials.',
      accent: 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/40 bg-amber-950/30'
    },
    {
      step: '05',
      title: 'ALERT',
      subtitle: 'Hazard-Aware Routing & Warnings',
      icon: Radio,
      summary: 'Dynamic detour recommendations and proximity alerts.',
      desc: 'Commuters receive real-time proximity alerts before approaching critical hazards. Our routing engine calculates 5 alternatives (Safest, Fastest, Shortest, Eco, Balanced) to detour around severe damage.',
      highlight: 'Driver Safety: Prominent electrical clearance warnings with 1-click 1912 dispatch.',
      accent: 'from-purple-500 to-pink-500 text-purple-400 border-purple-500/40 bg-purple-950/30'
    },
    {
      step: '06',
      title: 'REPAIR',
      subtitle: 'Direct Maintenance Dispatch',
      icon: Wrench,
      summary: 'Automated work orders to PWD, KSEB, & Water Authority.',
      desc: 'Municipal engineers assign field crews directly from the Operations Command Center, setting target repair deadlines, cold-mix bitumen patching orders, and utility dispatches.',
      highlight: 'Civic Accountability: Tracks target inspection and completion dates.',
      accent: 'from-orange-500 to-red-500 text-orange-400 border-orange-500/40 bg-orange-950/30'
    },
    {
      step: '07',
      title: 'RE-VERIFY',
      subtitle: 'Post-Repair Audit & Reopening',
      icon: RotateCcw,
      summary: 'Certified repair proof with defect reopening capability.',
      desc: 'Repaired sections are closed with photo evidence. If subsequent commuters detect renewed vibration or report recurring defects, the incident can be reopened for mandatory quality audit.',
      highlight: 'Closed Loop: Ensures contractor repairs actually hold up over time.',
      accent: 'from-emerald-500 to-cyan-500 text-emerald-400 border-emerald-500/40 bg-emerald-950/30'
    },
  ];

  const quickRegions = [
    { name: 'MG Road Shenoys', desc: 'Critical electrical cable hazard', lat: 9.9723, lng: 76.2825 },
    { name: 'Edappally Toll', desc: 'High-risk pothole cluster', lat: 10.0248, lng: 76.3079 },
    { name: 'Vyttila Mobility Hub', desc: 'Transit flooding & drainage choke', lat: 9.9678, lng: 76.3188 },
    { name: 'Marine Drive', desc: 'Embankment road collapse', lat: 9.9804, lng: 76.2755 },
    { name: 'Kakkanad Infopark', desc: 'Open sewer manhole pit', lat: 10.0102, lng: 76.3614 },
  ];

  const currentStep = workflowSteps[activeStepIndex];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Cinematic Hero Section */}
      <section className="relative pt-6 sm:pt-14 pb-8 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-blue-500/10 to-teal-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-6 shadow-glow-cyan animate-in fade-in zoom-in-95 duration-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono uppercase tracking-wider text-[11px]">Civic Mesh Active</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Kochi & Greater Ernakulam Metropolitan Grid</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-sans">
            Safer Roads. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
              Smarter Routes.
            </span>{' '}
            <br className="hidden sm:block" />
            Faster Repairs.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            A community-powered road safety intelligence platform. Detect pavement anomalies with smartphone telemetry, submit verified live camera reports, compare hazard-free routes, and empower municipal authorities to dispatch repairs.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('map')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl glass-button-primary text-sm shadow-glow-cyan font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <MapPin className="w-4 h-4 stroke-[2.5]" />
              <span>Explore Live Hazard Map</span>
            </button>

            <button
              onClick={() => onNavigate('report')}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glass-button-secondary text-sm font-semibold transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Report a Hazard</span>
            </button>
          </div>

          {/* Live Incident Broadcast Ticker */}
          <div className="mt-10 p-2.5 rounded-2xl glass-panel max-w-2xl mx-auto flex items-center gap-3 text-xs overflow-hidden border border-white/5 shadow-glass">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 font-mono font-bold text-[10px] uppercase shrink-0 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              Live Grid Feed
            </span>
            <div className="flex-1 truncate text-left text-slate-300">
              <span className="text-cyan-300 font-semibold">[INC-KL-001]</span> High-voltage snapped line on MG Road Shenoys • Emergency KSEB dispatch active
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-cyan-400 hover:text-cyan-300 font-bold text-[11px] shrink-0 flex items-center gap-1"
            >
              <span>View</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Intelligence Bento Grid (Stats & Highlights) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Reported Hazards */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Reported Hazards</span>
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-sans tracking-tight">
                {stats?.totalHazards ?? 10}
              </span>
              <span className="text-xs text-amber-400 font-semibold flex items-center">
                ↑ Active
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Consolidated across Kochi corridors from independent commuter submissions.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Critical Severity:</span>
              <span className="font-bold text-red-400">{stats?.criticalHazards ?? 2} Emergency</span>
            </div>
          </div>

          {/* Card 2: Verified Incidents */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Verified by Officials</span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-sans tracking-tight">
                {stats?.verifiedIncidents ?? 6}
              </span>
              <span className="text-xs text-cyan-400 font-semibold font-mono">
                60% Ratio
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Inspected, cross-referenced with field telemetry, and queued for repair.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Avg Verification:</span>
              <span className="font-bold text-cyan-300">4.2 Hours</span>
            </div>
          </div>

          {/* Card 3: Repaired Roads */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Certified Repaired</span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-sans tracking-tight">
                {stats?.repairedRoads ?? 1}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                ✓ Photo Audited
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Closed with certified contractor photo proof and reopened if defects recur.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Latest Patch:</span>
              <span className="font-bold text-emerald-300 truncate max-w-[120px]">Seaport-Airport Rd</span>
            </div>
          </div>

          {/* Card 4: High-Risk Zones */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">High-Risk Corridors</span>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-sans tracking-tight">
                {stats?.highRiskZonesCount ?? 3}
              </span>
              <span className="text-xs text-rose-400 font-semibold font-mono">
                PWD Monitored
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Arterial segments flagged with repeated commuter vibration and road defects.
            </p>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Highest Risk:</span>
              <span className="font-bold text-rose-300">Vyttila Hub Ring (86/100)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Live Demonstration Map Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-4 sm:p-7 border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold text-xs border border-cyan-500/30 font-mono">
                  LIVE GOOGLE MAPS RADAR
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Kochi Infrastructure Intelligence Radar
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time categorized hazard clusters with live traffic layers, satellite imagery, and transparent municipal priority ranking.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('map')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button-primary text-xs font-bold shadow-glow-cyan"
              >
                <span>Full Map Experience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Region Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 text-[11px] shrink-0 font-medium">Quick Pan:</span>
            {quickRegions.map(reg => (
              <button
                key={reg.name}
                onClick={() => onNavigate('map')}
                className="px-3 py-1 rounded-xl bg-obsidian-900/80 hover:bg-slate-800 border border-white/5 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-300 shrink-0 transition-all text-xs"
              >
                {reg.name}
              </button>
            ))}
          </div>

          {/* Embedded Google Map Component */}
          <MapView
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            heightClass="h-[460px]"
          />
        </div>
      </section>

      {/* 4. Interactive 7-Step Closed-Loop Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30">
            End-To-End Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-3">
            The 7-Stage Closed-Loop Engine
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            From raw accelerometer shockwaves on a commuter phone to certified asphalt repair. Click each stage to explore how RoadGuard operates.
          </p>
        </div>

        {/* Stepper Navigation Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {workflowSteps.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            const Icon = step.icon;
            return (
              <button
                key={step.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`flex-1 min-w-[130px] p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-glow-cyan'
                    : 'glass-card border-white/5 hover:border-white/10 opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400">STAGE {step.step}</span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <div className={`text-xs font-bold tracking-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {step.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Stage Detailed Interactive Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  STAGE {currentStep.step} OF 07
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {currentStep.subtitle}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentStep.title}: {currentStep.summary}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed">
                {currentStep.desc}
              </p>

              <div className="p-3.5 rounded-xl bg-obsidian-900/90 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{currentStep.highlight}</span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    if (activeStepIndex === 0) onNavigate('sensor');
                    else if (activeStepIndex === 1) onNavigate('report');
                    else if (activeStepIndex === 4) onNavigate('routes');
                    else onNavigate('authority');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-primary text-xs font-bold shadow-glow-cyan"
                >
                  <span>Experience this Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs text-slate-400">
                  Step {activeStepIndex + 1} of 7
                </span>
              </div>
            </div>

            {/* Right Mini Visual Simulation */}
            <div className="p-5 rounded-2xl bg-obsidian-900/95 border border-white/10 space-y-3 font-mono text-xs shadow-inner">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-white/5 pb-2">
                <span>SIMULATED PIPELINE TELEMETRY</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ONLINE
                </span>
              </div>

              {activeStepIndex === 0 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accelerometer Norm:</span>
                    <span className="text-cyan-400 font-bold">21.4 m/s² (Spike)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vertical Axis Z:</span>
                    <span className="text-white">18.6 m/s²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className="text-amber-400 font-bold">Potential Road Impact</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 1 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Viewfinder Stream:</span>
                    <span className="text-emerald-400 font-bold">Hardware Camera Locked</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Timestamp:</span>
                    <span className="text-white">9.9723°N, 76.2825°E</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="text-cyan-400 font-bold">±3.8 meters</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 2 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deduplication:</span>
                    <span className="text-cyan-400 font-bold">ST_DWithin(60m) Match</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master Record:</span>
                    <span className="text-white">INC-KL-002</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Corroborators:</span>
                    <span className="text-emerald-400 font-bold">4 Independent Citizens</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 3 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Severity Weight:</span>
                    <span className="text-red-400 font-bold">35/35 (Critical Wire)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Confidence Score:</span>
                    <span className="text-cyan-400 font-bold">23.5/25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Composite Score:</span>
                    <span className="text-amber-400 font-bold">96.5 / 100</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 4 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Route Avoidance:</span>
                    <span className="text-emerald-400 font-bold">Detour via Outer Ring</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk Reduction:</span>
                    <span className="text-cyan-400 font-bold">-78% Exposure</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safety Index:</span>
                    <span className="text-emerald-400 font-bold">Grade A Pavement</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 5 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dispatched Squad:</span>
                    <span className="text-white">Kerala PWD Roads Div</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Work Order:</span>
                    <span className="text-cyan-400 font-bold">#PWD-KL-2026-44</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Date:</span>
                    <span className="text-amber-400 font-bold">2026-10-27</span>
                  </div>
                </div>
              )}

              {activeStepIndex === 6 && (
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Repair Status:</span>
                    <span className="text-emerald-400 font-bold">Resolved & Safe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reopen Protection:</span>
                    <span className="text-cyan-400 font-bold">Citizen Audited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contractor Proof:</span>
                    <span className="text-white">Bitumen Photo Attached</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
