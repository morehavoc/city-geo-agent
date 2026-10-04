import { arcgisGet } from '../arcgis.js';
import { getLayer } from '../catalog.js';
import type { ToolDef } from './types.js';

const MAX_VALUES = 15;   // list a text field's values only if it has this many or fewer
const MAX_PROBED = 12;   // how many text fields to probe for values
const PARALLEL = 4;      // probes at once; big layers are slow to answer distinct-value queries
const PROBE_TIMEOUT_MS = 30_000;

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

    // Probe the catalog's key fields (or, with none listed, the first text
    // fields). Distinct-value queries are slow on big layers, so we don't probe
    // everything; summarize with group_by lists any field's values on demand.
    const key = new Set(layer.fields || []);
    const probe = fields
      .filter((f: any) => f.type === 'string' && (key.size === 0 || key.has(f.name)))
      .slice(0, MAX_PROBED);
    const probeOne = async (f: any) => {
      try {
        // Ask for one more than we will list. Judge "complete" on the raw rows
        // BEFORE dropping blanks, or a capped list can pass for the full one.
        const r = await arcgisGet(`${layer.url}/query`, {
          where: '1=1', outFields: f.name, returnDistinctValues: true, returnGeometry: false,
          orderByFields: f.name, resultRecordCount: MAX_VALUES + 1,
        }, PROBE_TIMEOUT_MS);
        const raw = r.json.features || [];
        if (raw.length > MAX_VALUES || r.json.exceededTransferLimit) {
          f.values_note = `more than ${MAX_VALUES} distinct values; not listed (summarize with group_by can count them)`;
          return;
        }
        f.values = raw.map((x: any) => x.attributes[f.name]).filter((v: any) => v !== null && v !== '');
        if (f.values.length < raw.length) f.values_note = 'also has blank/null values';
      } catch {
        f.values_note = 'could not list values (the service did not answer in time)';
      }
    };
    for (let i = 0; i < probe.length; i += PARALLEL) await Promise.all(probe.slice(i, i + PARALLEL).map(probeOne));
    for (const f of fields) if (f.type === 'string' && !probe.includes(f)) f.values_note = 'values not checked (use summarize with group_by to list them)';

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
