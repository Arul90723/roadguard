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
  AlertOctagon
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

  const categories: { key: IncidentCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'pothole', label: 'Potholes' },
    { key: 'waterlogging', label: 'Waterlogging' },
    { key: 'pipeline_leakage', label: 'Pipeline Leakage' },
    { key: 'fallen_electrical_wire', label: 'Fallen Wire' },
    { key: 'damaged_streetlight', label: 'Streetlight' },
    { key: 'broken_manhole', label: 'Manhole' },
    { key: 'fallen_tree', label: 'Fallen Tree' },
    { key: 'damaged_traffic_signal', label: 'Traffic Signal' },
    { key: 'road_collapse', label: 'Road Collapse' },
    { key: 'other_road_obstruction', label: 'Obstruction' },
  ];

  return (
    <div className="space-y-4">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <span>Interactive Road Hazard Map</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial intelligence in Kochi & surrounding highway corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRiskSegments(!showRiskSegments)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showRiskSegments
                ? 'bg-cyan-950 text-cyan-400 border-cyan-500/50'
                : 'bg-navy-900 text-slate-400 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showRiskSegments ? 'Hide Risk Corridors' : 'Show Risk Corridors'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-navy-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
            title="Refresh map data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location, road, ID..."
              className="w-full bg-navy-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-navy-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              {categories.map(c => (
                <option key={c.key} value={c.key} className="bg-navy-900 text-white">
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-navy-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-navy-900 text-white">All Severities</option>
              <option value="critical" className="bg-navy-900 text-white">Critical</option>
              <option value="high" className="bg-navy-900 text-white">High</option>
              <option value="moderate" className="bg-navy-900 text-white">Moderate</option>
              <option value="low" className="bg-navy-900 text-white">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-navy-950 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-navy-900 text-white">All Statuses</option>
              <option value="candidate" className="bg-navy-900 text-white">Candidate</option>
              <option value="pending_verification" className="bg-navy-900 text-white">Pending Verification</option>
              <option value="verified" className="bg-navy-900 text-white">Verified</option>
              <option value="assigned" className="bg-navy-900 text-white">Assigned</option>
              <option value="repair_in_progress" className="bg-navy-900 text-white">Repair in Progress</option>
              <option value="resolved" className="bg-navy-900 text-white">Resolved & Safe</option>
            </select>
          </div>
        </div>

        {/* Quick pill stats */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1 border-t border-slate-800">
          <span>Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} incidents</span>
          <span className="text-cyan-400 font-medium">Click any hazard or map marker to view verification & repair details</span>
        </div>
      </div>

      {/* Main Map + Side List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <MapView
            incidents={filteredIncidents}
            roadSegments={showRiskSegments ? roadSegments : []}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            heightClass="h-[600px]"
          />
        </div>

        {/* Incidents Sidebar List */}
        <div className="h-[600px] flex flex-col bg-navy-900/80 border border-slate-800 rounded-2xl p-3 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between px-2 pb-2.5 border-b border-slate-800 text-xs font-bold text-slate-300">
            <span>HAZARDS LIST ({filteredIncidents.length})</span>
            <span className="text-[11px] text-slate-500 font-mono">PRIORITY RANKED</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No incidents match current filter criteria.
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400/60 shadow-lg shadow-cyan-950'
                        : 'bg-navy-950/60 border-slate-800/80 hover:bg-navy-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={inc.category} className="w-4 h-4 shrink-0" />
                        <span className="font-mono text-[10px] font-bold text-cyan-400">
                          {inc.id}
                        </span>
                        <SeverityBadge severity={inc.severity} />
                      </div>
                      <span className="text-[11px] font-bold text-amber-400">
                        P: {inc.priorityScore}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1.5 line-clamp-1">
                      {inc.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {inc.locationName}
                    </p>

                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                      <StatusBadge status={inc.status} />
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>{inc.reportCount} reports</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
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
