# city-geo-agent

A small MCP server that lets an AI agent answer everyday city GIS questions using public ArcGIS layers:

- "Is this address inside city limits, and what's it zoned?"
- "What's on this parcel?"
- "What is the city building within a mile of the Hollywood Library?"

Plug it into Claude Code, Claude Desktop, VS Code (GitHub Copilot) or ChatGPT. The AI app runs the loop: it reads your question, picks a tool, reads the result, and decides whether it needs another tool before it answers.

**No sign-in, no API key.** It ships with a catalog of public Portland, Oregon layers. Swap in your own catalog to point it at your city.

Built for an episode of [Almost Entirely Human](https://christophermoravec.com). Not affiliated with or endorsed by Esri.

## The tools

An agent can only work with what its tools let it see, so the first two tools are for *discovery*: what data exists, and what is in it.

| Tool | What it does |
|---|---|
| `list_layers` | Lists the layers in the catalog, each with a plain-language description. No network call: this is the agent's only map of what exists. |
| `describe_layer` | A layer's fields, feature count, and the actual values in its short text fields, so the agent filters on `Status = 'Active'` instead of guessing. |
| `geocode` | Address or place name → longitude/latitude, with up to 3 scored candidates so ambiguity is visible. Uses Esri's World Geocoder anonymously. |
| `what_contains` | Which features a point falls inside, in each layer you name (city limits, zoning, district, parcel). An empty `matches` array means "inside none"; a layer that could not be queried returns `error` instead, never `[]`. |
| `query_near` | Features within a distance of a point, with an optional SQL filter. Returns the total count and the nearest features with their distance. |
| `summarize` | Count, sum, average, min or max, grouped by a field, optionally within a radius. Computed by the server, so it covers every feature. |
| `show_map` | Bonus: draws an interactive map in the chat (MCP Apps, in Claude Desktop and claude.ai). |

Every result includes `queries`: the exact ArcGIS REST URLs the tool called. Paste one into a browser to check the agent's work.

## Install

Requires Node 20+.

```
git clone https://github.com/morehavoc/city-geo-agent.git
cd city-geo-agent
npm install        # also builds dist/
```

**Claude Code**

```
claude mcp add city-geo -- node /path/to/city-geo-agent/dist/stdio.js
```

**Claude Desktop**: Settings → Developer → Edit Config, then add:

```json
{
  "mcpServers": {
    "city-geo": { "command": "node", "args": ["/path/to/city-geo-agent/dist/stdio.js"] }
  }
}
```

**VS Code (Copilot agent mode)**: add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "city-geo": { "type": "stdio", "command": "node", "args": ["/path/to/city-geo-agent/dist/stdio.js"] }
  }
}
```

**ChatGPT, or a claude.ai custom connector**: these need a URL. Run the HTTP server somewhere public:

```
PORT=3000 npm run serve     # MCP endpoint at http://<host>:3000/mcp
```

then add `https://<your-host>/mcp` as a connector. It is stateless and read-only, so it needs no login.

## Use your own city

The catalog is a JSON file: one entry per layer, with a description written by a person. Copy `catalogs/portland.json`, replace the layers with your own public feature or map service layers, and point the server at it:

```
CITY_GEO_CATALOG=/path/to/my-city.json node dist/stdio.js
```

```json
{
  "name": "My City (public data)",
  "center": [-122.66, 45.53],
  "layers": [
    {
      "id": "zoning",
      "name": "Zoning",
      "url": "https://.../MapServer/16",
      "geometry": "polygon",
      "description": "Base zoning. ZONE is the code (e.g. R5) and ZONE_DESC says what it means.",
      "fields": ["ZONE", "ZONE_DESC"]
    }
  ]
}
```

The descriptions are the real work. The agent knows nothing about your data except what they say: which layer answers which question, what the fields mean, and quirks such as "projects are split across three layers, query all three."

## Check it works

```
npm test          # offline unit tests
npm run smoke     # live: calls every tool against the Portland services
```

## Limits

- Read-only. It cannot edit data.
- Public layers only. Nothing here handles sign-in.
- The anonymous geocoder is for looking things up, not for storing results (Esri's terms).
- The answers are only as good as the source data. `describe_layer` will show you, for example, that Portland's project layer spells its status both `Active` and `ACTIVE`.

## Credits

The map uses [Leaflet](https://leafletjs.com) (BSD-2-Clause), [Esri Leaflet](https://github.com/Esri/esri-leaflet) and esri-leaflet-renderers (Apache-2.0), bundled in `map-app/vendor/`. Basemaps © Esri and its data providers. Portland data: City of Portland and Oregon Metro (RLIS).

MIT License.
