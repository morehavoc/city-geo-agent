// Live check against the real Portland services: starts the server over
// stdio like an AI app would, and calls every tool once. Needs the network.
//   npm run build && npm run smoke
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import assert from 'node:assert/strict';

const client = new Client({ name: 'smoke', version: '0' });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ['dist/stdio.js'] }));

async function call(name, args = {}) {
  const r = await client.callTool({ name, arguments: args });
  if (r.isError) throw new Error(`${name}: ${r.content[0].text}`);
  return r.structuredContent;
}
const ok = (msg) => console.log('ok  ', msg);

const { tools } = await client.listTools();
assert.deepEqual(tools.map((t) => t.name).sort(), ['describe_layer', 'geocode', 'list_layers', 'query_near', 'show_map', 'summarize', 'what_contains']);
ok(`${tools.length} tools listed`);

const layers = await call('list_layers');
assert.ok(layers.layers.find((l) => l.id === 'cip_points'));
ok(`list_layers: ${layers.layers.length} layers`);

const desc = await call('describe_layer', { layer_id: 'cip_points' });
const status = desc.fields.find((f) => f.name === 'Status');
assert.ok(status && Array.isArray(status.values) && status.values.length > 0);
ok(`describe_layer cip_points: ${desc.feature_count} features, Status values ${JSON.stringify(status.values)}`);

const geo = await call('geocode', { text: 'Hollywood Library, Portland, OR' });
assert.ok(geo.candidates.length > 0);
const p = geo.candidates[0];
ok(`geocode: ${p.address} (${p.lon}, ${p.lat}) score ${p.score}`);

const inside = await call('what_contains', { lon: p.lon, lat: p.lat, layer_ids: ['city_limits', 'council_districts', 'zoning', 'neighborhoods'] });
for (const r of inside.results) assert.ok(Array.isArray(r.matches), `${r.layer}: ${r.error}`);
ok(`what_contains: ${inside.results.map((r) => `${r.layer}=${JSON.stringify(r.matches.map((m) => Object.values(m)[0]))}`).join(' ')}`);

const nowhere = await call('what_contains', { lon: -122.95, lat: 45.75, layer_ids: ['city_limits'] });
assert.deepEqual(nowhere.results[0].matches, []);
ok('what_contains outside every city: matches = []');

const bad = await call('what_contains', { lon: p.lon, lat: p.lat, layer_ids: ['no_such_layer'] });
assert.ok(bad.results[0].error && !('matches' in bad.results[0]));
ok('what_contains unknown layer: error, not []');

const near = await call('query_near', { layer_id: 'cip_lines', lon: p.lon, lat: p.lat, distance: 1, units: 'miles' });
assert.ok(near.total >= near.returned);
for (let i = 1; i < near.features.length; i++) assert.ok(near.features[i - 1].distance <= near.features[i].distance);
ok(`query_near cip_lines 1 mi: ${near.total} total; nearest "${near.features[0]?.Project_Name}" at ${near.features[0]?.distance} mi`);

const sum = await call('summarize', { layer_id: 'cip_lines', group_by: 'Bureau_Name', near: { lon: p.lon, lat: p.lat, distance: 1 } });
const sumTotal = sum.groups.reduce((a, g) => a + g.count, 0);
assert.equal(sumTotal, near.total);
ok(`summarize by bureau within 1 mi: ${JSON.stringify(sum.groups)} (adds up to query_near's ${near.total})`);

const cost = await call('summarize', { layer_id: 'cip_points', stat: 'sum', field: 'Estimated_Total_Project_Cost', group_by: 'Status' });
ok(`summarize cost by Status: ${JSON.stringify(cost.groups)}`);

const map = await client.callTool({ name: 'show_map', arguments: { title: 'test', layers: [{ layer_id: 'cip_lines' }], graphics: [{ lng: p.lon, lat: p.lat, label: 'here' }] } });
assert.ok(!map.isError && map.structuredContent.layers[0].layerUrl.includes('portlandmaps'));
const res = await client.readResource({ uri: 'ui://city-geo-agent/map-v1' });
assert.ok(res.contents[0].text.length > 100000);
assert.ok(res.contents[0]._meta.ui.csp.connectDomains.includes('https://www.portlandmaps.com'));
ok(`show_map spec ok; map app ${res.contents[0].text.length} bytes; CSP ${res.contents[0]._meta.ui.csp.connectDomains.join(' ')}`);

await client.close();
console.log('all live checks passed');
