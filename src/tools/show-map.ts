// Bonus: draw an interactive map inside the chat (MCP Apps). The tool sends
// the map app a small spec (layer URLs, filters, pins); the app fetches the
// features itself, so no geometry floods the conversation. Renders in hosts
// that support MCP Apps (Claude Desktop, claude.ai); elsewhere the text
// summary is all you get.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLayer, layerOrigins } from '../catalog.js';
import type { ToolDef } from './types.js';

export const MAP_URI = 'ui://city-geo-agent/map-v1';
const BASEMAPS = ['topo', 'imagery', 'streets', 'gray', 'dark-gray', 'oceans'];
const BASEMAP_ORIGINS = ['https://server.arcgisonline.com', 'https://services.arcgisonline.com'];

const here = path.dirname(fileURLToPath(import.meta.url));
let html: string | null = null;
export function mapAppHtml(): string {
  if (html === null) html = readFileSync(path.join(here, '..', '..', 'map-app', 'dist', 'map-app.html'), 'utf8');
  return html;
}

/** The iframe may only talk to the basemap and the catalog's layer hosts. */
export function mapCsp() {
  const domains = [...new Set([...BASEMAP_ORIGINS, ...layerOrigins()])];
  return { connectDomains: domains, resourceDomains: domains };
}

export const showMap: ToolDef = {
  name: 'show_map',
  title: 'Show a map',
  description:
    'Draw an interactive map in the conversation: up to 4 catalog layers (each with an optional where filter) plus pins or shapes you supply (e.g. a geocoded address). ' +
    'The map fetches its own features, so do not pull geometry to build your own map. Only renders in apps that support MCP Apps (Claude Desktop, claude.ai).',
  inputSchema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Short title shown above the map.' },
      layers: {
        type: 'array', maxItems: 4,
        items: {
          type: 'object',
          properties: {
            layer_id: { type: 'string', description: 'A layer id from list_layers.' },
            where: { type: 'string', description: "SQL filter (default '1=1')." },
            label: { type: 'string', description: 'Legend label.' },
            color: { type: 'string', description: 'Hex colour. Omit to use the layer\'s own symbols.' },
          },
          required: ['layer_id'],
        },
      },
      graphics: {
        type: 'array', maxItems: 25,
        description: 'Pins or shapes with no layer behind them, e.g. the address being asked about.',
        items: {
          type: 'object',
          properties: {
            lng: { type: 'number' }, lat: { type: 'number' },
            geometry: { type: 'object', description: 'Alternative to lng/lat: a GeoJSON geometry in WGS84.' },
            label: { type: 'string' }, popup: { type: 'string' }, color: { type: 'string' },
          },
        },
      },
      basemap: { type: 'string', enum: BASEMAPS, description: 'Default gray.' },
      bbox: { type: 'array', items: { type: 'number' }, minItems: 4, maxItems: 4, description: '[xmin, ymin, xmax, ymax] in WGS84. Omit to fit the data.' },
    },
  },
  raw: true,
  _meta: { ui: { resourceUri: MAP_URI } },
  async run(args = {}) {
    const layers = (Array.isArray(args.layers) ? args.layers.slice(0, 4) : []).map((s: any, i: number) => {
      const l = getLayer(s.layer_id);
      return { label: s.label || l.name || `Layer ${i + 1}`, color: s.color || null, layerUrl: l.url, where: s.where || '1=1' };
    });
    const graphics = (Array.isArray(args.graphics) ? args.graphics.slice(0, 25) : [])
      .filter((g: any) => g && (g.geometry || (typeof g.lng === 'number' && typeof g.lat === 'number')));
    if (!layers.length && !graphics.length) throw new Error('show_map needs at least one layer or graphic');

    const spec = {
      title: args.title || 'Map',
      basemap: BASEMAPS.includes(args.basemap) ? args.basemap : 'gray',
      layers, graphics,
      bbox: Array.isArray(args.bbox) && args.bbox.length === 4 ? args.bbox : null,
    };
    const parts = [];
    if (layers.length) parts.push(`${layers.length} layer(s): ${layers.map((l: any) => l.label).join(', ')}`);
    if (graphics.length) parts.push(`${graphics.length} pin(s)/shape(s)`);
    return {
      content: [{ type: 'text', text: `Showing an interactive map with ${parts.join(' + ')}. (Only visible in apps that support MCP Apps.)` }],
      structuredContent: spec,
      _meta: { ui: { resourceUri: MAP_URI } },
    };
  },
};
