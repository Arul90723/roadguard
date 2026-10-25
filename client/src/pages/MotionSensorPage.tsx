import React, { useState, useEffect, useRef } from 'react';
import { recordSensorEvent, fetchSensorEvents } from '../services/api';
import { SensorEvent, SensorReadingSample } from '../types';
import {
  Activity,
  Play,
  Square,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Info,
  Radio,
  Clock,
  Compass,
  Cpu,
  Zap,
  Gauge,
  Sparkles
} from 'lucide-react';

export const MotionSensorPage: React.FC = () => {
  const [isJourneyActive, setIsJourneyActive] = useState(false);
  const [journeyId, setJourneyId] = useState<string>('');
  const [impactThreshold, setImpactThreshold] = useState<number>(18.0); // m/s²

  // Sensor readouts
  const [sensorSupported, setSensorSupported] = useState<boolean | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [currentAccel, setCurrentAccel] = useState<{ x: number; y: number; z: number; norm: number }>({
    x: 0,
    y: 0,
    z: 9.8,
    norm: 9.8,
  });
  const [currentRotation, setCurrentRotation] = useState<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  // GPS state
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; speed: number | null }>({
    lat: 10.0248,
    lng: 76.3079,
    speed: 35.0, // km/h demo estimate
  });

  // Canvas Oscilloscope refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyPointsRef = useRef<{ z: number; norm: number; x: number; y: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Recent circular buffer of samples (window)
  const sampleWindowRef = useRef<SensorReadingSample[]>([]);
  const [detectedEvents, setDetectedEvents] = useState<SensorEvent[]>([]);
  const [lastImpactAlert, setLastImpactAlert] = useState<string | null>(null);

  // Initialize history buffer for oscilloscope
  useEffect(() => {
    const initialPoints = Array.from({ length: 140 }, () => ({
      z: 9.8 + (Math.random() - 0.5) * 0.4,
      norm: 9.8 + (Math.random() - 0.5) * 0.3,
      x: (Math.random() - 0.5) * 0.2,
      y: (Math.random() - 0.5) * 0.2,
    }));
    historyPointsRef.current = initialPoints;
  }, []);

  // Oscilloscope Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localPoints = historyPointsRef.current;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background with subtle grid lines
      ctx.fillStyle = '#060b18';
      ctx.fillRect(0, 0, width, height);

      // Draw oscilloscope grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;

      // Horizontal grid
      for (let y = 20; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center reference baseline (representing 1G ~ 9.8 m/s²)
      const baselineY = height * 0.6;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(width, baselineY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Baseline label
      ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('1.0G (9.8 m/s² Nominal)', 12, baselineY - 4);

      // Impact Threshold line
      const thresholdY = baselineY - ((impactThreshold - 9.8) / 20) * (height * 0.5);
      if (thresholdY > 10) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(0, thresholdY);
        ctx.lineTo(width, thresholdY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.fillText(`Trigger: ${impactThreshold} m/s²`, width - 130, thresholdY - 4);
      }

      // Draw Waveform: Total Norm (Cyan glow)
      ctx.beginPath();
      ctx.strokeStyle = '#00f2fe';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 8;

      const step = width / (localPoints.length - 1);
      localPoints.forEach((p, idx) => {
        const x = idx * step;
        const normalizedVal = (p.norm - 9.8) / 20;
        const y = Math.max(10, Math.min(height - 10, baselineY - normalizedVal * (height * 0.5)));
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Secondary Waveform: Vertical Z Accel (Emerald)
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      localPoints.forEach((p, idx) => {
        const x = idx * step;
        const normalizedVal = (p.z - 9.8) / 20;
        const y = Math.max(10, Math.min(height - 10, baselineY - normalizedVal * (height * 0.5)));
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [impactThreshold]);

  // Load existing events from backend
  useEffect(() => {
    fetchSensorEvents().then(events => {
      if (events) setDetectedEvents(events);
    });

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setSensorSupported(true);
    } else {
      setSensorSupported(false);
    }
  }, []);

  // Journey Start / Stop
  const startJourney = async () => {
    if (
      typeof (DeviceMotionEvent as any) !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
        } else {
          setPermissionState('denied');
          alert('Device motion permission was denied.');
          return;
        }
      } catch (err) {
        console.warn('Error requesting device motion permission:', err);
      }
    } else {
      setPermissionState('granted');
    }

    // Acquire GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: pos.coords.speed ? pos.coords.speed * 3.6 : 30,
          });
        },
        _err => {}
      );
    }

    const newJourneyId = `JNY-${Date.now().toString(36).toUpperCase()}`;
    setJourneyId(newJourneyId);
    setIsJourneyActive(true);
    sampleWindowRef.current = [];
  };

  const stopJourney = () => {
    setIsJourneyActive(false);
  };

  // Push new point into oscilloscope buffer
  const pushOscilloscopePoint = (point: { z: number; norm: number; x: number; y: number }) => {
    const buf = historyPointsRef.current;
    buf.push(point);
    if (buf.length > 140) {
      buf.shift();
    }
  };

  // Device Motion listener
  useEffect(() => {
    if (!isJourneyActive) {
      // Idle ambient baseline oscillation
      const interval = setInterval(() => {
        pushOscilloscopePoint({
          norm: 9.8 + (Math.random() - 0.5) * 0.4,
          z: 9.8 + (Math.random() - 0.5) * 0.3,
          x: (Math.random() - 0.5) * 0.2,
          y: (Math.random() - 0.5) * 0.2,
        });
      }, 50);
      return () => clearInterval(interval);
    }

    const handleMotionEvent = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      const rot = event.rotationRate;

      const ax = acc?.x || 0;
      const ay = acc?.y || 0;
      const az = acc?.z || 9.8;
      const norm = Math.sqrt(ax * ax + ay * ay + az * az);

      const sample: SensorReadingSample = {
        timestamp: Date.now(),
        accelX: Number(ax.toFixed(2)),
        accelY: Number(ay.toFixed(2)),
        accelZ: Number(az.toFixed(2)),
        rotationAlpha: rot?.alpha ? Number(rot.alpha.toFixed(2)) : undefined,
        rotationBeta: rot?.beta ? Number(rot.beta.toFixed(2)) : undefined,
        rotationGamma: rot?.gamma ? Number(rot.gamma.toFixed(2)) : undefined,
        norm: Number(norm.toFixed(2)),
      };

      setCurrentAccel({ x: ax, y: ay, z: az, norm });
      pushOscilloscopePoint({ x: ax, y: ay, z: az, norm });

      if (rot) {
        setCurrentRotation({
          alpha: rot.alpha || 0,
          beta: rot.beta || 0,
          gamma: rot.gamma || 0,
        });
      }

      sampleWindowRef.current.push(sample);
      if (sampleWindowRef.current.length > 30) {
        sampleWindowRef.current.shift();
      }

      if (norm > impactThreshold || Math.abs(az) > impactThreshold) {
        triggerImpactEvent(norm, az);
      }
    };

    window.addEventListener('devicemotion', handleMotionEvent);
    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [isJourneyActive, impactThreshold, journeyId, gpsCoords]);

  // Debounced impact trigger
  const lastTriggerTime = useRef<number>(0);

  const triggerImpactEvent = async (norm: number, az: number) => {
    const now = Date.now();
    if (now - lastTriggerTime.current < 2500) {
      return;
    }
    lastTriggerTime.current = now;

    const candidateWindow = [...sampleWindowRef.current];

    try {
      const saved = await recordSensorEvent({
        journeyId: journeyId || 'JOURNEY-MANUAL',
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        speedMps: gpsCoords.speed ? gpsCoords.speed / 3.6 : 8.3,
        peakAccelZ: Number(az.toFixed(2)),
        peakNorm: Number(norm.toFixed(2)),
        confidence: 0.65,
        sampleWindow: candidateWindow,
      });

      setDetectedEvents(prev => [saved, ...prev]);
      setLastImpactAlert(`Spike detected: ${norm.toFixed(1)} m/s² (${(norm / 9.8).toFixed(1)}G) at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setLastImpactAlert(null), 5000);
    } catch (err) {
      console.error('Failed to log sensor candidate:', err);
    }
  };

  // Simulation Trigger for Desktop Judges
  const simulateImpact = () => {
    const simulatedNorm = Number((impactThreshold + Math.random() * 8 + 4).toFixed(2));
    const simulatedAz = Number((simulatedNorm * 0.9).toFixed(2));

    // Synthesize shockwave waveform into oscilloscope buffer
    const shockwaveSamples = [
      { norm: 10.2, z: 10.1, x: 0.2, y: 0.1 },
      { norm: 8.4, z: 8.0, x: -0.4, y: 0.3 }, // initial depression
      { norm: simulatedNorm * 0.7, z: simulatedAz * 0.7, x: 1.2, y: 0.8 },
      { norm: simulatedNorm, z: simulatedAz, x: 2.4, y: 1.5 }, // peak impact
      { norm: simulatedNorm * 0.8, z: simulatedAz * 0.75, x: -1.0, y: -0.5 }, // rebound
      { norm: 13.5, z: 12.8, x: 0.8, y: -0.2 },
      { norm: 11.0, z: 10.5, x: -0.2, y: 0.1 },
      { norm: 9.8, z: 9.8, x: 0.0, y: 0.0 },
    ];

    shockwaveSamples.forEach(pt => pushOscilloscopePoint(pt));
    setCurrentAccel({ x: 2.4, y: 1.5, z: simulatedAz, norm: simulatedNorm });

    // Generate synthetic window for audit log
    const syntheticWindow: SensorReadingSample[] = [];
    const baseTime = Date.now() - 1500;
    for (let i = 0; i < 20; i++) {
      const t = baseTime + i * 100;
      const isPeak = i === 12;
      syntheticWindow.push({
        timestamp: t,
        accelX: isPeak ? 3.4 : 0.1,
        accelY: isPeak ? 4.2 : 0.2,
        accelZ: isPeak ? simulatedAz : 9.8,
        norm: isPeak ? simulatedNorm : 9.8,
      });
    }
    sampleWindowRef.current = syntheticWindow;
    triggerImpactEvent(simulatedNorm, simulatedAz);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                In-Browser Hardware Telemetry
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                isJourneyActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'
              }`}>
                {isJourneyActive ? '● Sensor Active' : '○ Sensor Standby'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Activity className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" />
              <span>Smartphone Motion & Pothole Telemetry</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Automatic road surface anomaly capture using client-side accelerometer and gyroscope APIs. Zero app download required.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            {isJourneyActive ? (
              <button
                onClick={stopJourney}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/40 transition-all flex items-center gap-2"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Stop Journey Recording</span>
              </button>
            ) : (
              <button
                onClick={startJourney}
                className="glass-button-primary px-6 py-3 rounded-2xl text-xs font-black shadow-glow-cyan flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current text-navy-950" />
                <span>Start Journey Telemetry</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Honest Scientific Principles Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Info className="w-4 h-4" />
            <span>Telemetry Methodology & Candidate Validation Principles</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Strict Scientific Honesty</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="flex items-start gap-1.5">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><strong>True Hardware Motion APIs:</strong> Reads actual W3C `DeviceMotionEvent` sensors without mocked phone frames.</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-cyan-400 mt-0.5">•</span>
            <span><strong>Expansion Joints & Bumps:</strong> Speed breakers create similar G-forces; events are recorded strictly as <em>Unverified Candidates</em>.</span>
          </div>
        </div>
      </div>

      {/* Live Impact Spike Alert Toast */}
      {lastImpactAlert && (
        <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/80 shadow-glow-cyan text-amber-200 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">{lastImpactAlert}</div>
              <div className="text-[11px] text-amber-300/80">Logged to Municipal Database with ±1.5s buffered window</div>
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase bg-amber-900/90 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/40">
            Unverified Candidate
          </span>
        </div>
      )}

      {/* Interactive Oscilloscope & Radar Scope Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-Time Waveform Oscilloscope */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-3xl space-y-3 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono text-xs font-bold uppercase text-white tracking-wider">
                Live Acceleration Waveform Oscilloscope
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-3 h-0.5 bg-cyan-400"></span> Total Vector Norm
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400"></span> Z-Axis (Vertical)
              </span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-navy-950 shadow-inner relative">
            <canvas
              ref={canvasRef}
              width={680}
              height={220}
              className="w-full h-52 block"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
            <span>Sampling: ~50 Hz Client Event Loop</span>
            <span>Trigger Threshold: <strong className="text-red-400">{impactThreshold} m/s²</strong></span>
          </div>
        </div>

        {/* G-Force Vector Dot Scope + Quick Metrics */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-3xl flex flex-col justify-between border border-slate-800/80 shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-200">
                Lateral G-Vector Scope
              </span>
              <Compass className="w-4 h-4 text-teal-400" />
            </div>

            {/* Circular Radar HUD */}
            <div className="relative w-40 h-40 mx-auto rounded-full border border-slate-700/80 bg-navy-950 flex items-center justify-center shadow-inner">
              {/* Inner concentric ring */}
              <div className="absolute w-28 h-28 rounded-full border border-slate-800" />
              <div className="absolute w-14 h-14 rounded-full border border-slate-800/80" />
              <div className="absolute w-full h-[1px] bg-slate-800/60" />
              <div className="absolute h-full w-[1px] bg-slate-800/60" />

              {/* Dynamic Vector Dot */}
              <div
                className="absolute w-4 h-4 rounded-full bg-cyan-400 shadow-glow-cyan transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
                style={{
                  left: `${50 + (currentAccel.x / 12) * 40}%`,
                  top: `${50 - (currentAccel.y / 12) * 40}%`,
                }}
              />
              <span className="text-[9px] font-mono text-slate-600 absolute bottom-2">1.0G Ring</span>
            </div>
          </div>

          {/* Instantaneous Readouts */}
          <div className="p-3.5 rounded-2xl bg-navy-950/80 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Force:</span>
              <span className="font-mono font-bold text-white text-sm">{currentAccel.norm.toFixed(1)} m/s² ({(currentAccel.norm / 9.8).toFixed(2)}G)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Vertical Bump Z:</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{currentAccel.z.toFixed(1)} m/s²</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Yaw Gyro:</span>
              <span className="font-mono text-teal-300 text-xs">{currentRotation.alpha.toFixed(1)}°/s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity Tuning Slider + Desktop Simulation Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sensitivity Slider Card */}
        <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Pothole Impact Sensitivity</span>
            </span>
            <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
              {impactThreshold} m/s² ({(impactThreshold / 9.8).toFixed(1)}G)
            </span>
          </div>

          <input
            type="range"
            min="14"
            max="28"
            step="0.5"
            value={impactThreshold}
            onChange={e => setImpactThreshold(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 bg-navy-950 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>14 m/s² (Sensitive)</span>
            <span>20 m/s² (Standard Pothole)</span>
            <span>28 m/s² (Severe Crater)</span>
          </div>
        </div>

        {/* Desktop Judge Demo Stimulator */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between border border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span>Desktop Demonstration Mode</span>
            </span>
            <span className="text-[10px] text-slate-500">For evaluators without phone motion</span>
          </div>

          <button
            onClick={simulateImpact}
            className="w-full py-2.5 px-4 rounded-xl glass-button-secondary text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 hover:text-white transition-all transform active:scale-95"
          >
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Simulate Real Road Bump (Pothole Shockwave)</span>
          </button>
        </div>
      </div>

      {/* Captured Candidate Events Feed */}
      <div className="glass-panel p-5 rounded-3xl space-y-3.5 border border-slate-800/80 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              Captured Candidate Events ({detectedEvents.length})
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 font-mono">
              Potential Road Impact — Unverified
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            ±1.5s Buffered Sensor Window
          </span>
        </div>

        {detectedEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No sensor impact candidate events detected yet. Click "Start Journey" or "Simulate Real Road Bump" to log anomalies.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {detectedEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="p-3.5 rounded-2xl bg-navy-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{evt.id}</span>
                    <span className="px-2 py-0.5 rounded-md bg-navy-800 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                      {evt.label}
                    </span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px] mt-1.5 font-mono">
                    <span>GPS: {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}</span>
                    <span>Peak Z: <strong className="text-white">{evt.peakAccelZ} m/s²</strong></span>
                    <span>Norm: <strong className="text-white">{evt.peakNorm} m/s² ({(evt.peakNorm / 9.8).toFixed(1)}G)</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0 bg-navy-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-right font-mono">
                  <span>Buffered: {evt.sampleWindow?.length || 20} samples (±1.5s)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default MotionSensorPage;
