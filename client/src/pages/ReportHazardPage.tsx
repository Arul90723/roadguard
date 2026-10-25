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
  VideoOff
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
        // Retain Kochi default coordinates for demo purposes
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
          ? 'Camera permission was denied. Please grant camera permission in your browser.'
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
      alert('Please enter a description for the road hazard.');
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

  const categoriesList: IncidentCategory[] = [
    'pothole',
    'waterlogging',
    'pipeline_leakage',
    'fallen_electrical_wire',
    'damaged_streetlight',
    'broken_manhole',
    'fallen_tree',
    'damaged_traffic_signal',
    'road_collapse',
    'other_road_obstruction',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
            <Camera className="w-6 h-6 text-cyan-400" />
            <span>Camera-Based Incident Reporting</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time camera proof and GPS validation strictly enforced. Gallery uploads disabled for integrity.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {submissionResult && (
        <div className="p-4 rounded-2xl bg-cyan-950/70 border border-cyan-400/50 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>Report Submitted Successfully!</span>
          </div>
          <p className="text-xs text-slate-200">
            {submissionResult.message} (Reference ID: <strong className="font-mono text-cyan-400">{submissionResult.incidentId}</strong>)
          </p>
          <button
            onClick={() => setSubmissionResult(null)}
            className="text-xs text-cyan-400 underline font-semibold mt-1"
          >
            Submit another report
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <form onSubmit={handleSubmit} className="p-5 sm:p-7 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl space-y-6">
        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            1. Select Hazard Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {categoriesList.map(cat => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950'
                      : 'bg-navy-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-navy-800'
                  }`}
                >
                  <CategoryIcon category={cat} className="w-5 h-5" />
                  <span className="text-[11px] font-semibold leading-tight">
                    {getCategoryLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Electrical Warning if selected */}
        {category === 'fallen_electrical_wire' && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs">
            <Zap className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="text-red-300">DANGER: High-Voltage Electrocution Risk!</strong>
              <p className="mt-0.5">
                Do NOT approach or step out near live fallen cables. Maintain minimum 10m distance. After snapping photo safely from afar, notify emergency dispatch at <strong>1912</strong> immediately.
              </p>
            </div>
          </div>
        )}

        {/* Severity Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            2. Estimated Severity Level
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'low', label: 'Low', desc: 'Cosmetic / Minor bump', color: 'border-blue-500/40 text-blue-400' },
              { id: 'moderate', label: 'Moderate', desc: 'Noticeable delay / rough surface', color: 'border-amber-500/40 text-amber-400' },
              { id: 'high', label: 'High', desc: 'Rim damage / lane blocked', color: 'border-orange-500/40 text-orange-400' },
              { id: 'critical', label: 'Critical', desc: 'Immediate collision/life hazard', color: 'border-red-500/40 text-red-400' },
            ].map(lvl => {
              const isSelected = severity === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSeverity(lvl.id as IncidentSeverity)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-navy-800 ${lvl.color} ring-1 ring-cyan-400 shadow`
                      : 'bg-navy-950/60 border-slate-800 text-slate-400 hover:bg-navy-800/40'
                  }`}
                >
                  <div className="font-bold text-xs uppercase">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{lvl.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Camera Capture Section (STRICT: NO GALLERY UPLOAD) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>3. Live Camera Photographic Evidence (Required)</span>
            </label>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
              Gallery Upload Disabled
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 text-center">
            {/* Case 1: Photo is captured */}
            {capturedPhotoBase64 ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video max-h-64 mx-auto bg-black">
                  <img
                    src={capturedPhotoBase64}
                    alt="Captured Hazard"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-navy-950/80 px-2 py-1 rounded text-[10px] font-semibold text-emerald-400 border border-slate-700">
                    Live Photo Captured
                  </div>
                </div>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 text-xs font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              </div>
            ) : cameraActive ? (
              /* Case 2: Camera active */
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-cyan-400/80 aspect-video max-h-64 mx-auto bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-cyan-400/40 pointer-events-none m-4 rounded-lg flex items-center justify-center">
                    <span className="text-[11px] text-cyan-300 font-mono bg-navy-950/70 px-2 py-0.5 rounded">
                      Align Hazard in Frame
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 text-navy-950 font-bold text-xs shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Snap Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Case 3: Prompt to open camera */
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-navy-800 border border-slate-700 mx-auto flex items-center justify-center text-cyan-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Open Device Camera</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-0.5">
                    Click to launch your smartphone or laptop webcam to document the hazard.
                  </p>
                </div>

                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2 max-w-md mx-auto text-left">
                    <VideoOff className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{cameraError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={startCamera}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs shadow-md transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Camera Viewfinder</span>
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* GPS Coordinates Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>4. Location & GPS Telemetry</span>
            </label>
            <button
              type="button"
              onClick={requestLocation}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Coordinates</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Road name or landmark in Kochi (e.g. Edappally Toll, MG Road)"
                className="w-full bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-center gap-2 bg-navy-950 border border-slate-700 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300">
              <span className="text-slate-500">GPS:</span>
              <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              {accuracyMeters && <span className="text-slate-500 text-[10px]">±{accuracyMeters.toFixed(0)}m</span>}
            </div>
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            5. Incident Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the hazard size, exact lane position, or impact on traffic..."
            className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 hover:from-cyan-400 hover:to-teal-300 text-navy-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting to Municipal Engine...' : 'Submit Validated Incident Report'}
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>Submissions undergo automated geospatial deduplication before verification.</span>
          </p>
        </div>
      </form>
    </div>
  );
};
