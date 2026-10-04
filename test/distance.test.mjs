import { test } from 'node:test';
import assert from 'node:assert/strict';
import { distanceMeters } from '../dist/distance.js';

const o = [-122.6, 45.5];
test('point distance ~ 1 km east', () => {
  const lonPerKm = 1 / (111.195 * Math.cos(45.5 * Math.PI / 180));
  const d = distanceMeters(o, { x: o[0] + lonPerKm, y: o[1] });
  assert.ok(Math.abs(d - 1000) < 5, String(d));
});
test('inside a polygon is 0', () => {
  const ring = [[-122.61, 45.49], [-122.59, 45.49], [-122.59, 45.51], [-122.61, 45.51], [-122.61, 45.49]];
  assert.equal(distanceMeters(o, { rings: [ring] }), 0);
});
test('inside a hole is not 0', () => {
  const outer = [[-122.62, 45.48], [-122.58, 45.48], [-122.58, 45.52], [-122.62, 45.52], [-122.62, 45.48]];
  const hole = [[-122.601, 45.499], [-122.599, 45.499], [-122.599, 45.501], [-122.601, 45.501], [-122.601, 45.499]];
  assert.ok(distanceMeters(o, { rings: [outer, hole] }) > 50);
});
test('line distance measures to the segment, not the vertices', () => {
  const d = distanceMeters(o, { paths: [[[-122.7, 45.501], [-122.5, 45.501]]] });
  assert.ok(Math.abs(d - 111.2) < 2, String(d));
});
test('missing geometry is null, not 0', () => {
  assert.equal(distanceMeters(o, null), null);
  assert.equal(distanceMeters(o, { rings: [] }), null);
});
