# Who owns the house at 4040 NE Tillamook St?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 3 tool calls, 9 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "4040 NE Tillamook St, Portland, OR"}
   - *"Owner names aren't in this data, but I can still pull the parcel's public details."*
3. `what_contains` {"lon": -122.621139, "lat": 45.537659, "layer_ids": ["taxlots", "neighborhoods", "zoning"]}

## The answer

I can't tell you who owns it. The parcel data I have access to (Oregon Metro's public tax lot layer) doesn't include owner names. It only says whether the owner is private or public, and this one is **private**.

Here's what the records show for that spot (the address matched exactly):

- **Neighborhood:** Hollywood
- **Zoning:** CM2 (Commercial Mixed Use 2) with a Design overlay
- **Tax lot:** land use "MFR" (multi-family residential). The record has no house number, and its size, year built, building size and assessed value are all zero.

That kind of record usually means the address is in a **condo or multi-unit building**. The lot I found is probably the shared or parent parcel, with each unit taxed separately. So the address may not be a single house, and each unit could have a different owner.

To get the owner's name:
- **PortlandMaps** (portlandmaps.com): search the address. It shows the owner from county assessment records.
- **Multnomah County Assessment & Taxation**: their property search shows the owner of record, and they can provide deed records.

If it's a condo, you'll need the unit number to find the right owner.
