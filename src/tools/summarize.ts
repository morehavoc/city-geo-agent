import { arcgisGet, checkLonLat, nearParams, UNITS } from '../arcgis.js';
import { getLayer } from '../catalog.js';
import type { ToolDef } from './types.js';

const STATS = ['count', 'sum', 'avg', 'min', 'max'];
const MAX_GROUPS = 100;

// "How many / how much, by X?" The ArcGIS server does the maths, so there is
// no row limit: we only ever receive one row per group.
export const summarize: ToolDef = {
  name: 'summarize',
  title: 'Count or total features by group',
  description:
    'Count features, or sum/average/min/max a numeric field, grouped by another field (e.g. projects by Bureau_Name, total cost by Status). ' +
    'Optionally filter with a where clause and/or limit to a radius around a point. Computed by the server, so it covers every feature, not a sample.',
  inputSchema: {
    type: 'object',
    properties: {
      layer_id: { type: 'string', description: 'A layer id from list_layers.' },
      group_by: { type: 'string', description: 'Field to group by. Omit for a single overall figure.' },
      stat: { type: 'string', enum: STATS, description: 'Statistic. Default count.' },
      field: { type: 'string', description: 'Numeric field for sum/avg/min/max. Not needed for count.' },
      where: { type: 'string', description: 'Optional SQL filter.' },
      near: {
        type: 'object',
        description: 'Optional: only features within this distance of a point.',
        properties: {
          lon: { type: 'number' }, lat: { type: 'number' },
          distance: { type: 'number', exclusiveMinimum: 0 },
          units: { type: 'string', enum: Object.keys(UNITS) },
        },
        required: ['lon', 'lat', 'distance'],
      },
    },
    required: ['layer_id'],
  },
  async run({ layer_id, group_by, stat = 'count', field, where = '1=1', near }) {
    const layer = getLayer(layer_id);
    if (!STATS.includes(stat)) throw new Error(`stat must be one of ${STATS.join(', ')}`);
    const queries: string[] = [];

    let onField = field;
    if (stat === 'count' && !onField) {
      const meta = await arcgisGet(layer.url, {});
      queries.push(meta.url);
      onField = meta.json.objectIdField || (meta.json.fields || []).find((f: any) => f.type === 'esriFieldTypeOID')?.name;
      if (!onField) throw new Error('Could not find an id field to count on; pass field explicitly.');
    }
    if (!onField) throw new Error(`stat "${stat}" needs a numeric field`);

    let spatial = {};
    if (near) {
      checkLonLat(near.lon, near.lat);
      spatial = nearParams(near.lon, near.lat, near.distance, near.units || 'miles');
    }

    const outName = 'value';
    const r = await arcgisGet(`${layer.url}/query`, {
      where, ...spatial,
      outStatistics: JSON.stringify([{ statisticType: stat, onStatisticField: onField, outStatisticFieldName: outName }]),
      groupByFieldsForStatistics: group_by,
      returnGeometry: false,
    });
    queries.push(r.url);

    const all = (r.json.features || []).map((f: any) => {
      const a = f.attributes;
      // Some services upper-case the alias; find it either way.
      const key = Object.keys(a).find((k) => k.toLowerCase() === outName) as string;
      return group_by ? { [group_by]: a[group_by] ?? a[Object.keys(a).find((k) => k.toLowerCase() === group_by.toLowerCase()) as string], [stat]: a[key] } : { [stat]: a[key] };
    });
    // Sorted here rather than with orderByFields: some services reject
    // orderByFields combined with a distance filter and grouping.
    all.sort((a: any, b: any) => (b[stat] ?? -Infinity) - (a[stat] ?? -Infinity));
    const groups = all.slice(0, MAX_GROUPS);
    return {
      layer: layer.id, stat, field: stat === 'count' ? undefined : onField, group_by, where,
      ...(near ? { near: { ...near, units: near.units || 'miles' } } : {}),
      groups,
      ...(all.length > MAX_GROUPS ? { notes: [`${all.length} groups; showing the largest ${MAX_GROUPS}.`] } : {}),
      queries,
    };
  },
};
