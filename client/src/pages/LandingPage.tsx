import React from 'react';
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
  RotateCcw
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
  const workflowSteps = [
    {
      step: '01',
      title: 'DETECT',
      icon: Cpu,
      desc: 'Smartphones collect acceleration spikes & rotation anomalies to flag potential road impacts without draining battery.',
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40',
    },
    {
      step: '02',
      title: 'REPORT',
      icon: Camera,
      desc: 'Citizens capture real-time camera proof and GPS coordinates with strictly live camera viewfinder validation.',
      color: 'text-teal-400 bg-teal-950/60 border-teal-500/40',
    },
    {
      step: '03',
      title: 'VERIFY',
      icon: FileCheck2,
      desc: 'Proximity matching consolidates duplicate reports while engineers and crowd corroboration verify severity.',
      color: 'text-blue-400 bg-blue-950/60 border-blue-500/40',
    },
    {
      step: '04',
      title: 'PRIORITISE',
      icon: TrendingUp,
      desc: 'Transparent formula computes priority scores based on severity (35%), confidence (25%), age (20%), and traffic (20%).',
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40',
    },
    {
      step: '05',
      title: 'ALERT',
      icon: Radio,
      desc: 'Commuters receive real-time proximity alerts and hazard-avoiding routing recommendations before navigating.',
      color: 'text-purple-400 bg-purple-950/60 border-purple-500/40',
    },
    {
      step: '06',
      title: 'REPAIR',
      icon: Wrench,
      desc: 'Maintenance work orders are assigned directly to PWD, KSEB, or municipal authorities with target deadlines.',
      color: 'text-orange-400 bg-orange-950/60 border-orange-500/40',
    },
    {
      step: '07',
      title: 'RE-VERIFY',
      icon: RotateCcw,
      desc: 'Roads are marked resolved with photo proof, and can be reopened if commuter sensors detect recurrent defects.',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-950">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Next-Generation Community Infrastructure Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono leading-tight">
          Safer Roads. <span className="text-cyan-400">Smarter Routes.</span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
            Faster Repairs.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering citizens and municipal authorities with live hazard detection, camera-verified road reports, smart hazard-avoiding routing, and automated repair dispatch.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('map')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-navy-950 font-bold text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MapPin className="w-5 h-5" />
            <span>Explore Road Map</span>
          </button>

          <button
            onClick={() => onNavigate('report')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-base border border-slate-700 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <Camera className="w-5 h-5 text-cyan-400" />
            <span>Report a Hazard</span>
          </button>
        </div>

        {/* Sample Region Disclaimer */}
        <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Live Demonstration Sample Region: <strong>Kochi & Ernakulam Metropolitan Area, Kerala</strong></span>
        </div>
      </section>

      {/* Live Statistics Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Reported Hazards</span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {stats?.totalHazards ?? 10}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Corroborated across {stats?.sampleArea || 'Kochi region'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Verified Incidents</span>
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {stats?.verifiedIncidents ?? 5}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Inspected & confirmed by authorities
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">Repaired Roads</span>
              <Wrench className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {stats?.repairedRoads ?? 1}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Closed with certified repair proof
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs uppercase font-bold tracking-wider">High-Risk Zones</span>
              <Activity className="w-5 h-5 text-rose-500" />
            </div>
            <div className="mt-2 text-3xl font-black text-white font-mono">
              {stats?.highRiskZonesCount ?? 3}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Active alert & heat corridor zones
            </p>
          </div>
        </div>
      </section>

      {/* Demonstration Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-bold text-xs border border-cyan-500/40">
                  DEMONSTRATION MAP
                </span>
                <h2 className="text-xl font-bold text-white">Live Kerala Infrastructure Radar</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Clearly labelled demonstration data showcasing Potholes, Waterlogging, Snapped Electrical Lines, and Road Works in Kochi.
              </p>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Full Screen Interactive Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <MapView
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            heightClass="h-[420px]"
          />
        </div>
      </section>

      {/* The 7-Stage Core Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            How RoadGuard Operates
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            A continuous closed-loop cycle turning commuter telemetry into municipal repairs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className={`p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-lg relative flex flex-col justify-between ${
                  idx === workflowSteps.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      PHASE {item.step}
                    </span>
                    <div className={`p-2 rounded-xl border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
