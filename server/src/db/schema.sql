-- RoadGuard Database Schema
-- Compatible with PostgreSQL 14+ and PostGIS extension

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('citizen', 'authority', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_severity AS ENUM ('low', 'moderate', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'candidate',
        'pending_verification',
        'verified',
        'assigned',
        'repair_in_progress',
        'resolved'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM (
        'pothole',
        'waterlogging',
        'pipeline_leakage',
        'fallen_electrical_wire',
        'damaged_streetlight',
        'broken_manhole',
        'fallen_tree',
        'damaged_traffic_signal',
        'road_collapse',
        'other_road_obstruction'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY, -- Firebase UID or internal UUID
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'citizen',
    jurisdiction VARCHAR(255), -- E.g. 'Kochi Municipal Corp', 'Ernakulam Central'
    department VARCHAR(255), -- E.g. 'PWD', 'KSEB', 'KWA'
    phone VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Consolidated Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY, -- E.g. 'INC-2026-001'
    category incident_category NOT NULL,
    severity incident_severity NOT NULL DEFAULT 'moderate',
    status incident_status NOT NULL DEFAULT 'pending_verification',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    location_name VARCHAR(255),
    jurisdiction VARCHAR(255) NOT NULL DEFAULT 'Kochi Municipal Corp',
    priority_score DOUBLE PRECISION NOT NULL DEFAULT 50.0,
    confidence_score DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    report_count INT NOT NULL DEFAULT 1,
    sensor_detection_count INT NOT NULL DEFAULT 0,
    primary_photo_url TEXT,
    reported_by_user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    assigned_team VARCHAR(255),
    target_repair_date DATE,
    reopen_count INT NOT NULL DEFAULT 0,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Individual Incident Reports (Preserves multiple independent citizen reports)
CREATE TABLE IF NOT EXISTS incident_reports (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    category incident_category NOT NULL,
    severity incident_severity NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    accuracy_meters DOUBLE PRECISION,
    photo_url TEXT,
    device_info JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Incident Photos Evidence
CREATE TABLE IF NOT EXISTS incident_photos (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    report_id VARCHAR(64) REFERENCES incident_reports(id) ON DELETE SET NULL,
    photo_url TEXT NOT NULL,
    storage_path TEXT,
    caption TEXT,
    photo_type VARCHAR(32) NOT NULL DEFAULT 'citizen_report', -- 'citizen_report', 'authority_inspection', 'repair_proof'
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sensor Events (Smartphone Accelerometer / Gyroscope readings)
CREATE TABLE IF NOT EXISTS sensor_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    journey_id VARCHAR(64),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326),
    speed_mps DOUBLE PRECISION,
    peak_accel_z DOUBLE PRECISION NOT NULL, -- Peak vertical acceleration in m/s²
    peak_norm DOUBLE PRECISION NOT NULL,    -- Vector magnitude ||a||
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    sample_window_json JSONB,               -- Window of ±1.5s readings
    associated_incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE SET NULL,
    is_candidate_only BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Incident Status Audit History
CREATE TABLE IF NOT EXISTS incident_status_history (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    previous_status incident_status,
    new_status incident_status NOT NULL,
    changed_by_user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    evidence_photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Maintenance Assignments
CREATE TABLE IF NOT EXISTS maintenance_assignments (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    assigned_agency VARCHAR(255) NOT NULL, -- E.g. 'Kerala PWD District Division'
    assigned_team_leader VARCHAR(255),
    assigned_by_user_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    target_date DATE NOT NULL,
    priority_level VARCHAR(32) NOT NULL DEFAULT 'normal',
    work_order_number VARCHAR(64),
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Road Segments (Risk scoring & Heatmap)
CREATE TABLE IF NOT EXISTS road_segments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    jurisdiction VARCHAR(255) NOT NULL,
    start_lat DOUBLE PRECISION NOT NULL,
    start_lng DOUBLE PRECISION NOT NULL,
    end_lat DOUBLE PRECISION NOT NULL,
    end_lng DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(LineString, 4326),
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 10.0, -- 0 - 100
    active_hazard_count INT NOT NULL DEFAULT 0,
    speed_limit_kmh INT DEFAULT 50,
    road_type VARCHAR(64) DEFAULT 'arterial',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Notification Records
CREATE TABLE IF NOT EXISTS notification_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial and Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_geom ON incidents USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents (category);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents (severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_jurisdiction ON incidents (jurisdiction);

CREATE INDEX IF NOT EXISTS idx_incident_reports_incident ON incident_reports (incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_geom ON incident_reports USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_sensor_events_geom ON sensor_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_road_segments_geom ON road_segments USING GIST (geom);
