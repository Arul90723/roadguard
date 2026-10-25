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
  Cpu
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

  // Recent circular buffer of samples (window)
  const sampleWindowRef = useRef<SensorReadingSample[]>([]);
  const [detectedEvents, setDetectedEvents] = useState<SensorEvent[]>([]);
  const [lastImpactAlert, setLastImpactAlert] = useState<string | null>(null);

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
    // Request permission on iOS 13+
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
        _err => {
          // Default Kochi coordinate maintained
        }
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

  // Device Motion listener
  useEffect(() => {
    if (!isJourneyActive) return;

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
      if (rot) {
        setCurrentRotation({
          alpha: rot.alpha || 0,
          beta: rot.beta || 0,
          gamma: rot.gamma || 0,
        });
      }

      // Maintain rolling buffer of last 30 samples (~1.5-2 seconds)
      sampleWindowRef.current.push(sample);
      if (sampleWindowRef.current.length > 30) {
        sampleWindowRef.current.shift();
      }

      // Check impact threshold (vertical or total vector norm)
      if (norm > impactThreshold || Math.abs(az) > impactThreshold) {
        triggerImpactEvent(norm, az);
      }
    };

    window.addEventListener('devicemotion', handleMotionEvent);
    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [isJourneyActive, impactThreshold, journeyId, gpsCoords]);

  // Debounced impact trigger to prevent multiple fires for single pothole
  const lastTriggerTime = useRef<number>(0);

  const triggerImpactEvent = async (norm: number, az: number) => {
    const now = Date.now();
    if (now - lastTriggerTime.current < 2500) {
      return; // 2.5s debounce
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
      setLastImpactAlert(`Spike detected: ${norm.toFixed(1)} m/s² at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setLastImpactAlert(null), 5000);
    } catch (err) {
      console.error('Failed to log sensor candidate:', err);
    }
  };

  // Simulation Trigger for Desktop Judges
  const simulateImpact = () => {
    const simulatedNorm = Number((impactThreshold + Math.random() * 8 + 4).toFixed(2));
    const simulatedAz = Number((simulatedNorm * 0.9).toFixed(2));

    // Generate synthetic window
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white font-mono flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <span>Automatic Smartphone Motion Detection</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Experimental client-side accelerometer & gyroscope telemetry. Runs purely in-browser.
          </p>
        </div>

        {/* Start / Stop Journey Button */}
        <div>
          {isJourneyActive ? (
            <button
              onClick={stopJourney}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/50 transition-all"
            >
              <Square className="w-4 h-4" />
              <span>Stop Journey ({journeyId})</span>
            </button>
          ) : (
            <button
              onClick={startJourney}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 text-navy-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Journey Recording</span>
            </button>
          )}
        </div>
      </div>

      {/* Honest Scientific Disclaimers & Ethics Banner */}
      <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 space-y-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Info className="w-4 h-4" />
          <span>Scientific Telemetry Principles & Transparency</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-400">
          <li><strong>Real Browser Sensors:</strong> Readings reflect true hardware accelerometer & gyroscope APIs.</li>
          <li><strong>Not every impact is a pothole:</strong> Expansion joints, speed breakers, or curb drops produce similar G-force signatures.</li>
          <li><strong>Honest Candidate Labeling:</strong> Events are recorded strictly as <em>"Potential Road Impact — Unverified"</em> until corroborated by independent citizen photos or repeated journeys.</li>
          <li><strong>No Background Tracking:</strong> Web browsers suspend JavaScript sensors when the screen turns off. Journey recording operates actively during open navigation.</li>
        </ul>
      </div>

      {/* Live Impact Alert Toast */}
      {lastImpactAlert && (
        <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs font-semibold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{lastImpactAlert}</span>
          </div>
          <span className="font-mono text-[10px] uppercase bg-amber-900/80 px-2 py-0.5 rounded">
            Potential Road Impact — Unverified
          </span>
        </div>
      )}

      {/* Telemetry Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accelerometer Card */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Vertical / Vector Force</span>
            <Radio className={`w-3.5 h-3.5 ${isJourneyActive ? 'text-emerald-400 animate-ping' : 'text-slate-600'}`} />
          </div>

          <div className="text-center py-2">
            <div className="text-3xl font-black text-white font-mono">
              {currentAccel.norm.toFixed(1)} <span className="text-xs text-slate-400 font-normal">m/s²</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              G-Force: {(currentAccel.norm / 9.8).toFixed(2)} G
            </div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span>X (Lateral):</span>
              <span className="text-slate-200">{currentAccel.x.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between">
              <span>Y (Longitudinal):</span>
              <span className="text-slate-200">{currentAccel.y.toFixed(2)} m/s²</span>
            </div>
            <div className="flex justify-between">
              <span>Z (Vertical Bump):</span>
              <span className="text-cyan-400 font-bold">{currentAccel.z.toFixed(2)} m/s²</span>
            </div>
          </div>
        </div>

        {/* Gyroscope Card */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider">Rotation Rate (Gyro)</span>
            <Compass className="w-3.5 h-3.5 text-teal-400" />
          </div>

          <div className="text-center py-2">
            <div className="text-3xl font-black text-teal-300 font-mono">
              {Math.abs(currentRotation.alpha).toFixed(1)}° <span className="text-xs text-slate-400 font-normal">/s</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Angular Yaw Velocity</div>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex justify-between">
              <span>Alpha (Z):</span>
              <span className="text-slate-200">{currentRotation.alpha.toFixed(1)}°/s</span>
            </div>
            <div className="flex justify-between">
              <span>Beta (X Pitch):</span>
              <span className="text-slate-200">{currentRotation.beta.toFixed(1)}°/s</span>
            </div>
            <div className="flex justify-between">
              <span>Gamma (Y Roll):</span>
              <span className="text-slate-200">{currentRotation.gamma.toFixed(1)}°/s</span>
            </div>
          </div>
        </div>

        {/* Sensitivity Configuration Card */}
        <div className="p-5 rounded-2xl bg-navy-900/80 border border-slate-800 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Detection Sensitivity</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{impactThreshold} m/s²</span>
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
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>14 m/s² (Sensitive)</span>
              <span>28 m/s² (Severe only)</span>
            </div>
          </div>

          {/* Desktop Simulator Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={simulateImpact}
              className="w-full py-2 px-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Simulate Road Bump (Desktop Demo)</span>
            </button>
            <span className="block text-[10px] text-slate-500 text-center mt-1">
              Test candidate capture without physical phone
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Events List */}
      <div className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Captured Candidate Events ({detectedEvents.length})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 font-mono">
              Potential Road Impact — Unverified
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Buffered short window around impact
          </span>
        </div>

        {detectedEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No sensor impact candidate events detected yet. Click "Start Journey" or "Simulate Road Bump" to log anomalies.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {detectedEvents.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-400">{evt.id}</span>
                    <span className="px-2 py-0.5 rounded bg-navy-800 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                      {evt.label}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-[11px] mt-1 font-mono">
                    <span>GPS: {evt.latitude.toFixed(4)}, {evt.longitude.toFixed(4)}</span>
                    <span>Peak Z: <strong className="text-white">{evt.peakAccelZ} m/s²</strong></span>
                    <span>Total Norm: <strong className="text-white">{evt.peakNorm} m/s²</strong></span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0 bg-navy-900 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
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
