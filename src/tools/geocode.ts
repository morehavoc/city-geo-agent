import { arcgisGet } from '../arcgis.js';
import { loadCatalog } from '../catalog.js';
import type { ToolDef } from './types.js';

const GEOCODER = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';

// Esri's World Geocoder, used anonymously (allowed for results you don't store).
// We return up to three candidates so the agent can see when a name is ambiguous.
export const geocode: ToolDef = {
  name: 'geocode',
  title: 'Find a place',
  description:
    'Turn an address, intersection or place name (e.g. "Hollywood Library, Portland") into longitude/latitude. ' +
    'Returns up to 3 candidates with a 0-100 match score; if the top ones disagree or score below 90, say so rather than guessing.',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string', description: 'Address or place name. Include the city for best results.' } },
    required: ['text'],
  },
  async run({ text }) {
    if (typeof text !== 'string' || !text.trim()) throw new Error('text is required');
    const center = loadCatalog().center;
    const r = await arcgisGet(GEOCODER, {
      SingleLine: text,
      maxLocations: 3,
      outFields: 'Match_addr,Addr_type,PlaceName,Type',
      location: center ? `${center[0]},${center[1]}` : undefined,
    });
    const candidates = (r.json.candidates || []).map((c: any) => ({
      address: c.address,
      lon: Math.round(c.location.x * 1e6) / 1e6,
      lat: Math.round(c.location.y * 1e6) / 1e6,
      score: c.score,
      type: c.attributes?.Addr_type,
    }));
    return { query: text, candidates, queries: [r.url] };
  },
};
