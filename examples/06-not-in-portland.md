# Is 15000 SE Sunnyside Rd in the City of Portland?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 4 tool calls, 11 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "15000 SE Sunnyside Rd, Portland, OR"}
3. `what_contains` {"lon": -122.508782, "lat": 45.424848, "layer_ids": ["city_limits", "taxlots"]}
4. `query_near` {"layer_id": "taxlots", "lon": -122.508782, "lat": 45.424848, "distance": 300, "units": "feet", "limit": 5}

## The answer

No, 15000 SE Sunnyside Rd is not in the City of Portland. It's in Clackamas County, about 9 miles southeast of downtown. It's probably in **Happy Valley**, but it sits close to a boundary, so that part isn't certain.

**What I found:**
- **Address lookup:** The address matched "15000 SE Sunnyside Rd, Clackamas, OR 97015" with a score of 98/100. Even though I asked for Portland, it came back with Clackamas.
- **City limits (`city_limits` layer):** The point falls inside **Happy Valley**, not Portland.
- **Parcels (`taxlots` layer):** The point lands on no tax lot, likely because it's in the road. The nearest lots are mixed:
  - Homes on SE Elm Park Dr, 45–75 ft away, are listed as **unincorporated** Clackamas County.
  - An apartment property at 14722 SE Misty Dr, about 95 ft away, is listed as **Happy Valley**.

The city line runs right through this spot, so the building could be in Happy Valley or in unincorporated Clackamas County. Neither option is Portland.

**What I couldn't check:** The public parcel data has no tax lot matching that exact address. To be sure for a specific building, look up its tax lot in Clackamas County's property records, or ask the City of Happy Valley.
