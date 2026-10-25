import React, { useState } from 'react';
import {
  FileText,
  Cloud,
  Database,
  ShieldCheck,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Copy,
  AlertCircle,
  Server,
  Layers,
  Code2,
  Radio
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cloudRunDeploy = `gcloud run deploy roadguard \\
  --source . \\
  --platform managed \\
  --region asia-south1 \\
  --allow-unauthenticated \\
  --set-env-vars NODE_ENV=production,DATABASE_URL="postgresql://postgres:Star%4090723@10.29.176.3:5432/roadguard"`;

  const dockerBuildCommand = `docker build -t roadguard-app .
docker run -p 5000:5000 roadguard-app`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                GCP Enterprise Stack
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Production Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FileText className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              <span>System Architecture & Deployment Guide</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Specifications for Google Cloud Run containerization, Cloud SQL PostGIS geospatial database, and Firebase Authentication.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-navy-950/80 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Region</div>
              <div className="text-xs font-bold text-cyan-400">asia-south1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Run Single Container Architecture */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm">
          <Cloud className="w-5 h-5" />
          <span>1. Google Cloud Run (Single-Container Microservice)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          RoadGuard utilizes a multi-stage Docker build that compiles the modern Tailwind + React client into production bundles and executes the Express + TypeScript PostGIS backend within a unified lightweight container.
        </p>

        <div className="relative bg-navy-950/90 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200">
          <button
            onClick={() => copyToClipboard(cloudRunDeploy, 'cloudrun')}
            className="absolute top-3 right-3 text-slate-400 hover:text-white flex items-center gap-1 text-[11px] glass-button-secondary px-2.5 py-1 rounded-lg"
          >
            {copiedKey === 'cloudrun' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'cloudrun' ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="overflow-x-auto pr-16">{cloudRunDeploy}</pre>
        </div>
      </div>

      {/* PostGIS Database Engine */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800/80 shadow-xl">
        <div className="flex items-center gap-2.5 text-teal-400 font-bold text-sm">
          <Database className="w-5 h-5" />
          <span>2. Google Cloud SQL (PostgreSQL 15 + PostGIS Spatial Engine)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Spatial deduplication queries run directly on the database engine using PostGIS indexing (<code className="text-cyan-400 font-mono">ST_DWithin(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 60)</code>) to merge citizen reports within a 60-meter radius automatically.
        </p>

        <div className="bg-navy-950/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-white font-mono uppercase text-[11px]">Database Specs & Migration Schema</span>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-400 text-[11px] font-mono">
            <li>Cloud SQL Instance: <code className="text-cyan-300">roadguard-db</code> (PostgreSQL 15, private VPC IP <code className="text-slate-300">10.29.176.3</code>)</li>
            <li>PostGIS extension enabled: <code className="text-emerald-300">CREATE EXTENSION postgis;</code></li>
            <li>DDL schema path: <code className="text-cyan-300">server/src/db/schema.sql</code> (Incidents, Reports, Audits, Road Segments, Sensor Events)</li>
            <li>Spatial Indexes: R-Tree GiST indexes on all geographic geometry columns for sub-millisecond range queries</li>
          </ol>
        </div>
      </div>

      {/* Firebase & GCS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase Authentication */}
        <div className="glass-panel p-5 rounded-3xl space-y-3 border border-slate-800/80 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>3. Firebase Authentication</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Integrated with Google Sign-In and Email/Password. Client acquires JWT tokens verified by Firebase Admin SDK on Express middleware (<code className="text-cyan-400 font-mono">auth.ts</code>) with role-based claim enforcement.
          </p>
          <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Project: <span className="text-cyan-300">roadguard-512703</span> • Client App ID: <span className="text-slate-300">1:983953515631:web:...</span>
          </div>
        </div>

        {/* Google Cloud Storage */}
        <div className="glass-panel p-5 rounded-3xl space-y-3 border border-slate-800/80 shadow-xl">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Server className="w-5 h-5" />
            <span>4. Google Cloud Storage (Bucket)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Photographic proof captured via browser camera hardware is compressed, timestamped, and uploaded to bucket <code className="text-cyan-400 font-mono">gs://roadguard-photos-512703</code> with immutable SHA-256 integrity hashes.
          </p>
          <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
            Bucket URI: <span className="text-cyan-300">gs://roadguard-photos-512703</span>
          </div>
        </div>
      </div>

      {/* Live Health Endpoint Card */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white font-mono">System Health Monitor</span>
          </div>
          <code className="text-cyan-400 font-mono text-[11px] block">GET /api/health</code>
        </div>
        <a
          href="/api/health"
          target="_blank"
          rel="noreferrer"
          className="glass-button-primary px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
        >
          <span>Probe Live Health JSON</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
export default DocumentationPage;
