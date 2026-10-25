import {
  DashboardStats,
  Incident,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
  RoadSegment,
  RouteOption,
  SensorEvent,
  User
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<any> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDemoUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/auth/demo-users`);
  const data = await res.json();
  return data.users || [];
}

export async function fetchIncidents(filters?: {
  category?: IncidentCategory;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  jurisdiction?: string;
  search?: string;
}): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.jurisdiction && filters.jurisdiction !== 'All Jurisdictions') {
    params.append('jurisdiction', filters.jurisdiction);
  }
  if (filters?.search) params.append('search', filters.search);

  const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
  const data = await res.json();
  return data.incidents || [];
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  const data = await res.json();
  return data.incident;
}

export async function submitIncidentReport(payload: {
  category: IncidentCategory;
  severity: IncidentSeverity;
  description: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  photoBase64?: string;
  userId?: string;
  userName?: string;
  accuracyMeters?: number;
}): Promise<{ success: boolean; isNewIncident: boolean; incident: Incident; message: string }> {
  const res = await fetch(`${API_BASE}/incidents/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to submit incident report');
  }

  return res.json();
}

export async function updateIncidentStatus(
  id: string,
  payload: {
    status: IncidentStatus;
    notes?: string;
    changedByName?: string;
    evidencePhotoUrl?: string;
    assignedTeam?: string;
    targetRepairDate?: string;
  }
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to update status');
  }

  const data = await res.json();
  return data.incident;
}

export async function reopenIncident(
  id: string,
  payload: {
    notes: string;
    reopenedByName: string;
    evidencePhotoUrl?: string;
  }
): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${id}/reopen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to reopen incident');
  }

  const data = await res.json();
  return data.incident;
}

export async function recordSensorEvent(payload: {
  journeyId: string;
  latitude: number;
  longitude: number;
  speedMps?: number;
  peakAccelZ: number;
  peakNorm: number;
  confidence?: number;
  sampleWindow: any[];
}): Promise<SensorEvent> {
  const res = await fetch(`${API_BASE}/sensor/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return data.event;
}

export async function fetchSensorEvents(): Promise<SensorEvent[]> {
  const res = await fetch(`${API_BASE}/sensor/events`);
  const data = await res.json();
  return data.events || [];
}

export async function compareRoutes(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicleType: string
): Promise<{
  routes: RouteOption[];
  isDemoService: boolean;
  disclaimer: string;
}> {
  const res = await fetch(`${API_BASE}/routes/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ origin, destination, vehicleType }),
  });

  return res.json();
}

export async function fetchRoadSegments(): Promise<RoadSegment[]> {
  const res = await fetch(`${API_BASE}/road-segments`);
  const data = await res.json();
  return data.segments || [];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}
