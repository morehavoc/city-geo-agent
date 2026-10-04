// Inlines Leaflet, esri-leaflet and the MCP Apps SDK into one HTML file
// (map-app/dist/map-app.html). MCP App hosts sandbox the map in an iframe with
// a strict CSP, so nothing can load from a CDN at runtime. Run after editing
// map-app/map-app.html:  npm run build:map
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'map-app');
const read = (f) => readFileSync(path.join(root, f), 'utf8');
const html = read('map-app.html')
  .replace('/*__LEAFLET_CSS__*/', () => read('vendor/leaflet.css'))
  .replace('/*__LEAFLET_JS__*/', () => read('vendor/leaflet.vendor.js'))
  .replace('/*__ESRI_LEAFLET_JS__*/', () => read('vendor/esri-leaflet.vendor.js'))
  .replace('/*__ESRI_LEAFLET_RENDERERS_JS__*/', () => read('vendor/esri-leaflet-renderers.vendor.js'))
  .replace('/*__APP_SDK_JS__*/', () => read('vendor/app-sdk.vendor.js'));
mkdirSync(path.join(root, 'dist'), { recursive: true });
writeFileSync(path.join(root, 'dist', 'map-app.html'), html);
console.log(`built map-app/dist/map-app.html (${html.length} bytes)`);
