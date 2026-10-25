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
  CheckCircle2
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-navy-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-auto text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-navy-950/60">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-xl bg-navy-800 border border-slate-700 shrink-0">
              <CategoryIcon category={incident.category} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                  {incident.id}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {getCategoryLabel(incident.category)}
                </span>
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {incident.title}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{incident.locationName}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-[11px] text-slate-400">
                  ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Electrical Alert Callout if applicable */}
        {isElectrical && (
          <div className="bg-red-950/70 border-b border-red-500/40 p-3 px-5 flex items-center gap-3 text-red-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <strong className="text-red-300">ELECTRICAL HAZARD ADVISORY:</strong> Stay back at least 10 meters.
              High-voltage discharge hazard. Do not touch wet ground or approaching puddles. Contact KSEB 1912.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-5 bg-navy-950/30 text-sm">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'evidence'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Evidence & Corroboration ({incident.reportCount})
          </button>
          {isAuthority && (
            <button
              onClick={() => setActiveTab('authority')}
              className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'authority'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Authority Workflow</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-5">
          {feedbackMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {feedbackMsg}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Photo preview */}
              {incident.primaryPhotoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video max-h-56">
                  <img
                    src={incident.primaryPhotoUrl}
                    alt={incident.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-cyan-300 border border-slate-700">
                    Primary Photographic Evidence
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Incident Description
                </h3>
                <p className="text-sm text-slate-200 bg-navy-950/50 p-3 rounded-xl border border-slate-800">
                  {incident.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Citizen Reports</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {incident.reportCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sensor Impacts</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {incident.sensorDetectionCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Confidence</span>
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    {Math.round((incident.confidenceScore || 0.7) * 100)}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-navy-950/60 border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Assigned Agency</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate" title={incident.assignedTeam || 'Unassigned'}>
                    {incident.assignedTeam || 'Pending Assignment'}
                  </div>
                </div>
              </div>

              {/* Priority Score Breakdown (Transparent Formula) */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Transparent Priority Score: {incident.priorityScore} / 100
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Jurisdiction: {incident.jurisdiction}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono bg-navy-950 p-2.5 rounded-lg border border-slate-800">
                  {incident.priorityBreakdown?.formula || 'Calculated from Severity + Corroboration + Pavement Age + Arterial Traffic Weight'}
                </p>
                <div className="grid grid-cols-4 gap-2 mt-2 text-[11px] text-center">
                  <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Severity</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.severityWeight || 25}/35</span>
                  </div>
                  <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Confidence</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.confidenceScore || 18}/25</span>
                  </div>
                  <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Age Factor</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.ageFactor || 12}/20</span>
                  </div>
                  <div className="bg-navy-950 p-1.5 rounded border border-slate-800">
                    <span className="text-slate-400 block">Traffic Flow</span>
                    <span className="font-bold text-cyan-400">{incident.priorityBreakdown?.trafficExposure || 18}/20</span>
                  </div>
                </div>
              </div>

              {/* Reopen Info if re-opened */}
              {incident.reopenCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>This hazard was previously marked resolved but has been reopened <strong>{incident.reopenCount} time(s)</strong> due to persistent road defects.</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>All independent community reports consolidated into this incident:</span>
                <span className="font-semibold text-white">{incident.reports?.length || 1} report(s)</span>
              </div>

              {incident.reports && incident.reports.length > 0 ? (
                <div className="space-y-2.5">
                  {incident.reports.map((rep, idx) => (
                    <div key={rep.id} className="p-3 rounded-xl bg-navy-950/60 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-cyan-300">Report #{idx + 1} ({rep.id})</span>
                        <span className="text-slate-500">{new Date(rep.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200">{rep.description}</p>
                      <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-1">
                        <span>GPS: {rep.latitude.toFixed(5)}, {rep.longitude.toFixed(5)}</span>
                        {rep.accuracyMeters && <span>Accuracy: ±{rep.accuracyMeters.toFixed(1)}m</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Initial incident recorded without separate report logs.
                </div>
              )}

              {/* Audit history */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Lifecycle Audit Trail
                </h4>
                <div className="space-y-2">
                  {incident.history && incident.history.length > 0 ? (
                    incident.history.map(item => (
                      <div key={item.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-300">{item.changedByName || 'Official'}</span>
                          <span className="text-slate-500 text-[11px]">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">{item.notes}</p>
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
              <div className="p-3 rounded-xl bg-navy-950 border border-cyan-500/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
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
                      className={`p-2 rounded-lg text-xs font-semibold capitalize border transition-all text-left ${
                        selectedStatus === st
                          ? 'bg-cyan-500 text-navy-950 border-cyan-400 font-bold shadow'
                          : 'bg-navy-900 text-slate-300 border-slate-700 hover:bg-navy-800'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Assigned Repair Agency / Crew</label>
                    <select
                      value={assignedAgency}
                      onChange={e => setAssignedAgency(e.target.value)}
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
                    <label className="block text-[11px] text-slate-400 mb-1">Target Inspection / Repair Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[11px] text-slate-400 mb-1">Inspection / Work Order Notes</label>
                  <textarea
                    rows={2}
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Enter official notes, work order number, or repair confirmation..."
                    className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <button
                  onClick={handleStatusSubmit}
                  disabled={isSubmitting}
                  className="mt-3 w-full py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Commit Status & Assignment Update'}
                </button>
              </div>

              {/* Reopen Incident Section */}
              {incident.status === 'resolved' && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
                  <h4 className="text-xs font-bold text-red-300 flex items-center gap-1.5">
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
                    className="w-full bg-navy-950 border border-red-500/50 rounded-lg p-2 text-xs text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handleReopenSubmit}
                    disabled={isSubmitting}
                    className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    Reopen for Re-Verification
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Logged: {new Date(incident.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
