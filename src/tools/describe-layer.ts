import { arcgisGet } from '../arcgis.js';
import { getLayer } from '../catalog.js';
import type { ToolDef } from './types.js';

const MAX_VALUES = 15;   // list a text field's values only if it has this many or fewer
const MAX_PROBED = 10;   // how many text fields to probe for values

// Fields, types, row count, and the real values of short text fields, so the
// agent writes Status = 'Active' instead of guessing Status = 'active'.
export const describeLayer: ToolDef = {
  name: 'describe_layer',
  title: 'Describe a layer',
  description:
    'Show a layer\'s fields (name, type), how many features it has, and for short text fields the actual values that appear in the data. ' +
    'Call this before filtering with a where clause so you use real field names and real values (spelling and capitalisation matter).',
  inputSchema: {
    type: 'object',
    properties: { layer_id: { type: 'string', description: 'A layer id from list_layers.' } },
    required: ['layer_id'],
  },
  async run({ layer_id }) {
    const layer = getLayer(layer_id);
    const meta = await arcgisGet(layer.url, {});
    const count = await arcgisGet(`${layer.url}/query`, { where: '1=1', returnCountOnly: true });
    const queries = [meta.url, count.url];

    const skip = new Set(['esriFieldTypeGeometry', 'esriFieldTypeOID', 'esriFieldTypeGlobalID', 'esriFieldTypeBlob', 'esriFieldTypeRaster']);
    const fields = (meta.json.fields || [])
      .filter((f: any) => !skip.has(f.type) && !/^shape[_.]/i.test(f.name))
      .map((f: any) => ({ name: f.name, alias: f.alias !== f.name ? f.alias : undefined, type: String(f.type).replace('esriFieldType', '').toLowerCase() } as any));

    const probe = fields.filter((f: any) => f.type === 'string').slice(0, MAX_PROBED);
    await Promise.all(probe.map(async (f: any) => {
      try {
        const r = await arcgisGet(`${layer.url}/query`, {
          where: '1=1', outFields: f.name, returnDistinctValues: true, returnGeometry: false,
          orderByFields: f.name, resultRecordCount: MAX_VALUES + 1,
        });
        const vals = (r.json.features || []).map((x: any) => x.attributes[f.name]).filter((v: any) => v !== null && v !== '');
        if (vals.length <= MAX_VALUES) f.values = vals;
        else f.values_note = `more than ${MAX_VALUES} distinct values`;
      } catch {
        f.values_note = 'could not list values';
      }
    }));

    return {
      layer: layer.id,
      name: meta.json.name,
      geometry: layer.geometry,
      feature_count: count.json.count,
      description: layer.description,
      default_fields: layer.fields,
      fields,
      queries,
    };
  },
};
