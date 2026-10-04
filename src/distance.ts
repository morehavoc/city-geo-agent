// Straight-line distance from a point to a feature, in meters. ArcGIS finds
// what is "within N miles" but does not say how far each thing is, so we work
// it out ourselves. Good to a few meters at city scale: we project lon/lat
// onto a flat plane centred on the query point.

type Pos = [number, number]; // [lon, lat]

const R = 6_371_008.8;

function project(origin: Pos) {
  const k = Math.cos((origin[1] * Math.PI) / 180);
  return (p: Pos): Pos => [((p[0] - origin[0]) * Math.PI / 180) * R * k, ((p[1] - origin[1]) * Math.PI / 180) * R];
}

function segDist(p: Pos, a: Pos, b: Pos): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

function inRing(p: Pos, ring: Pos[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Esri JSON geometry (x/y, paths or rings) in WGS84 -> meters from origin. */
export function distanceMeters(origin: Pos, geom: any): number | null {
  if (!geom) return null;
  const proj = project(origin);
  const o: Pos = [0, 0];
  if (typeof geom.x === 'number' && typeof geom.y === 'number') {
    const p = proj([geom.x, geom.y]);
    return Math.hypot(p[0], p[1]);
  }
  const parts: Pos[][] | undefined = geom.paths || geom.rings;
  if (!Array.isArray(parts) || parts.length === 0) return null;
  const projected = parts.map((part) => part.map((v) => proj([v[0], v[1]])));
  if (geom.rings) {
    // Even-odd over all rings handles holes.
    let inside = false;
    for (const ring of projected) if (inRing(o, ring)) inside = !inside;
    if (inside) return 0;
  }
  let best = Infinity;
  for (const part of projected) {
    if (part.length === 1) best = Math.min(best, Math.hypot(part[0][0], part[0][1]));
    for (let i = 1; i < part.length; i++) best = Math.min(best, segDist(o, part[i - 1], part[i]));
  }
  return Number.isFinite(best) ? best : null;
}
