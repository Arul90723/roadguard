import React, { useState } from 'react';
import { Incident, IncidentStatus, UserRole } from '../types';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { CategoryIcon, getCategoryLabel } from './CategoryIcon';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Activity,
  Shield,
  RotateCcw,
  Wrench,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  FileText,
  Camera,
  ExternalLink
} from 'lucide-react';

interface Props {
  incident: Incident | null;
  onClose: () => void;
  userRole?: UserRole;
  onUpdateStatus?: (id: string, status: IncidentStatus, notes?: string, assignedTeam?: string, targetRepairDate?: string) => Promise<void>;
  onReopenIncident?: (id: string, notes: string) => Promise<void>;
}

export const IncidentModal: React.FC<Props> = ({
  incident,
  onClose,
  userRole = 'citizen',
  onUpdateStatus,
  onReopenIncident
}) => {
  if (!incident) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'evidence' | 'authority'>('details');
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus>(incident.status);
  const [statusNotes, setStatusNotes] = useState('');
  const [assignedAgency, setAssignedAgency] = useState(incident.assignedTeam || 'Kerala PWD District Division');
  const [targetDate, setTargetDate] = useState(incident.targetRepairDate || '2026-10-30');
  const [reopenNotes, setReopenNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const isAuthority = userRole === 'authority' || userRole === 'admin';
  const isElectrical = incident.category === 'fallen_electrical_wire';

  const handleStatusSubmit = async () => {
    if (!onUpdateStatus) return;
    setIsSubmitting(true);
    try {
      await onUpdateStatus(incident.id, selectedStatus, statusNotes, assignedAgency, targetDate);
      setFeedbackMsg('Status and assignment successfully updated!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenSubmit = async () => {
    if (!onReopenIncident || !reopenNotes.trim()) {
      alert('Please explain why this defect is being reopened.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReopenIncident(incident.id, reopenNotes);
      setFeedbackMsg('Incident reopened for re-inspection.');
      setReopenNotes('');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reopen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl glass-panel border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-navy-950/70">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-700/80 text-cyan-400 shrink-0 shadow-inner">
              <CategoryIcon category={incident.category} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {incident.id}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {getCategoryLabel(incident.category)}
                </span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                {incident.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{incident.locationName}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-cyan-400">
                  {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Electrical Alert Callout if applicable */}
        {isElectrical && (
          <div className="bg-red-950/80 border-b border-red-500/50 p-3.5 px-6 flex items-center gap-3 text-red-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-bounce" />
            <div>
              <strong className="text-red-300">HIGH-VOLTAGE SAFETY WARNING:</strong> Stay back at least 15 meters. Do not touch water or conduct electricity. Immediately alert KSEB emergency dispatch at <strong>1912</strong>.
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-navy-950/40 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Incident Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Evidence & Audit ({incident.reportCount})</span>
          </button>
          {isAuthority && (
            <button
              onClick={() => setActiveTab('authority')}
              className={`py-3.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'authority'
                  ? 'border-cyan-400 text-cyan-400 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Authority Workflow</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-5">
          {feedbackMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Photo preview */}
              {incident.primaryPhotoUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-60 shadow-xl">
                  <img
                    src={incident.primaryPhotoUrl}
                    alt={incident.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-navy-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-mono text-cyan-300 border border-cyan-500/40">
                    Verified Camera Evidence
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 font-mono">
                  Hazard Context & Observations
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 bg-navy-950/70 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
                  {incident.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Citizen Reports</span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {incident.reportCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sensor Impacts</span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {incident.sensorDetectionCount}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Confidence</span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1.5 font-mono">
                    {Math.round((incident.confidenceScore || 0.7) * 100)}%
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-navy-950/70 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Assigned Agency</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1.5 truncate" title={incident.assignedTeam || 'Unassigned'}>
                    {incident.assignedTeam || 'Pending Assignment'}
                  </div>
                </div>
              </div>

              {/* Priority Score Breakdown (Transparent Formula) */}
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                    <Info className="w-3.5 h-3.5" />
                    Priority Score: {incident.priorityScore} / 100
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Jurisdiction: {incident.jurisdiction}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-navy-900/80 p-2.5 rounded-xl border border-slate-800">
                  {incident.priorityBreakdown?.formula || 'Formula = Severity(35) + Confidence(25) + AgeFactor(20) + TrafficExposure(20)'}
                </p>
                <div className="grid grid-cols-4 gap-2 mt-2 text-[11px] text-center font-mono">
                  <div className="bg-navy-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Severity</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.severityWeight || 25}/35</span>
                  </div>
                  <div className="bg-navy-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Confidence</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.confidenceScore || 18}/25</span>
                  </div>
                  <div className="bg-navy-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Age Weight</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.ageFactor || 12}/20</span>
                  </div>
                  <div className="bg-navy-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Traffic Flow</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.trafficExposure || 18}/20</span>
                  </div>
                </div>
              </div>

              {/* Reopen Info if re-opened */}
              {incident.reopenCount > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>This hazard was previously marked resolved but was reopened <strong>{incident.reopenCount} time(s)</strong> due to persistent road defects.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Citizen reports consolidated by geospatial clustering:</span>
                <span className="font-semibold text-white font-mono">{incident.reports?.length || 1} report(s)</span>
              </div>

              {incident.reports && incident.reports.length > 0 ? (
                <div className="space-y-2.5">
                  {incident.reports.map((rep, idx) => (
                    <div key={rep.id} className="p-3.5 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300 font-mono">Report #{idx + 1} ({rep.id})</span>
                        <span className="text-slate-500 font-mono text-[11px]">{new Date(rep.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{rep.description}</p>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-1 font-mono">
                        <span>GPS: {rep.latitude.toFixed(5)}, {rep.longitude.toFixed(5)}</span>
                        {rep.accuracyMeters && <span>Lock: ±{rep.accuracyMeters.toFixed(1)}m</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Initial incident recorded without separate report logs.
                </div>
              )}

              {/* Lifecycle Audit history */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                  Official Verification & Work History
                </h4>
                <div className="space-y-2">
                  {incident.history && incident.history.length > 0 ? (
                    incident.history.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-white font-semibold">{item.changedByName || 'Official'}</span>
                          <span className="text-slate-500 text-[11px] font-mono">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">{item.notes}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs">No status change events logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'authority' && isAuthority && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-cyan-500/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                  Update Incident Lifecycle Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ['candidate', 'pending_verification', 'verified', 'assigned', 'repair_in_progress', 'resolved'] as IncidentStatus[]
                  ).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`p-2.5 rounded-xl text-xs font-semibold capitalize border transition-all text-left ${
                        selectedStatus === st
                          ? 'bg-cyan-500 text-navy-950 border-cyan-400 font-bold shadow-glow-cyan'
                          : 'bg-navy-900 text-slate-300 border-slate-700 hover:bg-navy-800'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">Assigned Repair Agency / Crew</label>
                    <select
                      value={assignedAgency}
                      onChange={e => setAssignedAgency(e.target.value)}
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                    >
                      <option value="Kerala PWD District Division">Kerala PWD District Division</option>
                      <option value="KSEB Electrical Section Central">KSEB Electrical Section Central</option>
                      <option value="Kerala Water Authority (KWA)">Kerala Water Authority (KWA)</option>
                      <option value="Kochi Corporation Drainage Squad">Kochi Corporation Drainage Squad</option>
                      <option value="City Traffic Signal Maintenance Cell">City Traffic Signal Maintenance Cell</option>
                      <option value="Fire & Rescue Disaster Response">Fire & Rescue Disaster Response</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1 font-mono">Target Inspection / Repair Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full bg-navy-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Inspection / Work Order Notes</label>
                  <textarea
                    rows={2}
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Enter official notes, work order number, or repair confirmation..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <button
                  onClick={handleStatusSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Status & Assignment Update'}
                </button>
              </div>

              {/* Reopen Incident Section */}
              {incident.status === 'resolved' && (
                <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/40 space-y-2">
                  <h4 className="text-xs font-bold text-red-300 flex items-center gap-1.5 font-mono">
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reopen Incident (Quality Audit Flag)
                  </h4>
                  <p className="text-[11px] text-red-200">
                    If fresh commuter reports or field inspection reveals that the repair failed or hazard persists:
                  </p>
                  <textarea
                    rows={2}
                    value={reopenNotes}
                    onChange={e => setReopenNotes(e.target.value)}
                    placeholder="Provide specific justification for reopening this defect..."
                    className="w-full bg-navy-950 border border-red-500/50 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleReopenSubmit}
                    disabled={isSubmitting}
                    className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    Reopen for Re-Verification
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-navy-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <Calendar className="w-3.5 h-3.5" />
            <span>Logged: {new Date(incident.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl glass-button-secondary text-slate-200 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default IncidentModal;
