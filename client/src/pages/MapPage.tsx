import React, { useState } from 'react';
import { Incident, IncidentCategory, IncidentSeverity, IncidentStatus, RoadSegment } from '../types';
import { MapView } from '../components/MapView';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';
import {
  Search,
  Filter,
  Layers,
  MapPin,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Compass,
  Crosshair,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  roadSegments: RoadSegment[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onRefresh: () => void;
}

export const MapPage: React.FC<Props> = ({
  incidents,
  roadSegments,
  selectedIncident,
  onSelectIncident,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showRiskSegments, setShowRiskSegments] = useState(true);

  // Filter incidents locally
  const filteredIncidents = incidents.filter(inc => {
    if (selectedCategory !== 'all' && inc.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && inc.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'all' && inc.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories: { key: IncidentCategory | 'all'; label: string; iconEmoji?: string }[] = [
    { key: 'all', label: 'All Hazards' },
    { key: 'pothole', label: 'Potholes' },
    { key: 'waterlogging', label: 'Flooding' },
    { key: 'pipeline_leakage', label: 'Pipeline Leak' },
    { key: 'fallen_electrical_wire', label: 'Live Wire' },
    { key: 'damaged_streetlight', label: 'Streetlight' },
    { key: 'broken_manhole', label: 'Broken Manhole' },
    { key: 'fallen_tree', label: 'Fallen Tree' },
    { key: 'damaged_traffic_signal', label: 'Signal Defect' },
    { key: 'road_collapse', label: 'Cave-In' },
    { key: 'other_road_obstruction', label: 'Obstructions' },
  ];

  // Quick stats
  const criticalCount = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
  const inProgressCount = incidents.filter(i => i.status === 'repair_in_progress' || i.status === 'assigned').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header & Tactical Metric Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live PostGIS Feed
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Kochi GIS Node Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MapPin className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
            <span>Interactive Road Hazard Map</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time geospatial intelligence, road safety index corridors, and field telemetry across Kochi metropolitan arterials.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="px-3.5 py-2 rounded-xl bg-navy-950/70 border border-red-500/30 flex items-center gap-2.5 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Critical</div>
              <div className="text-lg font-black text-red-400 font-mono leading-none">{criticalCount}</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-navy-950/70 border border-amber-500/30 flex items-center gap-2.5 shadow-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Repairs</div>
              <div className="text-lg font-black text-amber-400 font-mono leading-none">{inProgressCount}</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-navy-950/70 border border-emerald-500/30 flex items-center gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Fixed</div>
              <div className="text-lg font-black text-emerald-400 font-mono leading-none">{resolvedCount}</div>
            </div>
          </div>

          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl glass-button-secondary text-slate-300 hover:text-white transition-transform active:scale-95"
            title="Refresh map telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar Island */}
      <div className="glass-panel p-4 rounded-2xl space-y-3.5 shadow-xl border border-slate-800/80">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by street name, landmark, incident ID or tag..."
              className="w-full bg-navy-950/80 border border-slate-700/80 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Controls Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            {/* Severity Filter */}
            <div className="flex items-center gap-1.5 bg-navy-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
              <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="bg-navy-900 text-white">All Severities</option>
                <option value="critical" className="bg-navy-900 text-red-400">Critical Only</option>
                <option value="high" className="bg-navy-900 text-orange-400">High Severity</option>
                <option value="moderate" className="bg-navy-900 text-amber-400">Moderate</option>
                <option value="low" className="bg-navy-900 text-slate-400">Low Risk</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-navy-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1 text-xs"
              >
                <option value="all" className="bg-navy-900 text-white">All Workflows</option>
                <option value="candidate" className="bg-navy-900 text-white">Sensor Candidate</option>
                <option value="pending_verification" className="bg-navy-900 text-white">Pending Verification</option>
                <option value="verified" className="bg-navy-900 text-white">Verified</option>
                <option value="assigned" className="bg-navy-900 text-white">Assigned to Crew</option>
                <option value="repair_in_progress" className="bg-navy-900 text-white">Work in Progress</option>
                <option value="resolved" className="bg-navy-900 text-white">Resolved & Cleared</option>
              </select>
            </div>

            {/* Corridor Toggle Button */}
            <button
              onClick={() => setShowRiskSegments(!showRiskSegments)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                showRiskSegments
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-glow-cyan'
                  : 'bg-navy-950/80 text-slate-400 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showRiskSegments ? 'Corridors On' : 'Corridors Off'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 border-t border-slate-800/60">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Filters:
          </span>
          {categories.map(c => {
            const isCatActive = selectedCategory === c.key;
            const count = c.key === 'all' 
              ? incidents.length 
              : incidents.filter(i => i.category === c.key).length;

            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  isCatActive
                    ? 'bg-cyan-500 text-navy-950 font-bold shadow-glow-cyan'
                    : 'bg-navy-950/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isCatActive ? 'bg-navy-950/30 text-navy-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map + Priority Ranked Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl glass-card">
            <MapView
              incidents={filteredIncidents}
              roadSegments={showRiskSegments ? roadSegments : []}
              selectedIncident={selectedIncident}
              onSelectIncident={onSelectIncident}
              heightClass="h-[620px]"
            />
          </div>
        </div>

        {/* Incidents Sidebar List */}
        <div className="lg:col-span-4 h-[620px] flex flex-col glass-panel rounded-2xl p-4 overflow-hidden border border-slate-800/80 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="font-bold text-white tracking-wide uppercase font-mono">
                Hazard Queue ({filteredIncidents.length})
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              PRIORITY FORMULA
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 mt-3 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs space-y-2">
                <AlertTriangle className="w-8 h-8 text-slate-600 mb-1" />
                <p className="font-medium text-slate-400">No matching hazards found</p>
                <p className="text-[11px] text-slate-600">Try adjusting your category or severity filters above.</p>
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                
                // Color for priority score
                let scoreColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-950/40';
                if (inc.priorityScore >= 80) {
                  scoreColor = 'text-red-400 border-red-500/40 bg-red-950/40';
                } else if (inc.priorityScore >= 60) {
                  scoreColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
                }

                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-glow-cyan transform scale-[1.01]'
                        : 'bg-navy-950/70 border-slate-800/80 hover:bg-navy-900/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Category, ID, Priority Score */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-navy-900 border border-slate-700/60 text-cyan-400">
                          <CategoryIcon category={inc.category} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-300">
                          {inc.id}
                        </span>
                        <SeverityBadge severity={inc.severity} />
                      </div>

                      {/* Score Badge */}
                      <div className={`px-2 py-0.5 rounded-md border font-mono text-[11px] font-bold ${scoreColor}`}>
                        P: {inc.priorityScore}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-white mt-2 line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {inc.title}
                    </h4>

                    {/* Location */}
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{inc.locationName}</span>
                    </p>

                    {/* Priority Bar Indicator */}
                    <div className="mt-2.5 w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          inc.priorityScore >= 80
                            ? 'bg-gradient-to-r from-red-500 to-amber-500'
                            : inc.priorityScore >= 60
                            ? 'bg-gradient-to-r from-amber-500 to-cyan-400'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, inc.priorityScore)}%` }}
                      />
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px]">
                      <StatusBadge status={inc.status} />
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <span>{inc.reportCount} {inc.reportCount === 1 ? 'report' : 'reports'}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MapPage;
