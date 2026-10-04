// A tiny client for the ArcGIS REST API: GET a URL, return the JSON and the
// exact URL we called. Every tool hands those URLs back to the agent so a
// person can paste one into a browser and see the same answer.

export interface Fetched<T = any> {
  json: T;
  url: string;
}

const UA = 'city-geo-agent/0.1 (+https://github.com/morehavoc/city-geo-agent)';
const TIMEOUT_MS = 20_000;

export async function arcgisGet<T = any>(base: string, params: Record<string, string | number | boolean | undefined>): Promise<Fetched<T>> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  qs.set('f', 'json');
  const url = `${base}?${qs.toString()}`;

  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Non-JSON reply (HTTP ${res.status}) from ${base}`);
  }
  // ArcGIS reports most failures as HTTP 200 with an "error" object.
  if (!res.ok || (json && json.error)) {
    const e = json?.error;
    const detail = e ? `${e.code}: ${e.message}${e.details?.length ? ' (' + e.details.join('; ') + ')' : ''}` : `HTTP ${res.status}`;
    throw new Error(`ArcGIS error from ${base}: ${detail}`);
  }
  return { json, url };
}

export const UNITS: Record<string, { esri: string; meters: number }> = {
  feet: { esri: 'esriSRUnit_Foot', meters: 0.3048 },
  miles: { esri: 'esriSRUnit_StatuteMile', meters: 1609.344 },
  meters: { esri: 'esriSRUnit_Meter', meters: 1 },
  kilometers: { esri: 'esriSRUnit_Kilometer', meters: 1000 },
};

/** Query params for "within `distance` `units` of a lon/lat point". */
export function nearParams(lon: number, lat: number, distance: number, units: string) {
  const u = UNITS[units];
  if (!u) throw new Error(`units must be one of ${Object.keys(UNITS).join(', ')}`);
  return {
    geometry: `${lon},${lat}`,
    geometryType: 'esriGeometryPoint',
    inSR: 4326,
    spatialRel: 'esriSpatialRelIntersects',
    distance,
    units: u.esri,
  };
}

export function checkLonLat(lon: unknown, lat: unknown): asserts lon is number {
  if (typeof lon !== 'number' || !Number.isFinite(lon) || lon < -180 || lon > 180) throw new Error('lon must be a longitude between -180 and 180');
  if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) throw new Error('lat must be a latitude between -90 and 90');
}
