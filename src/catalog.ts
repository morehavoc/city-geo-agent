// The catalog is the agent's only map of what data exists. It is a plain JSON
// file a person writes: one entry per layer, with a description in words.
// Point CITY_GEO_CATALOG at your own file to use your own layers.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export interface CatalogLayer {
  id: string;
  name: string;
  url: string;
  geometry: 'point' | 'line' | 'polygon';
  description: string;
  /** Fields returned by default. Omit to return every field. */
  fields?: string[];
}

export interface Catalog {
  name: string;
  about?: string;
  /** [lon, lat] used to bias the geocoder toward this area. */
  center?: [number, number];
  layers: CatalogLayer[];
}

const here = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CATALOG = path.join(here, '..', 'catalogs', 'portland.json');

let cached: Catalog | null = null;

export function loadCatalog(): Catalog {
  if (cached) return cached;
  const file = process.env.CITY_GEO_CATALOG || DEFAULT_CATALOG;
  const cat = JSON.parse(readFileSync(file, 'utf8')) as Catalog;
  if (!cat || !Array.isArray(cat.layers) || cat.layers.length === 0) {
    throw new Error(`Catalog ${file} has no layers.`);
  }
  const seen = new Set<string>();
  for (const l of cat.layers) {
    if (!l.id || !l.url || !l.description) throw new Error(`Catalog layer is missing id, url or description: ${JSON.stringify(l)}`);
    if (seen.has(l.id)) throw new Error(`Duplicate layer id in catalog: ${l.id}`);
    seen.add(l.id);
  }
  cached = cat;
  return cat;
}

export function getLayer(id: string): CatalogLayer {
  const layer = loadCatalog().layers.find((l) => l.id === id);
  if (!layer) {
    const ids = loadCatalog().layers.map((l) => l.id).join(', ');
    throw new Error(`Unknown layer "${id}". Call list_layers to see what exists. Known ids: ${ids}`);
  }
  return layer;
}

/** Origins the map app must be allowed to fetch from (one per layer host). */
export function layerOrigins(): string[] {
  return [...new Set(loadCatalog().layers.map((l) => new URL(l.url).origin))];
}
