# What's on the parcel at 1221 SW 4th Ave, Portland?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 4 tool calls, 12 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "1221 SW 4th Ave, Portland, OR"}
   - *"The geocoder returned two 100-score matches about 1 mile apart, so I'll check both."*
3. `what_contains` {"lon": -122.678879, "lat": 45.514941, "layer_ids": ["taxlots", "zoning", "neighborhoods", "council_districts"]}
4. `what_contains` {"lon": -122.682061, "lat": 45.501088, "layer_ids": ["taxlots", "zoning", "neighborhoods"]}

## The answer

That address is almost certainly **Portland City Hall**, a city-owned building that covers a full downtown block.

**The parcel** (from the `taxlots` layer):
| | |
|---|---|
| Address on the tax lot | 1220 SW 5th Ave. The lot runs through the block, so its official address is on the 5th Ave side. |
| Land use | Commercial (COM), property code 201 |
| Building | 87,544 sq ft, built 1893 |
| Lot size | 0.92 acres |
| Assessed total value | $26,462,540 |
| Owner type | City (owner names aren't in this public layer) |

**Context:**
- **Zoning:** CX (Central Commercial) with a "d" Design overlay
- **Neighborhood:** Portland Downtown
- **Council district:** 4

**One thing to check:** the geocoder returned two exact matches (score 100) for this address, about a mile apart. The other one, in South Portland, lands on a small city-owned lot with no building and no site number (0.28 acres, zoned Open Space, assessed at $2,840). That looks like a bad geocoder result, so I went with the downtown match. The data doesn't name the building as City Hall; that comes from my own knowledge, which also matches its city ownership, location and age. City Hall's commonly cited completion date is 1895, but the tax lot says 1893.

I didn't look up capital projects near the site. I can do that if it would help.
