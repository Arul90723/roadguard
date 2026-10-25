import React from 'react';
import { IncidentStatus } from '../types';

interface Props {
  status: IncidentStatus;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const styles: Record<IncidentStatus, { bg: string; text: string; label: string }> = {
    candidate: {
      bg: 'bg-slate-700/50 border-slate-600 text-slate-300',
      text: 'text-slate-300',
      label: 'Candidate'
    },
    pending_verification: {
      bg: 'bg-amber-950/40 border-amber-500/40 text-amber-300',
      text: 'text-amber-300',
      label: 'Pending Verification'
    },
    verified: {
      bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300',
      text: 'text-cyan-300',
      label: 'Verified'
    },
    assigned: {
      bg: 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300',
      text: 'text-indigo-300',
      label: 'Assigned to Crew'
    },
    repair_in_progress: {
      bg: 'bg-blue-950/40 border-blue-500/40 text-blue-300',
      text: 'text-blue-300',
      label: 'Repair in Progress'
    },
    resolved: {
      bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300',
      text: 'text-emerald-300',
      label: 'Resolved & Safe'
    }
  };

  const style = styles[status] || styles.pending_verification;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${className}`}>
      {style.label}
    </span>
  );
};
