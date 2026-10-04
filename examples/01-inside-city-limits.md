# Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 4 tool calls, 15 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "4040 NE Tillamook St, Portland, OR"}
3. `what_contains` {"lon": -122.621139, "lat": 45.537659, "layer_ids": ["city_limits", "zoning", "taxlots", "neighborhoods"]}
4. `query_near` {"layer_id": "zoning", "lon": -122.621139, "lat": 45.537659, "distance": 100, "units": "feet", "fields": ["ZONE", "ZONE_DESC", "OVRLY"]}

## The answer

Yes, it's inside Portland city limits, and it's zoned **CM2 (Commercial Mixed Use 2)** with a **"d" Design overlay**.

- **Address match:** "4040 NE Tillamook St, Portland, OR 97212" matched exactly (score 100), at -122.621139, 45.537659.
- **City limits:** The point falls inside the Portland polygon in the `city_limits` layer.
- **Zoning** (`zoning` layer):
  - Base zone: CM2, Commercial Mixed Use 2
  - Overlay: d, Design
  - Comprehensive Plan designation: Mixed Use – Urban Center
- **Neighborhood:** Hollywood, in the Central Northeast Neighbors coalition.

**Two things to check:**
1. **A different zone is close by.** CM1 (Commercial Mixed Use 1, also with the Design overlay) starts about 46 ft from the point. The geocoder places an address point near the building, not exactly on the lot lines. So part of the property could be CM1. For an official answer, look up the parcel on portlandmaps.com or ask the Bureau of Development Services.
2. **The parcel record looks incomplete.** The tax lot under the point shows "NE TILLAMOOK ST" with no house number, 0 acres and $0 value. Its land use code is MFR, which means multifamily. This often happens with condo developments, where the common-area lot sits on top of the individual unit records. It's likely a multifamily or condo building, but I couldn't confirm the details from this layer.
