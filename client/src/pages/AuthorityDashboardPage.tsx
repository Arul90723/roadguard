import React, { useState } from 'react';
import { Incident, IncidentStatus, RoadSegment, DashboardStats, IncidentCategory, IncidentSeverity } from '../types';
import { useAuth } from '../context/AuthContext';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';
import {
  Shield,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Building2,
  Users,
  Activity,
  ChevronRight,
  TrendingUp,
  Info,
  MapPin,
  Kanban,
  List,
  Flame,
  ArrowRight
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  roadSegments: RoadSegment[];
  stats: DashboardStats | null;
  onSelectIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, status: IncidentStatus, notes?: string, assignedTeam?: string, targetRepairDate?: string) => Promise<void>;
  onReopenIncident: (id: string, notes: string) => Promise<void>;
}

export const AuthorityDashboardPage: React.FC<Props> = ({
  incidents,
  roadSegments,
  stats,
  onSelectIncident,
  onUpdateStatus,
  onReopenIncident
}) => {
  const { currentUser } = useAuth();

  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('All Jurisdictions');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  // Filter incidents for this authority
  const filtered = incidents.filter(inc => {
    if (currentUser?.role === 'authority' && currentUser.jurisdiction) {
      if (inc.jurisdiction !== currentUser.jurisdiction) return false;
    } else if (selectedJurisdiction !== 'All Jurisdictions') {
      if (inc.jurisdiction !== selectedJurisdiction) return false;
    }

    if (selectedStatus !== 'all' && inc.status !== selectedStatus) return false;
    if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) return false;
    return true;
  });

  const criticalQueue = filtered.filter(i => i.severity === 'critical' && i.status !== 'resolved');
  const pendingQueue = filtered.filter(i => ['candidate', 'pending_verification'].includes(i.status));
  const activeRepairQueue = filtered.filter(i => ['assigned', 'repair_in_progress'].includes(i.status));
  const resolvedQueue = filtered.filter(i => i.status === 'resolved');

  // Kanban columns definition
  const kanbanColumns: { id: IncidentStatus | 'pending'; title: string; badgeColor: string; items: Incident[] }[] = [
    {
      id: 'pending',
      title: 'Triage & Verification',
      badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
      items: filtered.filter(i => ['candidate', 'pending_verification'].includes(i.status)),
    },
    {
      id: 'assigned',
      title: 'Assigned to Crew',
      badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
      items: filtered.filter(i => i.status === 'assigned'),
    },
    {
      id: 'repair_in_progress',
      title: 'Field Repair in Progress',
      badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/40',
      items: filtered.filter(i => i.status === 'repair_in_progress'),
    },
    {
      id: 'resolved',
      title: 'Certified Safe & Closed',
      badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
      items: filtered.filter(i => i.status === 'resolved'),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-glow-indigo shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Municipal Ops Portal
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Session
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Authority Operations Command
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Officer: <strong className="text-slate-200">{currentUser?.displayName}</strong> • {currentUser?.department || 'Kerala PWD Infrastructure Wing'}
              </p>
            </div>
          </div>

          {/* Controls: Jurisdiction + View Mode */}
          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-navy-950 border border-slate-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban Board</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Queue List</span>
              </button>
            </div>

            {/* Jurisdiction Dropdown */}
            <div className="flex items-center gap-2 bg-navy-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
              <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedJurisdiction}
                onChange={e => setSelectedJurisdiction(e.target.value)}
                disabled={currentUser?.role === 'authority' && Boolean(currentUser.jurisdiction)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="All Jurisdictions" className="bg-navy-900">All Jurisdictions</option>
                <option value="Kochi Municipal Corp" className="bg-navy-900">Kochi Municipal Corp</option>
                <option value="Aluva Division" className="bg-navy-900">Aluva Division</option>
                <option value="Kakkanad SmartCity Zone" className="bg-navy-900">Kakkanad SmartCity Zone</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Counters Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Hazards</div>
          <div className="text-2xl font-black text-white font-mono mt-1.5">{filtered.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">In current viewport</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Needs Verification</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1.5">{pendingQueue.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Requires officer signoff</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-red-500/30">
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Critical Emergencies</span>
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1.5">{criticalQueue.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Urgent dispatch priority</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-blue-500/30">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Active Field Crews</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1.5">{activeRepairQueue.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Under active repair</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 col-span-2 md:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Certified Closed</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1.5">{resolvedQueue.length}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Pothole patched & safe</div>
        </div>
      </div>

      {/* Priority Scoring Formula Card */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-xs shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Info className="w-4 h-4" />
            Deterministic Priority Ranking Formula (0–100 Max)
          </span>
          <span className="text-slate-400 text-[11px] font-mono">Kerala PWD Standard</span>
        </div>
        <div className="p-3 rounded-xl bg-navy-950/90 border border-slate-800 text-[11px] font-mono text-cyan-200 flex flex-wrap items-center gap-2">
          <span>Priority =</span>
          <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300">Severity (35%)</span>
          <span>+</span>
          <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300">Confidence & Photo (25%)</span>
          <span>+</span>
          <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300">Unresolved Age (20%)</span>
          <span>+</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">Traffic Exposure (20%)</span>
        </div>
      </div>

      {/* View Mode 1: Interactive Kanban Operations Board */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map(col => (
            <div
              key={col.id}
              className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-col h-[650px] shadow-xl"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-xs uppercase tracking-wider text-white font-mono">
                  {col.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${col.badgeColor}`}>
                  {col.items.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 mt-3 pr-1">
                {col.items.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-slate-500 text-xs italic">
                    No tickets in this stage
                  </div>
                ) : (
                  col.items.map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => onSelectIncident(inc)}
                      className="p-3.5 rounded-xl bg-navy-950/80 border border-slate-800/80 hover:border-cyan-400 hover:bg-navy-900 cursor-pointer transition-all space-y-2 shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon category={inc.category} className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono text-[10px] font-bold text-slate-300">{inc.id}</span>
                        </div>
                        <SeverityBadge severity={inc.severity} />
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {inc.title}
                      </h4>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="line-clamp-1">{inc.locationName}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-amber-400 font-bold">P: {inc.priorityScore}/100</span>
                        <span className="text-cyan-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode 2: Traditional Queue List */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Inspection List */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Operations Work Queue ({filtered.length})</span>
              </h2>
            </div>

            <div className="space-y-2.5">
              {filtered.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className="glass-card p-4 rounded-2xl border-slate-800/80 hover:border-cyan-400 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                        {inc.id}
                      </span>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                      <span className="text-[11px] font-bold text-amber-400 ml-auto sm:ml-0 font-mono">
                        P: {inc.priorityScore}/100
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {inc.locationName}
                      </span>
                      <span>•</span>
                      <span>{inc.reportCount} reports</span>
                      <span>•</span>
                      <span>Agency: {inc.assignedTeam || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 shrink-0">
                    <span>Manage Dispatch</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Rail: Critical Road Segments & Defect Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                <Activity className="w-4 h-4 text-rose-500" />
                <span>Monitored Road Corridors</span>
              </h3>

              <div className="space-y-2.5">
                {roadSegments.map(seg => (
                  <div key={seg.id} className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{seg.name}</span>
                      <span className={`font-mono font-bold ${seg.riskScore > 75 ? 'text-rose-400' : 'text-amber-400'}`}>
                        Risk {seg.riskScore}/100
                      </span>
                    </div>
                    {/* Risk Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${seg.riskScore > 75 ? 'bg-rose-500' : 'bg-amber-400'}`}
                        style={{ width: `${seg.riskScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>{seg.roadType}</span>
                      <span>{seg.activeHazardCount} hazard(s) active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incident by Category Breakdown */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Breakdown by Defect Category
              </h3>
              <div className="space-y-1.5 text-xs">
                {stats?.categoryCounts &&
                  Object.entries(stats.categoryCounts).map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between p-2 rounded-xl bg-navy-950/60 border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={cat as IncidentCategory} className="w-3.5 h-3.5" />
                        <span className="text-slate-300 capitalize">{cat.replace(/_/g, ' ')}</span>
                      </div>
                      <span className="font-mono font-bold text-white">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AuthorityDashboardPage;
