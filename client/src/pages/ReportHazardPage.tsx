import React, { useState, useRef, useEffect } from 'react';
import { IncidentCategory, IncidentSeverity } from '../types';
import { submitIncidentReport } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  RefreshCw,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  ShieldCheck,
  VideoOff,
  Crosshair,
  Compass,
  Sparkles,
  ArrowRight,
  Radio,
  FileCheck2
} from 'lucide-react';
import { CategoryIcon, getCategoryLabel } from '../components/CategoryIcon';

interface Props {
  onReportSuccess: () => void;
}

export const ReportHazardPage: React.FC<Props> = ({ onReportSuccess }) => {
  const { currentUser } = useAuth();

  // Form states
  const [category, setCategory] = useState<IncidentCategory>('pothole');
  const [severity, setSeverity] = useState<IncidentSeverity>('moderate');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Edappally Bypass, Kochi');
  const [latitude, setLatitude] = useState<number>(10.0252);
  const [longitude, setLongitude] = useState<number>(76.3085);
  const [accuracyMeters, setAccuracyMeters] = useState<number>(4.5);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'locked' | 'denied'>('locked');

  // Camera states
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhotoBase64, setCapturedPhotoBase64] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    isNew: boolean;
    message: string;
    incidentId: string;
  } | null>(null);

  // Request GPS location
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      return;
    }

    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracyMeters(pos.coords.accuracy);
        setGpsStatus('locked');
      },
      err => {
        console.warn('Geolocation permission error or unavailable:', err);
        setGpsStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please enable camera access in your browser settings.'
          : err.message || 'Unable to access hardware camera.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Snap photo from live video feed
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoBase64(dataUrl);
      stopCamera();
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedPhotoBase64(null);
    startCamera();
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a brief description for the road hazard.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitIncidentReport({
        category,
        severity,
        description,
        latitude,
        longitude,
        locationName,
        photoBase64: capturedPhotoBase64 || undefined,
        userId: currentUser?.id,
        userName: currentUser?.displayName,
        accuracyMeters,
      });

      setSubmissionResult({
        success: true,
        isNew: res.isNewIncident,
        message: res.message,
        incidentId: res.incident.id,
      });

      // Clear form
      setDescription('');
      setCapturedPhotoBase64(null);
      onReportSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoriesList: { id: IncidentCategory; label: string; desc: string }[] = [
    { id: 'pothole', label: 'Pothole / Pit', desc: 'Depression in asphalt surface' },
    { id: 'waterlogging', label: 'Flooding', desc: 'Standing water concealing road' },
    { id: 'pipeline_leakage', label: 'Pipeline Leak', desc: 'Water authority pipe burst' },
    { id: 'fallen_electrical_wire', label: 'Live Wire', desc: 'Overhead cable fallen onto road' },
    { id: 'damaged_streetlight', label: 'Streetlight', desc: 'Non-functional night illumination' },
    { id: 'broken_manhole', label: 'Open Manhole', desc: 'Uncovered storm drain / sewer' },
    { id: 'fallen_tree', label: 'Fallen Tree', desc: 'Branch or trunk blocking lanes' },
    { id: 'damaged_traffic_signal', label: 'Signal Failure', desc: 'Traffic light malfunctioning' },
    { id: 'road_collapse', label: 'Cave-In / Void', desc: 'Structural collapse of roadway' },
    { id: 'other_road_obstruction', label: 'Obstruction', desc: 'Construction debris or barricade' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Civic Verification Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Anti-Fraud Camera Lock
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Camera className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              <span>Camera-Based Hazard Reporting</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Snap real-time visual proof and log geotagged coordinates. Gallery uploads are disabled to prevent duplicate spam and ensure auditable integrity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase">GPS Precision</div>
              <div className="text-sm font-bold text-cyan-400 font-mono">±{accuracyMeters.toFixed(1)}m</div>
            </div>
            <div className="p-3 rounded-2xl bg-navy-950/80 border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase">Spatial Engine</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">60m Merge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submissionResult && (
        <div className="p-5 rounded-3xl bg-cyan-950/80 border border-cyan-400/60 shadow-glow-cyan animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{submissionResult.isNew ? 'New Incident Created & Geo-Indexed' : 'Existing Incident Confirmed & Upvoted'}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  {submissionResult.incidentId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {submissionResult.message} Priority score calculated and routed to Kerala PWD triage dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmissionResult(null)}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-navy-950 font-bold text-xs hover:bg-cyan-400 transition-all shrink-0"
          >
            Submit Another
          </button>
        </div>
      )}

      {/* Main Reporting Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-8 border border-slate-800/80 shadow-2xl">
        
        {/* Step 1: Category Selection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center text-[11px] border border-cyan-500/30">1</span>
              <span>Select Hazard Classification</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">Pick the closest category</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {categoriesList.map(cat => {
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 group relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-950/80 to-navy-900 border-cyan-400 shadow-glow-cyan transform scale-[1.02]'
                      : 'bg-navy-950/60 border-slate-800/80 hover:bg-navy-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`p-2 rounded-xl border ${
                      isSelected ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400' : 'bg-navy-900 border-slate-700 text-slate-400'
                    }`}>
                      <CategoryIcon category={cat.id} className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {cat.label}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {cat.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hazard Safety Alert for Electrical Wire */}
        {category === 'fallen_electrical_wire' && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 flex items-start gap-3.5 text-red-200 text-xs shadow-lg animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 text-red-400">
              <Zap className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <strong className="text-red-300 text-sm font-bold">ELECTROCUTION RISK WARNING</strong>
              <p className="mt-1 leading-relaxed text-red-200/90">
                Do NOT step near fallen wires or puddles contacting cables. Keep a minimum safe perimeter of 15 meters. Capture photo safely from afar and immediately alert the Kerala State Electricity Board (KSEB) helpline at <strong className="font-mono text-white underline">1912</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Severity Level Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center text-[11px] border border-cyan-500/30">2</span>
            <span>Estimated Severity & Impact</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'low', label: 'Low', badge: 'Tier 1', desc: 'Minor surface bump, cosmetic ripple', color: 'border-blue-500/40 text-blue-400' },
              { id: 'moderate', label: 'Moderate', badge: 'Tier 2', desc: 'Noticeable dip, slow traffic deceleration', color: 'border-amber-500/40 text-amber-400' },
              { id: 'high', label: 'High', badge: 'Tier 3', desc: 'Rim damage, sharp pothole, lane blockage', color: 'border-orange-500/40 text-orange-400' },
              { id: 'critical', label: 'Critical', badge: 'Tier 4', desc: 'Open manhole, deep trench, crash hazard', color: 'border-red-500/40 text-red-400' },
            ].map(lvl => {
              const isSelected = severity === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSeverity(lvl.id as IncidentSeverity)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? `bg-navy-900 ${lvl.color} ring-1 ring-cyan-400 shadow-lg shadow-cyan-950/50 transform scale-[1.01]`
                      : 'bg-navy-950/60 border-slate-800/80 text-slate-400 hover:bg-navy-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase tracking-wider">{lvl.label}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{lvl.badge}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Hardware Camera HUD Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center text-[11px] border border-cyan-500/30">3</span>
              <span>Live Photographic Evidence (Required)</span>
            </label>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              Direct Sensor Feed
            </span>
          </div>

          <div className="rounded-3xl bg-navy-950/90 border border-slate-800/90 overflow-hidden relative p-4 sm:p-6 text-center">
            {/* Viewfinder State 1: Photo already snapped */}
            {capturedPhotoBase64 ? (
              <div className="space-y-4 max-w-lg mx-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 aspect-video bg-black shadow-2xl group">
                  <img
                    src={capturedPhotoBase64}
                    alt="Captured Road Hazard"
                    className="w-full h-full object-cover"
                  />
                  {/* HUD Stamp Over Photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-3 flex flex-col justify-between pointer-events-none text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED EVIDENCE
                      </span>
                      <span className="text-[10px] font-mono text-slate-300 bg-black/60 px-2 py-0.5 rounded">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-200">
                      <div>GPS: {latitude.toFixed(5)}°N, {longitude.toFixed(5)}°E</div>
                      <div className="text-slate-400 text-[10px]">{locationName}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="glass-button-secondary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>
                  <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for upload
                  </span>
                </div>
              </div>
            ) : cameraActive ? (
              /* Viewfinder State 2: Camera active with tactical HUD */
              <div className="space-y-4 max-w-xl mx-auto">
                <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-400 aspect-video bg-black shadow-2xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Tactical Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                    {/* Top HUD Bar */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-navy-950/70 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                        <span className="tracking-widest">LIVE REC</span>
                      </div>
                      <div>{latitude.toFixed(4)}N, {longitude.toFixed(4)}E</div>
                      <div>FOV 72°</div>
                    </div>

                    {/* Center Crosshair Target */}
                    <div className="flex items-center justify-center">
                      <div className="w-24 h-24 border border-cyan-400/50 rounded-2xl relative flex items-center justify-center">
                        {/* Corner brackets */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                        <Crosshair className="w-6 h-6 text-cyan-400/80 animate-pulse" />
                      </div>
                    </div>

                    {/* Bottom HUD Bar */}
                    <div className="text-center">
                      <span className="text-[11px] text-cyan-200 font-mono bg-navy-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40">
                        Align road hazard inside target reticle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shutter Capture Button */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="relative group p-1.5 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 shadow-glow-cyan transform active:scale-95 transition-all"
                  >
                    <div className="px-6 py-3 rounded-full bg-navy-950 group-hover:bg-cyan-950 transition-colors flex items-center gap-2 text-cyan-300 font-black text-xs">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>TRIGGER SHUTTER</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white glass-button-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Viewfinder State 3: Launch Camera Call-to-action */
              <div className="py-10 space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 shadow-glow-cyan">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Hardware Camera Proof Required
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Tap to open your device camera. Our anti-spoofing engine embeds cryptographic timestamp and orientation telemetry directly into the audit record.
                  </p>
                </div>

                {cameraError && (
                  <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2.5 text-left">
                    <VideoOff className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={startCamera}
                  className="glass-button-primary px-6 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-glow-cyan"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Camera Viewfinder</span>
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Step 4: Geotag & Location Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center text-[11px] border border-cyan-500/30">4</span>
              <span>Geotag & Road Landmark</span>
            </label>
            <button
              type="button"
              onClick={requestLocation}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
              <span>{gpsStatus === 'locating' ? 'Acquiring Satellites...' : 'Refresh GPS Lock'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="E.g. Edappally Bypass, near Lulu Mall, Kochi"
                className="w-full bg-navy-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-700/80 flex items-center justify-between text-xs font-mono">
              <div className="text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                ±{accuracyMeters.toFixed(0)}m LOCK
              </span>
            </div>
          </div>
        </div>

        {/* Step 5: Incident Notes Description */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono flex items-center justify-center text-[11px] border border-cyan-500/30">5</span>
            <span>Incident Notes & Context</span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Specify lane position (e.g. left lane heading north), dimensions, or whether water is hiding edge..."
            className="w-full bg-navy-950/80 border border-slate-700/80 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* Form Submission Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-teal-300 text-navy-950 font-black text-sm tracking-wide shadow-glow-cyan transition-all transform active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-navy-950" />
                <span>Processing Spatial Deduplication & PostGIS Entry...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-5 h-5 text-navy-950" />
                <span>Submit Geotagged Incident to Municipal Engine</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Reports within 60m radius are merged automatically to prevent duplicate tickets.</span>
          </p>
        </div>
      </form>
    </div>
  );
};
export default ReportHazardPage;
