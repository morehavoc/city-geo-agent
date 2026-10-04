# What's on the parcel at 1221 SW 4th Ave, Portland?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 4 tool calls, 13 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "1221 SW 4th Ave, Portland, OR"}
   - *"The geocoder returned two 100-score matches about 1 km apart, so I'll check both."*
3. `what_contains` {"lon": -122.678879, "lat": 45.514941, "layer_ids": ["taxlots", "zoning", "neighborhoods", "council_districts"]}
4. `what_contains` {"lon": -122.682061, "lat": 45.501088, "layer_ids": ["taxlots", "zoning"]}

## The answer

That address is the full-block downtown parcel between SW 4th and SW 5th, almost certainly **Portland City Hall**.

**Which point I used:** The geocoder gave two perfect-score (100) matches about 1 km apart. The downtown one (‑122.6789, 45.5149) is the real match. The other, near ‑122.6821, 45.5011, lands on a vacant city-owned open-space lot that has no street number (it's listed only as "SW 4TH AVE"). That looks like a geocoder error, so I set it aside.

**The parcel (`taxlots` layer, Oregon Metro):**
| Field | Value |
|---|---|
| Site address on record | **1220 SW 5th Ave**. The lot covers the whole block, so 1221 SW 4th is its other street frontage. |
| Land use | Commercial (COM), property code 201 |
| Lot size | 0.92 acres |
| Building | 87,544 sq ft, year built recorded as 1893 |
| Total assessed value | $26,462,540 |
| Owner type | City (publicly owned) |

**Context:**
- **Zoning:** CX (Central Commercial) with a "d" Design overlay. The Comprehensive Plan designation is Central Commercial (`zoning` layer).
- **Neighborhood:** Portland Downtown (`neighborhoods` layer).
- **Council district:** District 4 (`council_districts` layer).

**Limits:** This public tax-lot layer has no owner names or building names. The data only shows a city-owned commercial building of about 87,500 sq ft. Calling it City Hall comes from my own general knowledge that 1221 SW 4th Ave is City Hall, not from the data. Also, City Hall is usually dated to 1895, so the 1893 year built in the assessor data may be off. If you need either point confirmed, check portlandmaps.com.
