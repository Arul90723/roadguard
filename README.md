# 🛡️ RoadGuard — Smart Road Safety & Infrastructure Intelligence Platform

> **"Safer Roads. Smarter Routes. Faster Repairs."**  
> Community-powered hazard detection, camera-verified reporting, hazard-aware routing, and municipal maintenance dispatch.

---

## 🌟 1. Project Overview

RoadGuard is a community-driven road safety and infrastructure intelligence platform built to bridge the communication gap between daily commuters and municipal authorities. 

The platform operates on a closed-loop workflow:
```
DETECT ➔ REPORT ➔ VERIFY ➔ PRIORITISE ➔ ALERT ➔ REPAIR ➔ RE-VERIFY
```

### Three User Personas:
1. **Citizen / Traveller**: Discovers real-time road hazards, captures verified camera evidence, compares hazard-weighted safe routes, and logs vehicle motion impacts.
2. **Authority / Maintenance Official (PWD / KSEB / Water Authority)**: Triages incidents via an operations queue, reviews crowd corroboration, sets target repair deadlines, and dispatches field squads.
3. **Administrator**: Oversees statewide road safety KPIs, monitors recurring defect corridors, and audits repair certifications.

---

## ⚙️ 2. Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Dark navy aesthetic, high-contrast hazard color coding)
- **Icons**: Lucide React
- **Geospatial & Maps**: Leaflet + OpenStreetMap (CartoDB Dark Matter tiles)
- **Camera Capture**: Browser `MediaDevices.getUserMedia` (Strict live viewfinder, gallery upload disabled for integrity)
- **Motion Telemetry**: Browser `DeviceMotionEvent` (Accelerometer norm & gyroscope yaw velocity)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15+ with PostGIS spatial extension (with seamless zero-dependency In-Memory demo engine)
- **Routing**: OSRM (Open Source Routing Machine) driving engine + synthetic geometric corridor fallback
- **Containerization**: Multi-stage Dockerfile optimized for Google Cloud Run

---

## 🚀 3. Quickstart (Run Locally in Seconds)

RoadGuard is designed with a **Zero-Config Guarantee**: it requires **no external PostgreSQL or Firebase credentials** to run immediately.

### Prerequisites:
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Step 1: Install Dependencies
```bash
# From the project root
npm run install:all
```

### Step 2: Build Client & Server
```bash
npm run build
```

### Step 3: Start the Application
```bash
# Starts the unified server on port 5000 (serves backend API and client frontend)
npm start
```

Open your browser to:
👉 **[http://localhost:5000](http://localhost:5000)**

*(For active hot-reloading development, run `npm run dev:client` and `npm run dev:server` in separate terminals).*

---

## 🧪 4. End-to-End Demonstration Checklist

Follow this checklist during your hackathon demo:

- [ ] **Landing Page**: Observe the dark navy theme, live KPI statistics, and 7-stage workflow explanation.
- [ ] **Demo Mode Switcher**: In the top banner, switch between **Citizen (Rahul)**, **Authority (Er. Ananya Pillai)**, and **Admin**. Notice the active sample zone: *Kochi, Kerala*.
- [ ] **Interactive Road Map**:
  - Filter hazards by category (*Fallen Electrical Wire*, *Pothole*, *Waterlogging*).
  - Filter by severity (*Critical*, *High*, *Moderate*, *Low*).
  - Click on a marker to open the detailed modal.
  - Review the **Transparent Priority Score formula**: `Severity (35%) + Confidence (25%) + Age (20%) + Traffic (20%)`.
- [ ] **Critical Travel Hazard Warning**: Notice the top red banner warning about live snapped cables on MG Road with a direct emergency dialer button (*Call KSEB 1912*).
- [ ] **Camera-Based Incident Reporting**:
  - Navigate to **Report Hazard**.
  - Click **"Launch Camera Viewfinder"** to open your hardware camera.
  - Snap live photographic evidence. Note that gallery file upload is strictly disabled to prevent fabricated reports.
  - Submit the report. Notice automatic proximity deduplication.
- [ ] **Smartphone Motion Detection**:
  - Navigate to **Sensor Lab**.
  - Click **"Start Journey Recording"** to monitor accelerometer X/Y/Z and Gyroscope rotation rates.
  - Click **"Simulate Road Bump (Desktop Demo)"** to trigger an acceleration spike.
  - Notice the event logged honestly as: `Potential Road Impact — Unverified`.
- [ ] **Hazard-Aware Route Comparison**:
  - Navigate to **Safe Routes**.
  - Select Origin (*Edappally Toll Junction*) and Destination (*MG Road Shenoys*).
  - Select your vehicle profile (Hatchback, SUV, Two-Wheeler, EV).
  - Compare the **Safest** vs **Fastest** routes. Observe how the safest route detours around critical hazard zones.
- [ ] **Authority Portal**:
  - Switch role to **Authority**.
  - Navigate to **Authority Portal**.
  - View the high-priority triage queue and road segments risk scores.
  - Select an incident, change its lifecycle status (`Verified` ➔ `Assigned` ➔ `Resolved`), assign a crew (*PWD / KSEB*), and set a target repair date.
  - Test reopening a resolved defect if new reports arrive.

---

## 🗄️ 5. Database Schema & PostGIS Setup

When ready to connect a production **Google Cloud SQL PostgreSQL** instance:

### Step 1: Create Database with PostGIS
```sql
CREATE DATABASE roadguard;
\c roadguard;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Step 2: Run DDL Migrations
The complete migration script is located at:
📁 `server/src/db/schema.sql`

It provisions:
- `users`
- `incidents` (with PostGIS `GEOMETRY(Point, 4326)` & spatial GIST indexes)
- `incident_reports` (consolidates independent citizen reports)
- `incident_photos`
- `sensor_events` (stores buffered accelerometer windows)
- `incident_status_history` (audit trail)
- `maintenance_assignments` (dispatched work orders)
- `road_segments` (corridors with risk scores)
- `notification_records`

### Step 3: Configure Environment
Set `DATABASE_URL` in your `.env` file:
```env
DATABASE_URL=postgresql://roadguard_user:your_password@127.0.0.1:5432/roadguard
```

---

## ☁️ 6. Google Cloud Run Deployment

RoadGuard is engineered for zero-friction deployment to **Google Cloud Run**.

### Option A: Direct Deployment via Google Cloud SDK
```bash
# 1. Login to Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build and Deploy directly from source
gcloud run deploy roadguard \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080
```

### Option B: Build Container with Docker
```bash
# Build production multi-stage image
docker build -t gcr.io/YOUR_GCP_PROJECT_ID/roadguard:v1 .

# Push to Google Artifact Registry
docker push gcr.io/YOUR_GCP_PROJECT_ID/roadguard:v1

# Deploy image to Cloud Run
gcloud run deploy roadguard \
  --image gcr.io/YOUR_GCP_PROJECT_ID/roadguard:v1 \
  --region asia-south1 \
  --port 8080 \
  --allow-unauthenticated
```

### Cloud Run Health Check Endpoint:
```
GET /api/health
```

---

## 🔒 7. Security & Cloud Architecture Notes

1. **No Sensitive Keys in Frontend**: No Firebase admin secrets, service account JSONs, or database passwords exist in frontend client code.
2. **Billing Safety**: No billable cloud resources are provisioned automatically. All third-party adapters degrade gracefully to high-fidelity demo modes when cloud credentials are unconfigured.
3. **Evidence Authenticity**: Camera-only captures with client GPS stamps are treated as supporting evidence rather than unquestioned proof, undergoing spatial proximity validation on the backend.

---

## 👥 8. Kerala Demonstration Dataset

To provide immediate utility upon launching, the platform comes pre-seeded with 10 realistic road hazards located in **Kochi & Ernakulam Metropolitan Area, Kerala**:
- **INC-KL-001**: Critical live snapped electric line on MG Road Shenoys.
- **INC-KL-002**: Rim-damaging pothole cluster on Edappally Toll Junction (multiple citizen reports attached).
- **INC-KL-003**: Stormwater inundation at Vyttila Mobility Hub.
- **INC-KL-004**: Water main pipe burst at Palarivattom Bypass.
- **INC-KL-005**: Road cave-in at Marine Drive Promenade.
- **INC-KL-006**: Broken uncovered manhole near Kakkanad Infopark.
- **INC-KL-007**: Malfunctioning traffic signal at Kaloor Stadium.
- **INC-KL-008**: Fallen tree branch blocking Kadavanthra Road.
- **INC-KL-009**: Damaged streetlights on Thevara Ferry Road.
- **INC-KL-010**: Certified repaired bitumen patch on Seaport-Airport Road.

*(All seeded items are clearly labeled with `[DEMO]` tags).*

---

## 🏆 Hackathon MVP Status: 100% Functional & Demonstrable
Designed, built, and verified for the hackathon submission deadline.
