# 🛡️ RoadGuard — Smart Road Safety & Infrastructure Intelligence Platform

[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud%20Run-Live-4285F4?logo=googlecloud&logoColor=white)](https://roadguard-983953515631.asia-south1.run.app/)
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Platform-34A853?logo=googlemaps&logoColor=white)](https://roadguard-983953515631.asia-south1.run.app/)
[![Firebase Auth](https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=black)](https://roadguard-983953515631.asia-south1.run.app/)
[![PostgreSQL PostGIS](https://img.shields.io/badge/Cloud%20SQL-PostgreSQL%20%2B%20PostGIS-336791?logo=postgresql&logoColor=white)](https://roadguard-983953515631.asia-south1.run.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **"Safer Roads. Smarter Routes. Faster Repairs."**  
> Community-powered hazard detection, camera-verified reporting, hazard-aware routing, and municipal maintenance dispatch.

---

## 🌐 Live Production Deployment
* **Live Application**: [https://roadguard-983953515631.asia-south1.run.app/](https://roadguard-983953515631.asia-south1.run.app/)
* **Health Check & Cloud Telemetry**: [https://roadguard-983953515631.asia-south1.run.app/api/health](https://roadguard-983953515631.asia-south1.run.app/api/health)
* **Sample Geospatial Region**: Kochi & Ernakulam Metropolitan Area, Kerala, India

---

## 🌟 1. Project Overview

RoadGuard is a community-driven road safety and infrastructure intelligence platform built to bridge the communication gap between daily commuters and municipal authorities. 

The platform operates on a closed-loop workflow:
```
DETECT ➔ REPORT ➔ VERIFY ➔ PRIORITISE ➔ ALERT ➔ REPAIR ➔ RE-VERIFY
```

### Three User Personas:
1. **Citizen / Traveller**: Discovers real-time road hazards, captures camera evidence with locked GPS, compares hazard-weighted safe routes, and logs vehicle motion impacts.
2. **Authority / Maintenance Official (PWD / KSEB / Water Authority)**: Triages incidents via an operations queue, reviews crowd corroboration, sets target repair deadlines, and dispatches field squads.
3. **Administrator**: Oversees statewide road safety KPIs, monitors recurring defect corridors, and audits repair certifications.

---

## ⚙️ 2. Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS (Dark navy aesthetic, high-contrast hazard color coding)
- **Icons**: Lucide React
- **Geospatial & Maps**: Google Maps Platform JavaScript API (Dark Navy Night Mode, Satellite/Hybrid view, and Live Google Traffic Layer)
- **Camera Capture**: Browser `MediaDevices.getUserMedia` (Strict live viewfinder, gallery upload disabled for integrity)
- **Motion Telemetry**: Browser `DeviceMotionEvent` (Accelerometer vector norm & gyroscope yaw velocity)
- **Authentication**: Firebase Authentication (Google Sign-In + Email/Password + Server-side Firebase Admin SDK verification)
- **Backend**: Node.js + Express + TypeScript
- **Database**: Google Cloud SQL (PostgreSQL 15 + PostGIS spatial extension) with built-in zero-dependency In-Memory demo engine fallback
- **Object Storage**: Google Cloud Storage (`gs://roadguard-photos-512703`)
- **Routing**: OSRM driving engine + synthetic geometric corridor fallback
- **Containerization**: Multi-stage Dockerfile optimized for Google Cloud Run

---

## 🚀 3. Quickstart (Run Locally in Seconds)

RoadGuard is designed with a **Zero-Config Guarantee**: it requires **no external credentials** to run immediately on localhost.

### Prerequisites:
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Build Client & Server
```bash
npm run build
```

### Step 3: Start the Application
```bash
npm start
```

Open your browser to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 4. End-to-End Demonstration Checklist

Follow this checklist during your hackathon demo:

- [ ] **Landing Page**: Observe the dark navy theme, live KPI statistics, and 7-stage workflow explanation.
- [ ] **Firebase Authentication**: Click **"Sign In"** in the top navigation bar to authenticate with a real Google account via Firebase, or use the instant demo role switcher.
- [ ] **Google Maps Hazard Radar**:
  - Open **"Road Map"** to interact with Google Maps.
  - Toggle between **Map** and **Satellite** views.
  - Click **"Live Google Traffic"** to display real-time congestion overlays.
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

The complete PostgreSQL + PostGIS DDL migration script is located at:
📁 [`server/src/db/schema.sql`](server/src/db/schema.sql)

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

---

## ☁️ 6. Google Cloud Run Deployment

RoadGuard is containerized for zero-friction deployment to Google Cloud Run.

```bash
# Deploy directly from repository root
gcloud run deploy roadguard \
  --source . \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 🔒 7. Security & Cloud Architecture Notes

1. **Zero-Trust Token Verification**: Every administrative action is validated server-side on Google Cloud Run using the Firebase Admin SDK.
2. **Billing Safety**: No billable cloud resources are provisioned automatically.
3. **Evidence Authenticity**: Camera-only captures with client GPS stamps prevent forged reports, undergoing spatial proximity validation on the backend.

---

## 👥 8. Kerala Demonstration Dataset

Pre-seeded with 10 realistic road hazards located in **Kochi & Ernakulam Metropolitan Area, Kerala**:
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

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
