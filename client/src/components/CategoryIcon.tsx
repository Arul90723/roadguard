import React from 'react';
import {
  AlertTriangle,
  Zap,
  Waves,
  Droplets,
  LightbulbOff,
  ShieldAlert,
  Trees,
  Construction,
  AlertOctagon,
  CircleDot
} from 'lucide-react';
import { IncidentCategory } from '../types';

interface Props {
  category: IncidentCategory;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<Props> = ({ category, className = 'w-5 h-5', size }) => {
  const iconProps = { className, size };

  switch (category) {
    case 'fallen_electrical_wire':
      return <Zap {...iconProps} className={`${className} text-rose-500`} />;
    case 'road_collapse':
      return <AlertOctagon {...iconProps} className={`${className} text-red-600`} />;
    case 'waterlogging':
      return <Waves {...iconProps} className={`${className} text-cyan-400`} />;
    case 'pipeline_leakage':
      return <Droplets {...iconProps} className={`${className} text-sky-400`} />;
    case 'pothole':
      return <CircleDot {...iconProps} className={`${className} text-amber-500`} />;
    case 'broken_manhole':
      return <ShieldAlert {...iconProps} className={`${className} text-orange-500`} />;
    case 'fallen_tree':
      return <Trees {...iconProps} className={`${className} text-emerald-500`} />;
    case 'damaged_streetlight':
      return <LightbulbOff {...iconProps} className={`${className} text-yellow-400`} />;
    case 'damaged_traffic_signal':
      return <AlertTriangle {...iconProps} className={`${className} text-amber-400`} />;
    case 'other_road_obstruction':
    default:
      return <Construction {...iconProps} className={`${className} text-purple-400`} />;
  }
};

export const getCategoryLabel = (category: IncidentCategory): string => {
  const map: Record<IncidentCategory, string> = {
    pothole: 'Pothole',
    waterlogging: 'Waterlogging',
    pipeline_leakage: 'Pipeline Leakage',
    fallen_electrical_wire: 'Fallen Electrical Wire',
    damaged_streetlight: 'Damaged Streetlight',
    broken_manhole: 'Broken Manhole',
    fallen_tree: 'Fallen Tree',
    damaged_traffic_signal: 'Damaged Traffic Signal',
    road_collapse: 'Road Collapse',
    other_road_obstruction: 'Other Road Obstruction',
  };
  return map[category] || category;
};
