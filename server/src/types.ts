export type UserRole = 'citizen' | 'authority' | 'admin';

export type IncidentCategory =
  | 'pothole'
  | 'waterlogging'
  | 'pipeline_leakage'
  | 'fallen_electrical_wire'
  | 'damaged_streetlight'
  | 'broken_manhole'
  | 'fallen_tree'
  | 'damaged_traffic_signal'
  | 'road_collapse'
  | 'other_road_obstruction';

export type IncidentSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentStatus =
  | 'candidate'
  | 'pending_verification'
  | 'verified'
  | 'assigned'
  | 'repair_in_progress'
  | 'resolved';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  jurisdiction?: string;
  department?: string;
  phone?: string;
  createdAt: string;
}

export interface IncidentPhoto {
  id: string;
  incidentId: string;
  reportId?: string;
  photoUrl: string;
  caption?: string;
  photoType: 'citizen_report' | 'authority_inspection' | 'repair_proof';
  capturedAt: string;
}

export interface IncidentReport {
  id: string;
  incidentId: string;
  userId?: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  photoUrl?: string;
  createdAt: string;
}

export interface IncidentStatusHistoryItem {
  id: string;
  incidentId: string;
  previousStatus?: IncidentStatus;
  newStatus: IncidentStatus;
  changedByUserId?: string;
  changedByName?: string;
  notes?: string;
  evidencePhotoUrl?: string;
  createdAt: string;
}

export interface MaintenanceAssignment {
  id: string;
  incidentId: string;
  assignedAgency: string;
  assignedTeamLeader?: string;
  targetDate: string;
  priorityLevel: 'low' | 'normal' | 'urgent';
  workOrderNumber?: string;
  instructions?: string;
  createdAt: string;
}

export interface PriorityBreakdown {
  severityWeight: number; // Max 35
  confidenceScore: number; // Max 25
  ageFactor: number;       // Max 20
  trafficExposure: number; // Max 20
  total: number;           // 0 - 100
  formula: string;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  jurisdiction: string;
  priorityScore: number;
  priorityBreakdown: PriorityBreakdown;
  confidenceScore: number;
  reportCount: number;
  sensorDetectionCount: number;
  primaryPhotoUrl?: string;
  reportedByUserId?: string;
  assignedTeam?: string;
  targetRepairDate?: string;
  reopenCount: number;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  reports?: IncidentReport[];
  photos?: IncidentPhoto[];
  history?: IncidentStatusHistoryItem[];
  assignments?: MaintenanceAssignment[];
  isDemo?: boolean;
}

export interface SensorReadingSample {
  timestamp: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  rotationAlpha?: number;
  rotationBeta?: number;
  rotationGamma?: number;
  norm: number;
}

export interface SensorEvent {
  id: string;
  userId?: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  speedMps?: number;
  peakAccelZ: number;
  peakNorm: number;
  confidence: number;
  sampleWindow: SensorReadingSample[];
  associatedIncidentId?: string;
  isCandidateOnly: boolean;
  label: 'Potential Road Impact — Unverified';
  createdAt: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  jurisdiction: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  riskScore: number; // 0 - 100
  activeHazardCount: number;
  speedLimitKmh: number;
  roadType: string;
}

export interface RouteOption {
  id: string;
  name: string;
  preference: 'safest' | 'fastest' | 'shortest' | 'fuel_efficient' | 'balanced';
  distanceKm: number;
  durationMinutes: number;
  nearbyVerifiedHazards: number;
  severityWeightedHazardScore: number; // Lower is safer
  estimatedFuelLiters?: number;
  routeQualityScore: 'A' | 'B' | 'C' | 'D';
  recommendationExplanation: string;
  coordinates: [number, number][]; // [lat, lng][]
  hazardsOnRoute: {
    incidentId: string;
    category: IncidentCategory;
    severity: IncidentSeverity;
    distanceMeters: number;
    title: string;
  }[];
}
