// Offline tests of the promises the tools make to the agent. The ArcGIS
// service is replaced by a fake fetch, so these run without a network.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { whatContains } from '../dist/tools/what-contains.js';
import { describeLayer } from '../dist/tools/describe-layer.js';
import { queryNear } from '../dist/tools/query-near.js';

const realFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = realFetch; });

/** Fake ArcGIS: `handler(url)` returns the JSON body. */
function fakeArcgis(handler) {
  globalThis.fetch = async (url) => {
    const body = handler(new URL(url));
    return new Response(JSON.stringify(body), { status: 200 });
  };
}

test('what_contains: no match is an empty list', async () => {
  fakeArcgis(() => ({ features: [] }));
  const out = await whatContains.run({ lon: -122.6, lat: 45.5, layer_ids: ['city_limits'] });
  assert.deepEqual(out.results[0].matches, []);
  assert.equal(out.results[0].error, undefined);
});

test('what_contains: a failed query is an error, never an empty list', async () => {
  fakeArcgis(() => ({ error: { code: 500, message: 'boom' } }));
  const out = await whatContains.run({ lon: -122.6, lat: 45.5, layer_ids: ['city_limits'] });
  assert.ok(out.results[0].error);
  assert.equal(out.results[0].matches, undefined);
});

test('what_contains: refuses point and line layers instead of answering "inside none"', async () => {
  fakeArcgis(() => ({ features: [] }));
  const out = await whatContains.run({ lon: -122.6, lat: 45.5, layer_ids: ['cip_points', 'cip_lines'] });
  for (const r of out.results) {
    assert.match(r.error, /polygon/);
    assert.equal(r.matches, undefined);
  }
});

test('describe_layer: a capped value list is never presented as complete', async () => {
  fakeArcgis((u) => {
    if (!u.pathname.endsWith('/query')) return { name: 'x', fields: [{ name: 'ZONE', type: 'esriFieldTypeString' }] };
    if (u.searchParams.get('returnCountOnly')) return { count: 100 };
    // 16 rows (the cap + 1), one of them null: 15 non-null values would look complete.
    const vals = Array.from({ length: 15 }, (_, i) => ({ attributes: { ZONE: 'v' + i } }));
    return { features: [{ attributes: { ZONE: null } }, ...vals] };
  });
  const out = await describeLayer.run({ layer_id: 'zoning' });
  const z = out.fields.find((f) => f.name === 'ZONE');
  assert.equal(z.values, undefined);
  assert.match(z.values_note, /more than/);
});

test('query_near: features the service drops when reprojecting are still listed, without a distance', async () => {
  fakeArcgis((u) => {
    if (!u.pathname.endsWith('/query')) return { objectIdField: 'OID', fields: [] };
    const p = u.searchParams;
    if (p.get('returnCountOnly')) return { count: 3 };
    if (p.get('returnGeometry') === 'true') {
      // Only one of three comes back with coordinates.
      return { features: [{ attributes: { OID: 1, Project_Name: 'a' }, geometry: { x: -122.6, y: 45.5 } }] };
    }
    return { features: [1, 2, 3].map((i) => ({ attributes: { OID: i, Project_Name: 'abc'[i - 1] } })) };
  });
  const out = await queryNear.run({ layer_id: 'cip_points', lon: -122.6, lat: 45.5, distance: 1 });
  assert.equal(out.total, 3);
  assert.equal(out.features.length, 3);
  assert.equal(out.features[0].distance, 0);
  assert.equal(out.features[1].distance, null);
  assert.ok(out.notes.some((n) => /coordinates for only 1 of 3/.test(n)));
});

test('query_near: a missing count is an error, not "nothing nearby"', async () => {
  fakeArcgis(() => ({}));
  await assert.rejects(queryNear.run({ layer_id: 'cip_points', lon: -122.6, lat: 45.5, distance: 1 }), /count/);
});
