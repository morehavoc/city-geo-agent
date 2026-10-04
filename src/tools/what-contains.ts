import { arcgisGet, checkLonLat } from '../arcgis.js';
import { getLayer } from '../catalog.js';
import type { ToolDef } from './types.js';

// Point-in-polygon: for each layer the agent names, which features does the
// point fall inside? An empty `matches` array means "inside none of them".
// A layer we could not query says `error` instead, so a failed check never
// reads as "outside".
export const whatContains: ToolDef = {
  name: 'what_contains',
  title: 'What is this point inside?',
  description:
    'For a longitude/latitude point, return the features it falls inside in each of the named polygon layers (city limits, zoning, council district, a parcel...). ' +
    'An empty matches array means the point is inside none of that layer\'s features. Two matches can mean the point sits on a shared boundary.',
  inputSchema: {
    type: 'object',
    properties: {
      lon: { type: 'number', description: 'Longitude (WGS84).' },
      lat: { type: 'number', description: 'Latitude (WGS84).' },
      layer_ids: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 8, description: 'Layer ids from list_layers to check.' },
    },
    required: ['lon', 'lat', 'layer_ids'],
  },
  async run({ lon, lat, layer_ids }) {
    checkLonLat(lon, lat);
    if (!Array.isArray(layer_ids) || layer_ids.length === 0) throw new Error('layer_ids must list at least one layer id');
    const results = await Promise.all(layer_ids.map(async (id: string) => {
      try {
        const layer = getLayer(id);
        const r = await arcgisGet(`${layer.url}/query`, {
          geometry: `${lon},${lat}`, geometryType: 'esriGeometryPoint', inSR: 4326,
          spatialRel: 'esriSpatialRelIntersects', outFields: (layer.fields || ['*']).join(','), returnGeometry: false,
        });
        const matches = (r.json.features || []).map((f: any) => f.attributes);
        return { layer: id, matches, ...(matches.length > 1 ? { note: 'More than one match: the point may be on a shared boundary, or the features overlap.' } : {}), query: r.url };
      } catch (e: any) {
        return { layer: id, error: e.message || String(e) };
      }
    }));
    return { point: { lon, lat }, results };
  },
};
