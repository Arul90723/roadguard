import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { db } from './db/index.js';
import { calculateRouteOptions } from './services/routing.js';
import { IncidentCategory, IncidentSeverity, IncidentStatus } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup file uploads directory for evidence photos
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage for camera captured photos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `hazard-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// 1. Health check endpoint (for Cloud Run & monitoring)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'RoadGuard API',
    isPostgresConnected: db.isUsingPostgres(),
    sampleArea: 'Kochi & Ernakulam Metropolitan Area, Kerala',
    activeMode: 'DEMO / Local Ready'
  });
});

// 2. Demo Users & Current Roles
app.get('/api/auth/demo-users', async (_req: Request, res: Response) => {
  const users = await db.getUsers();
  res.json({ users });
});

// 3. Incidents list
app.get('/api/incidents', async (req: Request, res: Response) => {
  try {
    const { category, severity, status, jurisdiction, search } = req.query;
    const incidents = await db.getIncidents({
      category: category as IncidentCategory,
      severity: severity as IncidentSeverity,
      status: status as IncidentStatus,
      jurisdiction: jurisdiction as string,
      search: search as string
    });
    res.json({ incidents, count: incidents.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch incidents', details: err.message });
  }
});

// 4. Incident details by ID
app.get('/api/incidents/:id', async (req: Request, res: Response) => {
  try {
    const incident = await db.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch incident details', details: err.message });
  }
});

// 5. Submit camera-based incident report
app.post('/api/incidents/report', upload.single('photo'), async (req: Request, res: Response) => {
  try {
    const {
      category,
      severity,
      description,
      latitude,
      longitude,
      locationName,
      userId,
      userName,
      accuracyMeters,
      photoBase64
    } = req.body;

    if (!category || !latitude || !longitude || !description) {
      return res.status(400).json({
        error: 'Missing required fields: category, latitude, longitude, and description are mandatory.'
      });
    }

    let photoUrl = '';
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    } else if (photoBase64 && typeof photoBase64 === 'string' && photoBase64.startsWith('data:image/')) {
      // Decode and save base64 camera frame
      const matches = photoBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `snap-${Date.now()}-${Math.round(Math.random() * 1e4)}.jpg`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);
        photoUrl = `/uploads/${filename}`;
      }
    }

    const result = await db.submitReport({
      category: category as IncidentCategory,
      severity: (severity as IncidentSeverity) || 'moderate',
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      locationName: locationName || undefined,
      photoUrl: photoUrl || undefined,
      userId: userId || undefined,
      userName: userName || undefined,
      accuracyMeters: accuracyMeters ? parseFloat(accuracyMeters) : undefined
    });

    res.status(201).json({
      success: true,
      isNewIncident: result.isNew,
      reportId: result.reportId,
      incident: result.incident,
      message: result.isNew
        ? 'Hazard reported and registered for verification.'
        : 'Report matched with existing nearby hazard and consolidated.'
    });
  } catch (err: any) {
    console.error('Report submission error:', err);
    res.status(500).json({ error: 'Failed to submit report', details: err.message });
  }
});

// 6. Authority status update workflow
app.patch('/api/incidents/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, notes, changedByName, evidencePhotoUrl, assignedTeam, targetRepairDate } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await db.updateIncidentStatus(req.params.id, status as IncidentStatus, {
      notes,
      changedByName,
      evidencePhotoUrl,
      assignedTeam,
      targetRepairDate
    });

    if (!updated) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ success: true, incident: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update incident status', details: err.message });
  }
});

// 7. Authority reopen incident
app.post('/api/incidents/:id/reopen', async (req: Request, res: Response) => {
  try {
    const { notes, reopenedByName, evidencePhotoUrl } = req.body;
    if (!notes) {
      return res.status(400).json({ error: 'Explanation notes are required to reopen an incident' });
    }

    const updated = await db.reopenIncident(req.params.id, {
      notes,
      reopenedByName: reopenedByName || 'Field Audit Officer',
      evidencePhotoUrl
    });

    if (!updated) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json({ success: true, incident: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reopen incident', details: err.message });
  }
});

// 8. Record smartphone motion sensor event
app.post('/api/sensor/event', async (req: Request, res: Response) => {
  try {
    const { journeyId, latitude, longitude, speedMps, peakAccelZ, peakNorm, confidence, sampleWindow } = req.body;

    if (!latitude || !longitude || peakAccelZ === undefined) {
      return res.status(400).json({ error: 'Missing sensor telemetry coordinates or acceleration values' });
    }

    const event = await db.recordSensorEvent({
      journeyId: journeyId || 'JOURNEY-DEFAULT',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      speedMps: speedMps ? parseFloat(speedMps) : undefined,
      peakAccelZ: parseFloat(peakAccelZ),
      peakNorm: parseFloat(peakNorm || peakAccelZ),
      confidence: confidence ? parseFloat(confidence) : 0.65,
      sampleWindow: sampleWindow || [],
      isCandidateOnly: true,
    });

    res.status(201).json({
      success: true,
      event,
      disclaimer: 'Recorded as "Potential Road Impact — Unverified". Not classified as a confirmed pothole until corroborated.'
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record sensor event', details: err.message });
  }
});

app.get('/api/sensor/events', async (_req: Request, res: Response) => {
  const events = await db.getSensorEvents();
  res.json({ events, count: events.length });
});

// 9. Route comparison
app.post('/api/routes/compare', async (req: Request, res: Response) => {
  try {
    const { origin, destination, vehicleType } = req.body;

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({ error: 'Origin and Destination coordinates [lat, lng] are required.' });
    }

    const result = await calculateRouteOptions(origin, destination, vehicleType);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to calculate route comparison', details: err.message });
  }
});

// 10. Road segments (Risk scores)
app.get('/api/road-segments', async (_req: Request, res: Response) => {
  const segments = await db.getRoadSegments();
  res.json({ segments });
});

// 11. Dashboard Analytics stats
app.get('/api/stats', async (_req: Request, res: Response) => {
  const stats = await db.getDashboardStats();
  res.json(stats);
});

// Serve frontend static build in production (Single-container deployment for Cloud Run)
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 RoadGuard Server listening on port ${PORT}`);
  console.log(`📍 Sample geographic zone: Kochi, Kerala, India`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});
