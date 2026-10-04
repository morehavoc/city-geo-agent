# Are there any water bureau projects within half a mile of Laurelhurst Park?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 6 tool calls, 17 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "Laurelhurst Park, Portland, OR"}
3. `describe_layer` {"layer_id": "cip_points"}
4. `query_near` {"layer_id": "cip_points", "lon": -122.6268, "lat": 45.5209, "distance": 0.5, "where": "Bureau_Name = 'WTR'"}
5. `query_near` {"layer_id": "cip_lines", "lon": -122.6268, "lat": 45.5209, "distance": 0.5, "where": "Bureau_Name = 'WTR'"}
6. `query_near` {"layer_id": "cip_polygons", "lon": -122.6268, "lat": 45.5209, "distance": 0.5, "where": "Bureau_Name = 'WTR'"}

## The answer

Yes, there are two Portland Water Bureau (WTR) projects within half a mile of Laurelhurst Park. Both are water pipe projects along streets, and both are still in design:

| Project | Distance | Phase | Est. construction | Est. cost |
|---|---|---|---|---|
| SE Ankeny from Floral to Laurelhurst Pl | 0.09 mi | Design | Jan 2027 – Oct 2027 | $226,000 |
| SE 33rd Ave from Stark to Oak St | 0.2 mi | Design | Nov 2026 – Aug 2027 | $120,003 |

The SE 33rd Ave project is due to start construction first, in late November 2026, so about two months from now.

The city maps its projects in three layers: points, lines and areas. I searched all three for Water Bureau projects. Both matches are in the lines layer (`cip_lines`); the other two layers had none.

I measured from the park's geocoded center point, about SE 39th and Oak (geocode match score 100), not from its edge. The park is roughly a quarter mile across, so a project just over half a mile from its far edge could have been missed.
