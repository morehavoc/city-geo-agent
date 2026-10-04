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

    // The id field lets us match features across the two passes below.
    const meta = await arcgisGet(layer.url, {});
    const oid: string | undefined = meta.json.objectIdField || (meta.json.fields || []).find((f: any) => f.type === 'esriFieldTypeOID')?.name;
    const fieldsWithId = oid && outFields !== '*' ? `${outFields},${oid}` : outFields;

    const count = await arcgisGet(`${layer.url}/query`, { where, ...near, returnCountOnly: true });
    if (typeof count.json.count !== 'number') throw new Error(`${layer.id} did not return a count for this search`);
    const total: number = count.json.count;
    const queries = [count.url];
    const want = Math.min(total, MAX_FETCH);

    // Pass 1: features with coordinates, so we can measure distance.
    const rows: { attributes: any; distance_m: number | null }[] = [];
    const fetchAll = async (extra: Record<string, any>, keep: (f: any) => void) => {
      let offset = 0, got = 0;
      while (got < want) {
        const page = await arcgisGet(`${layer.url}/query`, { where, ...near, ...extra, resultOffset: offset || undefined });
        if (offset === 0) queries.push(page.url);
        const feats = page.json.features || [];
        feats.forEach(keep);
        got += feats.length;
        if (!page.json.exceededTransferLimit || feats.length === 0) break;
        offset += feats.length;
      }
      return got;
    };
    await fetchAll(
      { outFields: fieldsWithId, returnGeometry: true, outSR: 4326, maxAllowableOffset: 0.00002, geometryPrecision: 6 },
      (f) => rows.push({ attributes: f.attributes, distance_m: distanceMeters([lon, lat], f.geometry) }),
    );

    // Some services silently drop features when asked to reproject them
    // (Metro's tax lots return 47 of 722). If pass 1 came up short, fetch the
    // attributes without coordinates so nothing is missing; those get no distance.
    const notes: string[] = [];
    if (rows.length < want) {
      const withCoords = rows.length;
      if (oid) {
        const seen = new Set(rows.map((r) => r.attributes[oid]).filter((v) => v !== undefined));
        const pass1HasIds = seen.size === rows.length;
        const extraRows: typeof rows = [];
        await fetchAll({ outFields: fieldsWithId, returnGeometry: false }, (f) => {
          if (!pass1HasIds || !seen.has(f.attributes[oid])) extraRows.push({ attributes: f.attributes, distance_m: null });
        });
        if (pass1HasIds) rows.push(...extraRows);
        else { rows.length = 0; rows.push(...extraRows); }
        notes.push(`The service returned coordinates for only ${withCoords} of ${total} features, so distances are known for ${rows.filter((r) => r.distance_m !== null).length}. Features without a distance are listed after those that have one, in no particular order.`);
      } else {
        notes.push(`The service returned only ${withCoords} of the ${total} features it counted. The list below is incomplete and "nearest" covers only those.`);
      }
    }

    rows.sort((x, y) => (x.distance_m ?? Infinity) - (y.distance_m ?? Infinity));
    const per = UNITS[units].meters;
    const features = rows.slice(0, limit).map((r) => ({
      ...r.attributes,
      distance: r.distance_m === null ? null : Math.round((r.distance_m / per) * 100) / 100,
    }));

    if (total > features.length) notes.push(`Showing ${features.length} of ${total}, nearest first.`);
    if (total > MAX_FETCH) notes.push(`Only the first ${MAX_FETCH} matches were sorted by distance; narrow the search for an exact nearest list.`);

    return {
      layer: layer.id, center: { lon, lat }, radius: `${distance} ${units}`, where,
      total, returned: features.length, distance_units: units, features,
      ...(notes.length ? { notes } : {}),
      queries,
    };
  },
};
