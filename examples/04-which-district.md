# Which city council district and neighborhood is Lincoln High School in?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 3 tool calls, 6 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "Lincoln High School, Portland, OR"}
3. `what_contains` {"lon": -122.688937, "lat": 45.518723, "layer_ids": ["council_districts", "neighborhoods", "city_limits"]}

## The answer

Lincoln High School is in **City Council District 4** and the **Goose Hollow** neighborhood.

- **Location:** The geocoder put the school at about -122.6889, 45.5187 with a match score of 100. Its two results were only a few meters apart, so the location is reliable.
- **Council district:** District 4, from the `council_districts` layer. These are the four districts Portland has used since 2025.
- **Neighborhood:** Goose Hollow, from the `neighborhoods` layer. It belongs to the Neighbors West/Northwest (NWNW) coalition, and no other neighborhood shares this area.
- **City:** The point is inside Portland city limits.

I checked one point near the middle of the campus, not the whole property. The school is well inside Goose Hollow, so it's very unlikely that any part of the campus falls in a different neighborhood.
