# Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 3 tool calls, 10 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "4040 NE Tillamook St, Portland, OR"}
3. `what_contains` {"lon": -122.621139, "lat": 45.537659, "layer_ids": ["city_limits", "zoning", "taxlots"]}

## The answer

Yes, it's inside Portland city limits, and it's zoned **CM2 (Commercial Mixed Use 2)** with a **"d" Design overlay**.

**What I found**

The address geocoded to one exact match (score 100: 4040 NE Tillamook St, Portland 97212, at -122.621139, 45.537659). I then checked which areas that point falls inside:

| Check | Result |
|---|---|
| City limits (`city_limits`) | **Portland** |
| Base zone (`zoning`) | **CM2, Commercial Mixed Use 2** |
| Overlay | **d, Design** (new building and exterior changes generally need design review or must meet design standards) |
| Comprehensive Plan | Mixed Use, Urban Center |

**Limitations**

- **The tax lot record looks like a placeholder.** The parcel at that point lists the address only as "NE TILLAMOOK ST" (no house number), with land use multi-family, private ownership, and $0 values, 0 acres and 0 sq ft. That pattern often means a condo common-area lot, where the individual units are recorded separately. So I couldn't confirm the building details from this layer.
- **I checked one point, not the whole parcel.** If the lot lies across a zone boundary, part of it could be zoned differently. For anything official, like permits or a sale, confirm on portlandmaps.com or with the Bureau of Development Services.
