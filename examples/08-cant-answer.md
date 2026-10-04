# Who owns 4040 NE Tillamook St?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 4 tool calls, 13 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "4040 NE Tillamook St, Portland, OR"}
   - *"Owner names aren't in the layer, but I can pull the parcel's public-ownership flags."*
3. `what_contains` {"lon": -122.621139, "lat": 45.537659, "layer_ids": ["taxlots"]}
4. `query_near` {"layer_id": "taxlots", "lon": -122.621139, "lat": 45.537659, "distance": 150, "units": "feet", "limit": 10}

## The answer

I can't give you the owner's name. The public tax lot layer (Oregon Metro RLIS `taxlots`) doesn't include owner names. It does show the **ownership type**, and for this address that's **COUNTY**, so it's publicly owned rather than private.

The address geocoded cleanly (score 100, at -122.6211, 45.5377). The tax lot record for **4040 NE Tillamook St** shows:

| Field | Value |
|---|---|
| Ownership type | **COUNTY** |
| Land use | MFR (multifamily residential) |
| Property code | 202 |
| Year built | 2002 |
| Building sq ft | 12,960 |
| Total assessed value | $4,522,080 |
| Acres | 0 (listed as zero) |

**Things to be aware of:**
- **Which county agency?** "COUNTY" could mean Multnomah County itself or a county housing body like Home Forward. A county-owned multifamily building from 2002 suggests affordable or supportive housing, but that's my guess, not something the data says.
- **The parcel is split into pieces.** The lot is listed as 0 acres, and there are about 98 tax lot records within 150 ft. That's typical of a condo or stacked-lot setup. The exact geocoded point falls on a separate record with no house number and $0 value, marked PRIVATE. That's probably a shared common area, so other parts of the site may have different ownership types.
- **For the actual owner name**, look up the address on **PortlandMaps.com** or the **Multnomah County Assessor** property search. Both show the owner of record.
