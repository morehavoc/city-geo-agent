import { loadCatalog } from '../catalog.js';
import type { ToolDef } from './types.js';

// No network call: this just reads the catalog a person wrote. It is the
// agent's only way to know what data exists, so the descriptions do the work.
export const listLayers: ToolDef = {
  name: 'list_layers',
  title: 'List available layers',
  description:
    'List every GIS layer this server can query, with a plain-language description of what each one holds and which fields matter. ' +
    'Call this first: it is the only way to know what data exists. Use the layer ids it returns with the other tools.',
  inputSchema: { type: 'object', properties: {} },
  async run() {
    const cat = loadCatalog();
    return {
      catalog: cat.name,
      about: cat.about,
      layers: cat.layers.map((l) => ({ id: l.id, name: l.name, geometry: l.geometry, description: l.description })),
    };
  },
};
