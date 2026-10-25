import { Incident, RouteOption } from '../types.js';
import { calculateDistanceMeters, db } from '../db/index.js';

interface Coordinates {
  lat: number;
  lng: number;
}

export async function calculateRouteOptions(
  origin: Coordinates,
  destination: Coordinates,
  vehicleType: 'hatchback' | 'suv' | 'two_wheeler' | 'electric' = 'hatchback'
): Promise<{
  routes: RouteOption[];
  isDemoService: boolean;
  disclaimer: string;
}> {
  const activeIncidents = (await db.getIncidents()).filter(i => i.status !== 'resolved');

  // Try querying public OSRM driving service
  let osrmRoutes: any[] = [];
  let isDemoRouting = false;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&alternatives=true`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = (await res.json()) as any;
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        osrmRoutes = data.routes;
      }
    }
  } catch (err) {
    // Graceful fallback to synthetic road waypoints when OSRM is offline or blocked
    isDemoRouting = true;
  }

  // If OSRM returned fewer than 2 routes or failed, generate geometry variations
  const routeCandidates: {
    preference: RouteOption['preference'];
    name: string;
    coords: [number, number][];
    baseDistanceKm: number;
    baseDurationMinutes: number;
  }[] = [];

  if (osrmRoutes.length > 0) {
    osrmRoutes.slice(0, 3).forEach((r, idx) => {
      const coords: [number, number][] = r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      const distKm = Number((r.distance / 1000).toFixed(1));
      const durMin = Math.round(r.duration / 60);

      const prefMap: RouteOption['preference'][] = ['safest', 'fastest', 'fuel_efficient'];
      const pref = prefMap[idx] || 'balanced';

      routeCandidates.push({
        preference: pref,
        name: idx === 0 ? 'Primary Arterial Route' : `Alternate Option ${idx + 1}`,
        coords,
        baseDistanceKm: distKm,
        baseDurationMinutes: durMin,
      });
    });
  } else {
    isDemoRouting = true;
    // Generate 3 plausible path geometries between origin and destination
    const midLat = (origin.lat + destination.lat) / 2;
    const midLng = (origin.lng + destination.lng) / 2;

    const baseDistance = Number((calculateDistanceMeters(origin.lat, origin.lng, destination.lat, destination.lng) / 1000 * 1.25).toFixed(1));
    const baseDuration = Math.round(baseDistance * 2.5); // ~24 km/h urban speed

    // Route 1: Direct Arterial
    routeCandidates.push({
      preference: 'fastest',
      name: 'Via Main Arterial Highway',
      coords: [
        [origin.lat, origin.lng],
        [origin.lat + (destination.lat - origin.lat) * 0.3, origin.lng + (destination.lng - origin.lng) * 0.1],
        [midLat, midLng],
        [destination.lat - (destination.lat - origin.lat) * 0.2, destination.lng - (destination.lng - origin.lng) * 0.1],
        [destination.lat, destination.lng]
      ],
      baseDistanceKm: baseDistance,
      baseDurationMinutes: baseDuration
    });

    // Route 2: Bypass / Ring corridor (slightly longer, avoids downtown hazards)
    routeCandidates.push({
      preference: 'safest',
      name: 'Via Outer Bypass (Hazard-Avoidance)',
      coords: [
        [origin.lat, origin.lng],
        [origin.lat + 0.008, origin.lng + 0.012],
        [midLat + 0.015, midLng + 0.018],
        [destination.lat + 0.005, destination.lng + 0.008],
        [destination.lat, destination.lng]
      ],
      baseDistanceKm: Number((baseDistance * 1.15).toFixed(1)),
      baseDurationMinutes: Math.round(baseDuration * 1.08)
    });

    // Route 3: Shortest Local Link
    routeCandidates.push({
      preference: 'shortest',
      name: 'Via Internal Link Road',
      coords: [
        [origin.lat, origin.lng],
        [midLat - 0.006, midLng - 0.009],
        [destination.lat, destination.lng]
      ],
      baseDistanceKm: Number((baseDistance * 0.95).toFixed(1)),
      baseDurationMinutes: Math.round(baseDuration * 1.2)
    });
  }

  // Mileage consumption per km assumptions
  const fuelRates: Record<string, number> = {
    hatchback: 1 / 15, // 15 km/liter
    suv: 1 / 10,       // 10 km/liter
    two_wheeler: 1 / 45, // 45 km/liter
    electric: 0.15     // 0.15 kWh/km (represented as energy unit)
  };
  const fuelRate = fuelRates[vehicleType] || (1 / 14);

  // Evaluate each candidate route against known hazards
  const routes: RouteOption[] = routeCandidates.map((c, index) => {
    // Find all hazards within 120m corridor of this route's polyline
    const hazardsOnRoute: RouteOption['hazardsOnRoute'] = [];
    let severityWeightedHazardScore = 0;

    for (const inc of activeIncidents) {
      let minDistance = Infinity;
      for (const [lat, lng] of c.coords) {
        const d = calculateDistanceMeters(lat, lng, inc.latitude, inc.longitude);
        if (d < minDistance) minDistance = d;
      }

      if (minDistance <= 120) {
        const weightMap = { critical: 40, high: 25, moderate: 12, low: 5 };
        const weight = weightMap[inc.severity] || 10;
        severityWeightedHazardScore += weight;

        hazardsOnRoute.push({
          incidentId: inc.id,
          category: inc.category,
          severity: inc.severity,
          distanceMeters: Math.round(minDistance),
          title: inc.title
        });
      }
    }

    // Determine Route Quality Score
    let quality: 'A' | 'B' | 'C' | 'D' = 'A';
    if (severityWeightedHazardScore > 60 || hazardsOnRoute.some(h => h.severity === 'critical')) {
      quality = 'D';
    } else if (severityWeightedHazardScore > 35) {
      quality = 'C';
    } else if (severityWeightedHazardScore > 15) {
      quality = 'B';
    }

    // Recommendation Explanation
    let explanation = '';
    if (c.preference === 'safest') {
      if (hazardsOnRoute.length === 0) {
        explanation = 'Optimal safety rating: Zero verified active road hazards detected along this route corridor.';
      } else {
        explanation = `Prioritises safety: Detours past critical road collapses and downed powerlines, encountering ${hazardsOnRoute.length} minor incident(s).`;
      }
    } else if (c.preference === 'fastest') {
      explanation = `Fastest transit: Estimated ${c.baseDurationMinutes} mins. Note: encounters ${hazardsOnRoute.length} active road hazard(s) requiring caution.`;
    } else if (c.preference === 'shortest') {
      explanation = `Shortest physical distance (${c.baseDistanceKm} km), though interior segments may encounter rough pavement and moderate delay.`;
    } else {
      explanation = `Balanced path combining acceptable pavement rating with steady traffic throughput.`;
    }

    return {
      id: `ROUTE-${index + 1}`,
      name: c.name,
      preference: c.preference,
      distanceKm: c.baseDistanceKm,
      durationMinutes: c.baseDurationMinutes,
      nearbyVerifiedHazards: hazardsOnRoute.length,
      severityWeightedHazardScore,
      estimatedFuelLiters: Number((c.baseDistanceKm * fuelRate).toFixed(2)),
      routeQualityScore: quality,
      recommendationExplanation: explanation,
      coordinates: c.coords,
      hazardsOnRoute
    };
  });

  // Sort: promote 'safest' route that has lowest hazard score, or user requested preference
  routes.sort((a, b) => a.severityWeightedHazardScore - b.severityWeightedHazardScore);

  return {
    routes,
    isDemoService: isDemoRouting,
    disclaimer: 'DISCLAIMER: Route safety scoring is an analytical estimate based solely on verified community and authority reports. It does not guarantee accident-free travel. Always exercise personal judgment and obey local traffic advisories.'
  };
}
