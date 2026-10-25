import React from 'react';
import { IncidentSeverity } from '../types';

interface Props {
  severity: IncidentSeverity;
  className?: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity, className = '' }) => {
  const styles: Record<IncidentSeverity, { bg: string; dot: string; label: string }> = {
    critical: {
      bg: 'bg-red-500/15 border-red-500/30 text-red-400',
      dot: 'bg-red-500 animate-pulse',
      label: 'Critical Hazard'
    },
    high: {
      bg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      dot: 'bg-orange-500',
      label: 'High Severity'
    },
    moderate: {
      bg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-500',
      label: 'Moderate'
    },
    low: {
      bg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
      dot: 'bg-blue-400',
      label: 'Low Severity'
    }
  };

  const style = styles[severity] || styles.moderate;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};
