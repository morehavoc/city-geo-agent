# city-geo-agent

Most of what people ask a city GIS team for is a lookup. Is this address inside city limits? What's it zoned? What are we building near the library? The answer is usually already in a web map they could open, but they don't, because the map is busy, or complicated, or they'd have to learn it.

An agent means they don't have to learn it. This is a small MCP server that lets an AI agent answer those questions from a city's public ArcGIS layers, with guardrails that keep the answers checkable:

- "Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned?"
- "What's on the parcel at 1221 SW 4th Ave?"
- "I have a town hall at the Hollywood Library on Thursday. What is the city building within a mile of it?"

Plug it into Claude Code, Claude Desktop or VS Code (GitHub Copilot). The AI app runs the loop: it reads your question, picks a tool, reads the result, and decides whether it needs another tool before it answers.

**No sign-in, no API key.** It ships with a catalog of public Portland, Oregon layers. Swap in your own catalog to point it at your city.

> **This is not production code.** It's a working example built for a newsletter episode: no authentication, no rate limiting, no logging, and answers that a person who knows the data should check before they are used for anything official. Use it to learn and to prototype.

Built for [Almost Entirely Human](https://christophermoravec.com). Not affiliated with or endorsed by Esri.

## Quick start

You need [Node.js](https://nodejs.org) 20 or newer and [Claude Code](https://claude.com/claude-code).

```
git clone https://github.com/morehavoc/city-geo-agent.git
cd city-geo-agent
npm install
claude mcp add city-geo -- node "$(pwd)/dist/stdio.js"
claude "Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned?"
```

`npm install` also builds the server. `claude mcp add` registers it for this folder only; add `--scope user` to use it from anywhere. On Windows (Command Prompt), replace `"$(pwd)/dist/stdio.js"` with the full path, e.g. `"C:\Users\you\city-geo-agent\dist\stdio.js"`. Claude Code asks permission the first time it uses each tool. Check it works with `npm run smoke`, which calls every tool against the live Portland data.

- **[examples/](examples/)**: nine real questions, every tool call the agent made, and its answers, including one it got only partly right and two it couldn't answer.
- **[BUILD-IT-YOURSELF.md](BUILD-IT-YOURSELF.md)**: the prompts to give Claude Code to build one like this for your own city.

## The tools

An agent can only work with what its tools let it see, so the first two tools are for *discovery*: what data exists, and what is in it.

| Tool | What it does |
|---|---|
| `list_layers` | Lists the layers in the catalog, each with a plain-language description. No network call: this is the agent's only map of what exists. |
| `describe_layer` | A layer's fields, feature count, and the actual values of its key text fields (when there are 15 or fewer), so the agent filters on `Status = 'Active'` instead of guessing. |
| `geocode` | Address or place name → longitude/latitude, with up to 3 scored candidates so ambiguity is visible. Uses Esri's World Geocoder anonymously. |
| `what_contains` | Which features a point falls inside, in each polygon layer you name (city limits, zoning, district, parcel). An empty `matches` array means "inside none"; a layer that could not be queried, or isn't a polygon layer, returns `error` instead, never `[]`. |
| `query_near` | Features within a distance of a point, with an optional SQL filter. Returns the total count and the nearest features with their distance. |
| `summarize` | Count, sum, average, min or max, grouped by a field, optionally within a radius. Computed by the server over every matching feature. It counts features, so a project mapped as several features counts several times. |
| `show_map` | Bonus: draws an interactive map in the chat (MCP Apps, in Claude Desktop and claude.ai). |

Every result includes `queries`: the exact ArcGIS REST URLs the tool called. Paste one into a browser to check the agent's work.

## Connect it to other apps

Claude Code is covered in the quick start. Use the full path to `dist/stdio.js` in place of `/path/to/city-geo-agent` below.

**Claude Desktop**: Settings → Developer → Edit Config, then add:

```json
{
  "mcpServers": {
    "city-geo": { "command": "node", "args": ["/path/to/city-geo-agent/dist/stdio.js"] }
  }
}
```

Restart Claude Desktop. This is the app where `show_map` draws its map.

**VS Code (Copilot agent mode)**: add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "city-geo": { "type": "stdio", "command": "node", "args": ["/path/to/city-geo-agent/dist/stdio.js"] }
  }
}
```

**Apps that need a URL** (ChatGPT, claude.ai custom connectors): `npm run serve` starts the same tools over HTTP at `http://localhost:3000/mcp`. You'd have to host it somewhere public yourself; read the warning at the top first.

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

## What's in the repo

- `src/tools/`: one file per tool. Start with `what-contains.ts`; it's the shortest.
- `src/server.ts`: the MCP server: the tool list and the instructions the agent gets.
- `catalogs/portland.json`: the layers and their descriptions.
- `map-app/`: the interactive map behind `show_map` (Leaflet, bundled into one HTML file).
- `examples/`: real runs.

## Limits

- Not production code (see the top). Read-only: it cannot edit data.
- Public layers only. Nothing here handles sign-in.
- The anonymous geocoder is for looking things up, not for storing results (Esri's terms).
- Each tool call hits the city's live services. Some are slow: `describe_layer` on the Metro tax lots takes about 25 seconds.
- The answers are only as good as the source data. `describe_layer` will show you, for example, that Portland's project layer spells its status both `Active` and `ACTIVE`.

## Credits

The map uses [Leaflet](https://leafletjs.com) (BSD-2-Clause), [Esri Leaflet](https://github.com/Esri/esri-leaflet) and esri-leaflet-renderers (Apache-2.0), bundled in `map-app/vendor/`. The MCP Apps SDK (`@modelcontextprotocol/ext-apps`) and zod are bundled too. License texts: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Basemaps © Esri and its data providers. Portland data: City of Portland and Oregon Metro (RLIS).

MIT License.
