import { arcgisGet, checkLonLat, nearParams, UNITS } from '../arcgis.js';
import { getLayer } from '../catalog.js';
import { distanceMeters } from '../distance.js';
import type { ToolDef } from './types.js';

const MAX_FETCH = 2000;   // features we'll pull to sort by distance
const MAX_LIMIT = 100;    // features we'll hand back to the model

// "What's within N miles of here?" ArcGIS does the spatial filter; we page
// through the hits, work out how far each one is, and return the nearest.
export const queryNear: ToolDef = {
  name: 'query_near',
  title: 'Find features near a point',
  description:
    'Find features in one layer within a distance of a longitude/latitude point, optionally filtered with a SQL where clause (e.g. "Status = \'Active\'"). ' +
    'Returns the total count and the nearest features (with their distance), nearest first. Check describe_layer for real field names and values before writing a where clause. ' +
    'If the data is split across several layers (e.g. points, lines and areas), call this once per layer.',
  inputSchema: {
    type: 'object',
    properties: {
      layer_id: { type: 'string', description: 'A layer id from list_layers.' },
      lon: { type: 'number', description: 'Longitude (WGS84).' },
      lat: { type: 'number', description: 'Latitude (WGS84).' },
      distance: { type: 'number', exclusiveMinimum: 0, description: 'Search radius.' },
      units: { type: 'string', enum: Object.keys(UNITS), description: 'Units for distance. Default miles.' },
      where: { type: 'string', description: "Optional SQL filter, e.g. \"Status = 'Active'\". Default: everything." },
      fields: { type: 'array', items: { type: 'string' }, description: 'Fields to return. Default: the layer\'s key fields.' },
      limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, description: 'How many nearest features to return (default 25).' },
    },
    required: ['layer_id', 'lon', 'lat', 'distance'],
  },
  async run({ layer_id, lon, lat, distance, units = 'miles', where = '1=1', fields, limit = 25 }) {
    checkLonLat(lon, lat);
    if (typeof distance !== 'number' || !(distance > 0)) throw new Error('distance must be a positive number');
    const layer = getLayer(layer_id);
    const near = nearParams(lon, lat, distance, units);
    const outFields = (Array.isArray(fields) && fields.length ? fields : layer.fields || ['*']).join(',');
    limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(limit)));

    const count = await arcgisGet(`${layer.url}/query`, { where, ...near, returnCountOnly: true });
    const total: number = count.json.count ?? 0;
    const queries = [count.url];

    const rows: { attributes: any; distance_m: number | null }[] = [];
    let offset = 0;
    while (rows.length < Math.min(total, MAX_FETCH)) {
      const page = await arcgisGet(`${layer.url}/query`, {
        where, ...near, outFields, returnGeometry: true, outSR: 4326,
        maxAllowableOffset: 0.00002, geometryPrecision: 6,
        resultOffset: offset || undefined,
      });
      if (offset === 0) queries.push(page.url);
      const feats = page.json.features || [];
      for (const f of feats) rows.push({ attributes: f.attributes, distance_m: distanceMeters([lon, lat], f.geometry) });
      if (!page.json.exceededTransferLimit || feats.length === 0) break;
      offset += feats.length;
    }

    rows.sort((a, b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity));
    const per = UNITS[units].meters;
    const features = rows.slice(0, limit).map((r) => ({
      ...r.attributes,
      distance: r.distance_m === null ? null : Math.round((r.distance_m / per) * 100) / 100,
    }));

    const notes: string[] = [];
    if (total > features.length) notes.push(`Showing the nearest ${features.length} of ${total}.`);
    if (total > MAX_FETCH) notes.push(`Only the first ${MAX_FETCH} matches were sorted by distance; narrow the search for an exact nearest list.`);
    if (rows.length < Math.min(total, MAX_FETCH)) notes.push(`The service returned ${rows.length} features but counted ${total}.`);

    return {
      layer: layer.id, center: { lon, lat }, radius: `${distance} ${units}`, where,
      total, returned: features.length, distance_units: units, features,
      ...(notes.length ? { notes } : {}),
      queries,
    };
  },
};
