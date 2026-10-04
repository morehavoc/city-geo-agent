# Which city council district and neighborhood is Lincoln High School in?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 3 tool calls, 6 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "Lincoln High School, Portland, OR"}
3. `what_contains` {"lon": -122.688937, "lat": 45.518723, "layer_ids": ["council_districts", "neighborhoods", "city_limits"]}

## The answer

Lincoln High School is in **City Council District 4** and the **Goose Hollow** neighborhood.

- **Location:** The geocoder found the school at about -122.6889, 45.5187. Both results matched with a score of 100 and were about 12 meters apart.
- **Council district:** District 4, from the `council_districts` layer. These are the four districts Portland has used since 2025.
- **Neighborhood:** Goose Hollow, from the `neighborhoods` layer. The point isn't in an area shared with another neighborhood, and it belongs to the Neighbors West/Northwest coalition (listed as NWNW).
- **City limits:** It's inside Portland city limits.

I checked a single point, not the school's whole property boundary. The point isn't near a district or neighborhood edge, so the whole campus is very likely in the same district and neighborhood.
