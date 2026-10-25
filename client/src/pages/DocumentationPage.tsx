import React from 'react';
import {
  FileText,
  Cloud,
  Database,
  ShieldCheck,
  Terminal,
  ExternalLink,
  CheckCircle2,
  Copy,
  AlertCircle
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cloudRunCommand = `gcloud run deploy roadguard \\
  --source . \\
  --platform managed \\
  --region asia-south1 \\
  --allow-unauthenticated \\
  --set-env-vars NODE_ENV=production`;

  const dockerBuildCommand = `docker build -t roadguard-app .
docker run -p 5000:5000 roadguard-app`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
          <FileText className="w-6 h-6 text-cyan-400" />
          <span>System Architecture & Google Cloud Run Setup</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step developer guide, database migration scripts, and Google Cloud production deployment instructions.
        </p>
      </div>

      {/* Cloud Run Single Container Guide */}
      <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
          <Cloud className="w-5 h-5" />
          <span>1. Google Cloud Run Deployment (Zero-Complexity Single Container)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          The application is engineered as a unified, production-ready container. The multi-stage <code className="text-cyan-400 font-mono">Dockerfile</code> builds the Vite React client into static assets, builds the Express TypeScript backend, and hosts both on Google Cloud Run with automated health monitoring.
        </p>

        <div className="relative bg-navy-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200">
          <button
            onClick={() => copyToClipboard(cloudRunCommand, 'cloudrun')}
            className="absolute top-3 right-3 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copiedKey === 'cloudrun' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'cloudrun' ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="overflow-x-auto">{cloudRunCommand}</pre>
        </div>

        <div className="relative bg-navy-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200">
          <button
            onClick={() => copyToClipboard(dockerBuildCommand, 'docker')}
            className="absolute top-3 right-3 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
          >
            {copiedKey === 'docker' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'docker' ? 'Copied' : 'Copy'}</span>
          </button>
          <pre className="overflow-x-auto">{dockerBuildCommand}</pre>
        </div>
      </div>

      {/* Google Cloud SQL (PostgreSQL with PostGIS) */}
      <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
          <Database className="w-5 h-5" />
          <span>2. Google Cloud SQL (PostgreSQL + PostGIS Extension)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          RoadGuard utilizes PostGIS for sub-second spatial queries, proximity deduplication (<code className="text-cyan-400 font-mono">ST_DWithin</code>), and route buffer corridor intersections.
        </p>

        <div className="bg-navy-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-slate-200">Database Provisioning Steps:</span>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-400 text-[11px]">
            <li>Create a Cloud SQL PostgreSQL 15+ instance in GCP Console (<code className="text-cyan-300">gcloud sql instances create roadguard-db</code>).</li>
            <li>Connect via psql and run: <code className="text-amber-300 font-mono">CREATE EXTENSION postgis;</code></li>
            <li>Execute the complete DDL schema located in <code className="text-cyan-300 font-mono">server/src/db/schema.sql</code>.</li>
            <li>Add <code className="text-cyan-300 font-mono">DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/roadguard</code> in Cloud Run environment variables or Cloud SQL Auth Proxy.</li>
          </ol>
        </div>

        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span><strong>Zero-Config Local Guarantee:</strong> When no <code className="font-mono">DATABASE_URL</code> is passed, RoadGuard automatically activates its zero-dependency In-Memory database with realistic Kochi, Kerala demo records.</span>
        </div>
      </div>

      {/* Authentication and Storage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase Authentication */}
        <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Firebase Authentication</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Firebase ID tokens are passed via <code className="text-cyan-400 font-mono">Authorization: Bearer &lt;token&gt;</code>. Server middleware verifies tokens and grants role-based access for Citizens, Authority Officers, and Admins.
          </p>
          <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400">
            For local hackathon testing, the <strong>Demo Mode Role Switcher</strong> allows seamless switching without external credentials.
          </div>
        </div>

        {/* Google Cloud Storage */}
        <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Cloud className="w-4 h-4" />
            <span>4. Google Cloud Storage (Bucket)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Incident photographs captured via the camera API are stored in Google Cloud Storage (<code className="text-cyan-400 font-mono">gs://roadguard-evidence-photos</code>) with public read access or signed URLs for evidence verification.
          </p>
          <div className="p-2.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-400">
            Local mode writes photos to the local <code className="text-cyan-400 font-mono">server/uploads</code> directory with automatic static serving.
          </div>
        </div>
      </div>

      {/* Health Check Endpoint */}
      <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <span className="font-bold text-white block">Active Health Check Endpoint:</span>
          <code className="text-cyan-400 font-mono text-[11px]">GET http://localhost:5000/api/health</code>
        </div>
        <a
          href="/api/health"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 font-semibold text-xs"
        >
          <span>Test Live Endpoint</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
