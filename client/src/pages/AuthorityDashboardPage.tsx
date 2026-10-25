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
  MapPin
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

  // Filter incidents for this authority
  const filtered = incidents.filter(inc => {
    // Jurisdiction restriction check
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-navy-900/90 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-mono">
                Authority Operations Command
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                Official Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Logged in as: <strong className="text-slate-200">{currentUser?.displayName}</strong> ({currentUser?.department || 'Kerala PWD Infrastructure Wing'})
            </p>
          </div>
        </div>

        {/* Jurisdiction Filter */}
        <div className="flex items-center gap-2 bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs">
          <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-400">Jurisdiction:</span>
          <select
            value={selectedJurisdiction}
            onChange={e => setSelectedJurisdiction(e.target.value)}
            disabled={currentUser?.role === 'authority' && Boolean(currentUser.jurisdiction)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All Jurisdictions" className="bg-navy-900">All Jurisdictions</option>
            <option value="Kochi Municipal Corp" className="bg-navy-900">Kochi Municipal Corp</option>
            <option value="Aluva Division" className="bg-navy-900">Aluva Division</option>
            <option value="Kakkanad SmartCity Zone" className="bg-navy-900">Kakkanad SmartCity Zone</option>
          </select>
        </div>
      </div>

      {/* Transparent Priority Score Formula Explainer Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs shadow-lg">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            Transparent Incident Prioritisation Formula
          </span>
          <span className="text-slate-400 text-[11px]">Weights sum to 100 max score</span>
        </div>
        <p className="text-slate-300 text-[11px] font-mono bg-navy-950 p-2.5 rounded-xl border border-slate-800">
          Priority = (SeverityWeight × 35%) + (Confidence & Evidence × 25%) + (Unresolved Age × 20%) + (Traffic Flow Exposure × 20%)
        </p>
        <p className="text-[11px] text-slate-400 mt-1.5">
          *Ensures emergency electrocution wires, road cave-ins, and high-frequency commuter bump corridors are dispatched before minor surface defects.
        </p>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Hazards</span>
          <div className="text-2xl font-black text-white font-mono mt-1">{filtered.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-amber-400">Needs Verification</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{pendingQueue.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-red-400">Critical Emergencies</span>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">{criticalQueue.length}</div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow">
          <span className="text-[11px] font-bold uppercase text-blue-400">Under Repair</span>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            {filtered.filter(i => ['assigned', 'repair_in_progress'].includes(i.status)).length}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 shadow col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold uppercase text-emerald-400">Certified Resolved</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {filtered.filter(i => i.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Main Operations Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Queue (Pending & Assigned) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Inspection & Dispatch Verification Queue</span>
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
              >
                <option value="all">All Lifecycle States</option>
                <option value="candidate">Candidate</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="repair_in_progress">Repair in Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map(inc => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-navy-800/60 cursor-pointer transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      {inc.id}
                    </span>
                    <SeverityBadge severity={inc.severity} />
                    <StatusBadge status={inc.status} />
                    <span className="text-[11px] font-bold text-amber-400 ml-auto sm:ml-0">
                      Score: {inc.priorityScore}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">
                    {inc.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {inc.locationName}
                    </span>
                    <span>•</span>
                    <span>{inc.reportCount} report(s)</span>
                    <span>•</span>
                    <span className="truncate max-w-[150px]">Agency: {inc.assignedTeam || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                    <span>Manage Dispatch</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Risk Heat Corridors & Analytics Breakdown */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-rose-500" />
              <span>Critical Road Segments (Kerala PWD)</span>
            </h3>

            <div className="space-y-2.5">
              {roadSegments.map(seg => (
                <div key={seg.id} className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{seg.name}</span>
                    <span className={`font-mono font-bold ${seg.riskScore > 75 ? 'text-rose-400' : 'text-amber-400'}`}>
                      Risk {seg.riskScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{seg.roadType}</span>
                    <span>{seg.activeHazardCount} active hazard(s)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Incidents by Defect Category
            </h3>
            <div className="space-y-1.5 text-xs">
              {stats?.categoryCounts &&
                Object.entries(stats.categoryCounts).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded-lg bg-navy-950/60 border border-slate-800/80">
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
    </div>
  );
};
