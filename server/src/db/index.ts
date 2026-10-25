import pg from 'pg';
import {
  Incident,
  IncidentCategory,
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  PriorityBreakdown,
  RoadSegment,
  SensorEvent,
  User
} from '../types.js';
import { DEMO_INCIDENTS, DEMO_ROAD_SEGMENTS, DEMO_USERS } from './seeds/keralaDemoData.js';

const { Pool } = pg;

// Proximity distance formula (Haversine in meters)
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function computePriorityScore(
  severity: IncidentSeverity,
  reportCount: number,
  sensorCount: number,
  hasPhoto: boolean,
  createdDate: Date,
  isResolved: boolean = false
): { score: number; breakdown: PriorityBreakdown } {
  if (isResolved) {
    return {
      score: 15.0,
      breakdown: {
        severityWeight: 0,
        confidenceScore: 0,
        ageFactor: 0,
        trafficExposure: 15.0,
        total: 15.0,
        formula: '0 (Resolved/Hazard Cleared) + Residual Historical Monitoring 15.0'
      }
    };
  }

  // 1. Severity Weight (Max 35)
  const severityMap: Record<IncidentSeverity, number> = {
    critical: 35,
    high: 26,
    moderate: 18,
    low: 8,
  };
  const severityWeight = severityMap[severity] || 15;

  // 2. Confidence Score (Max 25)
  const reportContrib = Math.min(12, reportCount * 4);
  const sensorContrib = Math.min(8, sensorCount * 4);
  const photoContrib = hasPhoto ? 5 : 0;
  const confidenceScore = Math.min(25, reportContrib + sensorContrib + photoContrib);

  // 3. Age Factor (Max 20) - Unresolved hazards get more urgent
  const ageInDays = Math.max(0, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  const ageFactor = Math.min(20, Number((ageInDays * 3.5).toFixed(1)));

  // 4. Traffic Exposure (Max 20)
  const trafficExposure = 18.0;

  const total = Number((severityWeight + confidenceScore + ageFactor + trafficExposure).toFixed(1));

  return {
    score: total,
    breakdown: {
      severityWeight,
      confidenceScore,
      ageFactor,
      trafficExposure,
      total,
      formula: `${severityWeight} (${severity.toUpperCase()}) + ${confidenceScore.toFixed(1)} (Confidence: ${reportCount} reports, ${sensorCount} sensors) + ${ageFactor.toFixed(1)} (Age: ${ageInDays.toFixed(1)}d) + ${trafficExposure} (Arterial Traffic)`
    }
  };
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgresConnected = false;

  // In-Memory store for fast, zero-config local runs
  private incidents: Incident[] = [];
  private users: User[] = [];
  private roadSegments: RoadSegment[] = [];
  private sensorEvents: SensorEvent[] = [];

  constructor() {
    this.seedInMemory();
    this.initPostgres();
  }

  private seedInMemory() {
    this.users = JSON.parse(JSON.stringify(DEMO_USERS));
    this.incidents = JSON.parse(JSON.stringify(DEMO_INCIDENTS));
    this.roadSegments = JSON.parse(JSON.stringify(DEMO_ROAD_SEGMENTS));
  }

  private async initPostgres() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.log('ℹ️  No DATABASE_URL provided. Running with high-fidelity In-Memory Kerala Demonstration Database.');
      return;
    }

    try {
      this.pool = new Pool({ connectionString: dbUrl });
      const client = await this.pool.connect();
      console.log(' Connected to PostgreSQL / PostGIS database!');
      client.release();
      this.isPostgresConnected = true;
    } catch (err) {
      console.warn('⚠️  Could not connect to PostgreSQL. Gracefully falling back to high-fidelity In-Memory database.', err);
      this.pool = null;
      this.isPostgresConnected = false;
    }
  }

  public isUsingPostgres(): boolean {
    return this.isPostgresConnected;
  }

  // --- Users ---
  public async getUsers(): Promise<User[]> {
    return this.users;
  }

  public async getUserById(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  // --- Incidents ---
  public async getIncidents(filters?: {
    category?: IncidentCategory;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
    jurisdiction?: string;
    search?: string;
  }): Promise<Incident[]> {
    let list = [...this.incidents];

    if (filters?.category) {
      list = list.filter(i => i.category === filters.category);
    }
    if (filters?.severity) {
      list = list.filter(i => i.severity === filters.severity);
    }
    if (filters?.status) {
      list = list.filter(i => i.status === filters.status);
    }
    if (filters?.jurisdiction && filters.jurisdiction !== 'All Jurisdictions') {
      list = list.filter(i => i.jurisdiction === filters.jurisdiction);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.locationName.toLowerCase().includes(q)
      );
    }

    // Sort by priority score descending
    return list.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  public async getIncidentById(id: string): Promise<Incident | undefined> {
    return this.incidents.find(i => i.id === id);
  }

  /**
   * Submits a report. If a similar report exists within ~60m with same category,
   * consolidates into the existing incident and increments report count.
   */
  public async submitReport(reportData: {
    category: IncidentCategory;
    severity: IncidentSeverity;
    description: string;
    latitude: number;
    longitude: number;
    locationName?: string;
    photoUrl?: string;
    userId?: string;
    userName?: string;
    accuracyMeters?: number;
  }): Promise<{ incident: Incident; isNew: boolean; reportId: string }> {
    const DUPLICATE_RADIUS_METERS = 60;
    const now = new Date();
    const reportId = `REP-${Date.now().toString(36).toUpperCase()}`;

    // Find candidate existing incident for consolidation
    const existing = this.incidents.find(inc => {
      if (inc.category !== reportData.category) return false;
      if (inc.status === 'resolved') return false;
      const dist = calculateDistanceMeters(inc.latitude, inc.longitude, reportData.latitude, reportData.longitude);
      return dist <= DUPLICATE_RADIUS_METERS;
    });

    if (existing) {
      // Consolidate into existing incident
      existing.reportCount += 1;
      if (reportData.photoUrl && !existing.primaryPhotoUrl) {
        existing.primaryPhotoUrl = reportData.photoUrl;
      }
      // Upgrade severity if new report has higher severity
      const severityOrder: Record<IncidentSeverity, number> = { low: 1, moderate: 2, high: 3, critical: 4 };
      if (severityOrder[reportData.severity] > severityOrder[existing.severity]) {
        existing.severity = reportData.severity;
      }

      // Recalculate priority
      const p = computePriorityScore(
        existing.severity,
        existing.reportCount,
        existing.sensorDetectionCount,
        Boolean(existing.primaryPhotoUrl),
        new Date(existing.createdAt),
        false
      );
      existing.priorityScore = p.score;
      existing.priorityBreakdown = p.breakdown;
      existing.updatedAt = now.toISOString();

      const newReport: IncidentReport = {
        id: reportId,
        incidentId: existing.id,
        userId: reportData.userId,
        category: reportData.category,
        severity: reportData.severity,
        description: reportData.description,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        accuracyMeters: reportData.accuracyMeters,
        photoUrl: reportData.photoUrl,
        createdAt: now.toISOString(),
      };

      if (!existing.reports) existing.reports = [];
      existing.reports.push(newReport);

      if (!existing.history) existing.history = [];
      existing.history.push({
        id: `HIST-${Date.now().toString(36)}`,
        incidentId: existing.id,
        newStatus: existing.status,
        changedByName: reportData.userName || 'Citizen Contributor',
        notes: `New corroborating report submitted (Total independent reports: ${existing.reportCount}).`,
        evidencePhotoUrl: reportData.photoUrl,
        createdAt: now.toISOString()
      });

      return { incident: existing, isNew: false, reportId };
    }

    // Otherwise create brand new incident
    const incId = `INC-KL-${(this.incidents.length + 1).toString().padStart(3, '0')}`;
    const p = computePriorityScore(
      reportData.severity,
      1,
      0,
      Boolean(reportData.photoUrl),
      now,
      false
    );

    const newReport: IncidentReport = {
      id: reportId,
      incidentId: incId,
      userId: reportData.userId,
      category: reportData.category,
      severity: reportData.severity,
      description: reportData.description,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      accuracyMeters: reportData.accuracyMeters,
      photoUrl: reportData.photoUrl,
      createdAt: now.toISOString(),
    };

    const newIncident: Incident = {
      id: incId,
      category: reportData.category,
      severity: reportData.severity,
      status: 'pending_verification',
      title: `${reportData.category.replace(/_/g, ' ').toUpperCase()} reported at ${reportData.locationName || 'Kerala Coordinate'}`,
      description: reportData.description,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      locationName: reportData.locationName || `Lat: ${reportData.latitude.toFixed(4)}, Lng: ${reportData.longitude.toFixed(4)}`,
      jurisdiction: 'Kochi Municipal Corp',
      priorityScore: p.score,
      priorityBreakdown: p.breakdown,
      confidenceScore: 0.65,
      reportCount: 1,
      sensorDetectionCount: 0,
      primaryPhotoUrl: reportData.photoUrl,
      reportedByUserId: reportData.userId,
      reopenCount: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      reports: [newReport],
      history: [
        {
          id: `HIST-${Date.now().toString(36)}`,
          incidentId: incId,
          newStatus: 'pending_verification',
          changedByName: reportData.userName || 'Citizen Report Flow',
          notes: 'Incident initially logged and awaiting authority verification.',
          evidencePhotoUrl: reportData.photoUrl,
          createdAt: now.toISOString()
        }
      ]
    };

    this.incidents.unshift(newIncident);
    return { incident: newIncident, isNew: true, reportId };
  }

  public async updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    options: {
      notes?: string;
      changedByName?: string;
      evidencePhotoUrl?: string;
      assignedTeam?: string;
      targetRepairDate?: string;
    }
  ): Promise<Incident | undefined> {
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) return undefined;

    const prevStatus = incident.status;
    incident.status = newStatus;
    incident.updatedAt = new Date().toISOString();

    if (options.assignedTeam) {
      incident.assignedTeam = options.assignedTeam;
    }
    if (options.targetRepairDate) {
      incident.targetRepairDate = options.targetRepairDate;
    }
    if (newStatus === 'resolved') {
      incident.resolvedAt = new Date().toISOString();
      const p = computePriorityScore(
        incident.severity,
        incident.reportCount,
        incident.sensorDetectionCount,
        Boolean(incident.primaryPhotoUrl),
        new Date(incident.createdAt),
        true
      );
      incident.priorityScore = p.score;
      incident.priorityBreakdown = p.breakdown;
    }

    if (!incident.history) incident.history = [];
    incident.history.push({
      id: `HIST-${Date.now().toString(36)}`,
      incidentId: incident.id,
      previousStatus: prevStatus,
      newStatus,
      changedByName: options.changedByName || 'Authority Officer',
      notes: options.notes || `Status transitioned from ${prevStatus} to ${newStatus}.`,
      evidencePhotoUrl: options.evidencePhotoUrl,
      createdAt: new Date().toISOString()
    });

    return incident;
  }

  public async reopenIncident(
    id: string,
    options: {
      notes: string;
      reopenedByName: string;
      evidencePhotoUrl?: string;
    }
  ): Promise<Incident | undefined> {
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) return undefined;

    const prevStatus = incident.status;
    incident.status = 'pending_verification';
    incident.reopenCount = (incident.reopenCount || 0) + 1;
    incident.resolvedAt = undefined;
    incident.updatedAt = new Date().toISOString();

    // Recalculate priority with reopened weight
    const p = computePriorityScore(
      incident.severity,
      incident.reportCount,
      incident.sensorDetectionCount,
      Boolean(incident.primaryPhotoUrl),
      new Date(incident.createdAt),
      false
    );
    incident.priorityScore = Math.min(100, p.score + 10); // Penalty bump for recurring failure
    incident.priorityBreakdown = p.breakdown;

    if (!incident.history) incident.history = [];
    incident.history.push({
      id: `HIST-${Date.now().toString(36)}`,
      incidentId: incident.id,
      previousStatus: prevStatus,
      newStatus: 'pending_verification',
      changedByName: options.reopenedByName,
      notes: `[REOPENED #${incident.reopenCount}] ${options.notes}`,
      evidencePhotoUrl: options.evidencePhotoUrl,
      createdAt: new Date().toISOString()
    });

    return incident;
  }

  // --- Sensor Events ---
  public async recordSensorEvent(eventData: Omit<SensorEvent, 'id' | 'createdAt' | 'label'>): Promise<SensorEvent> {
    const event: SensorEvent = {
      ...eventData,
      id: `SE-${Date.now().toString(36).toUpperCase()}`,
      label: 'Potential Road Impact — Unverified',
      createdAt: new Date().toISOString()
    };

    this.sensorEvents.unshift(event);

    // Look for nearby incidents to associate sensor impact
    const nearby = this.incidents.find(inc => {
      const dist = calculateDistanceMeters(inc.latitude, inc.longitude, event.latitude, event.longitude);
      return dist <= 50;
    });

    if (nearby) {
      event.associatedIncidentId = nearby.id;
      nearby.sensorDetectionCount += 1;
      const p = computePriorityScore(
        nearby.severity,
        nearby.reportCount,
        nearby.sensorDetectionCount,
        Boolean(nearby.primaryPhotoUrl),
        new Date(nearby.createdAt),
        nearby.status === 'resolved'
      );
      nearby.priorityScore = p.score;
      nearby.priorityBreakdown = p.breakdown;
    }

    return event;
  }

  public async getSensorEvents(): Promise<SensorEvent[]> {
    return this.sensorEvents;
  }

  // --- Road Segments & Analytics ---
  public async getRoadSegments(): Promise<RoadSegment[]> {
    return this.roadSegments;
  }

  public async getDashboardStats() {
    const total = this.incidents.length;
    const verified = this.incidents.filter(i => ['verified', 'assigned', 'repair_in_progress'].includes(i.status)).length;
    const resolved = this.incidents.filter(i => i.status === 'resolved').length;
    const critical = this.incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length;
    const highRiskZones = this.roadSegments.filter(s => s.riskScore > 70).length;

    // Categories breakdown
    const categoryCounts: Record<string, number> = {};
    for (const inc of this.incidents) {
      categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
    }

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const inc of this.incidents) {
      statusCounts[inc.status] = (statusCounts[inc.status] || 0) + 1;
    }

    // Severity breakdown
    const severityCounts: Record<string, number> = {};
    for (const inc of this.incidents) {
      severityCounts[inc.severity] = (severityCounts[inc.severity] || 0) + 1;
    }

    return {
      totalHazards: total,
      verifiedIncidents: verified,
      repairedRoads: resolved,
      criticalHazards: critical,
      highRiskZonesCount: highRiskZones,
      sensorDetectionsCount: this.sensorEvents.length,
      categoryCounts,
      statusCounts,
      severityCounts,
      isDemonstrationData: true,
      sampleArea: 'Kochi & Ernakulam Metropolitan Area, Kerala'
    };
  }
}

export const db = new DatabaseService();
