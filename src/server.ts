// The MCP server: a list of tools and a dispatcher. The AI app on the other
// end (Claude, ChatGPT, Copilot...) runs the loop: it reads the question,
// picks a tool, reads the result, and decides whether to call another.
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema, ListToolsRequestSchema,
  ListResourcesRequestSchema, ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { loadCatalog } from './catalog.js';
import type { ToolDef } from './tools/types.js';
import { listLayers } from './tools/list-layers.js';
import { describeLayer } from './tools/describe-layer.js';
import { geocode } from './tools/geocode.js';
import { whatContains } from './tools/what-contains.js';
import { queryNear } from './tools/query-near.js';
import { summarize } from './tools/summarize.js';
import { showMap, MAP_URI, mapAppHtml, mapCsp } from './tools/show-map.js';

export const TOOLS: ToolDef[] = [listLayers, describeLayer, geocode, whatContains, queryNear, summarize, showMap];

const INSTRUCTIONS =
  'Answers questions about a city using its public GIS layers. Work in this order: ' +
  'list_layers to see what data exists; describe_layer before filtering, so field names and values are real; ' +
  'geocode to turn an address or place into a point; then what_contains, query_near or summarize. ' +
  'Every result includes the exact queries it ran (queries); cite the layer you used and mention anything you could not check. ' +
  'All tools are read-only.';

export function createServer(): Server {
  const cat = loadCatalog();
  const server = new Server(
    { name: 'city-geo-agent', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {} }, instructions: `${INSTRUCTIONS} Data: ${cat.name}.` },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS.map((t) => ({
      name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema,
      annotations: { title: t.title, readOnlyHint: true, openWorldHint: true },
      ...(t._meta ? { _meta: t._meta } : {}),
    })),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const tool = TOOLS.find((t) => t.name === req.params.name);
    if (!tool) return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${req.params.name}` }] };
    try {
      const out: any = await tool.run(req.params.arguments || {});
      if (tool.raw) return out;
      return { content: [{ type: 'text', text: JSON.stringify(out, null, 1) }], structuredContent: out };
    } catch (e: any) {
      return { isError: true, content: [{ type: 'text', text: `${tool.name} failed: ${e?.message || String(e)}` }] };
    }
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [{ uri: MAP_URI, name: 'map', description: 'Interactive map for show_map', mimeType: 'text/html;profile=mcp-app' }],
  }));
  server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
    if (req.params.uri !== MAP_URI) throw new Error(`Unknown resource: ${req.params.uri}`);
    return {
      contents: [{
        uri: MAP_URI, mimeType: 'text/html;profile=mcp-app', text: mapAppHtml(),
        _meta: { ui: { csp: mapCsp(), prefersBorder: true } },
      }],
    };
  });

  return server;
}
