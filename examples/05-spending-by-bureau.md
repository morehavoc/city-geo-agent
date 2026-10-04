# How much active capital project spending is there across the city, by bureau?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 17 tool calls, 65 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `describe_layer` {"layer_id": "cip_points"}
3. `summarize` {"layer_id": "cip_points", "stat": "sum", "field": "Estimated_Total_Project_Cost", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
4. `summarize` {"layer_id": "cip_lines", "stat": "sum", "field": "Estimated_Total_Project_Cost", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
5. `summarize` {"layer_id": "cip_polygons", "stat": "sum", "field": "Estimated_Total_Project_Cost", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
6. `summarize` {"layer_id": "cip_points", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
7. `summarize` {"layer_id": "cip_lines", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
8. `summarize` {"layer_id": "cip_polygons", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
   - *"Water's total looks high for 87 points. A project mapped as several features would carry its full cost on each one, so I'll check for duplicates."*
9. `summarize` {"layer_id": "cip_points", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE') AND Bureau_Name = 'WTR'"}
10. `query_near` {"layer_id": "cip_points", "lon": -122.68, "lat": 45.52, "distance": 50, "where": "Status IN ('Active','ACTIVE') AND Estimated_Total_Project_Cost > 100000000", "fields": ["Project_Number_SAP", "Project_Name", "Bureau_Name", "Estimated_Total_Project_Cost"], "limit": 100}
11. `summarize` {"layer_id": "cip_lines", "stat": "max", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE')"}
12. `summarize` {"layer_id": "cip_polygons", "stat": "max", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE')"}
13. `summarize` {"layer_id": "cip_points", "stat": "max", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE')"}
14. `summarize` {"layer_id": "cip_points", "stat": "sum", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE') AND Bureau_Name IN ('PDT','BES') AND Estimated_Total_Project_Cost >= 5000000"}
15. `summarize` {"layer_id": "cip_lines", "stat": "sum", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE') AND Estimated_Total_Project_Cost >= 5000000"}
   - *"T00727 ($57M) is mapped 30 times in points, which adds about $1.65B of double counting. I'll get the single-feature cost for each of the large repeated projects."*
16. `summarize` {"layer_id": "cip_points", "stat": "max", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE') AND Bureau_Name IN ('PDT','BES') AND Estimated_Total_Project_Cost >= 5000000"}
17. `summarize` {"layer_id": "cip_lines", "stat": "max", "field": "Estimated_Total_Project_Cost", "group_by": "Project_Number_SAP", "where": "Status IN ('Active','ACTIVE') AND Project_Number_SAP IN ('T00724','E11006','W01590','T01428','T01303','E11825','E11711','E10918')"}

## The answer

Portland's active capital projects have an estimated total cost of about **$5.5 billion**. That figure counts each project once. If you just add up the city's open-data layers, you get about $8.9 billion, but that sum counts some projects many times.

| Bureau | Active projects, each counted once | Simple sum of the layers |
|---|---|---|
| Water (WTR) | **~$3.04B** | $3.04B |
| Environmental Services (BES) | **~$1.46B** | $2.56B |
| Transportation (PDT) | **~$0.79B** | $3.09B |
| Parks (PKS) | **~$0.20B** | $0.20B |
| **Total** | **~$5.5B** | **~$8.9B** |

**Why the two columns differ:** projects are split across three map layers (points, lines and areas). A project mapped as several pieces carries its full cost on every piece, so adding up the pieces repeats it. The biggest cases:
- **E10918 (BES):** a $7.9M project mapped 124 times, which adds about $970M.
- **T00727 (PDT):** a $57M project mapped 30 times, which adds about $1.65B.
- **T00687 (PDT):** a $7.5M project mapped 30 times, which adds about $217M.
- **Projects in more than one layer:** about a dozen appear in two or three of the layers (T01183, T00723, T00724, E08406, E11394 and others).

I counted each project number once, which drops about $3.4B. Without that step, Transportation would look like the biggest spender when it's actually third.

**Where the money is:**
- **Water:** almost 90% is the Bull Run Filtration plant ($2.05B) and its pipelines ($595M). Washington Park Reservoir 3 adds another $216M.
- **Environmental Services:** mostly at the Columbia Boulevard treatment plant, mainly the $631M secondary treatment expansion and the $125M hypochlorite system upgrades.
- **Transportation:** many mid-sized street projects; the largest is $64M.

**Limits of these figures:**
- "Active" means Status is "Active" or "ACTIVE" (the data uses both). Projects marked FUTURE are left out.
- These are **estimated total project costs** over each project's life, not this year's spending. The data also has a current fiscal-year budget field, and I can total that by bureau if you want annual spending.
- I only removed repeats for projects of $5M or more, because the server returns at most 200 groups per query. Smaller repeats remain, so the de-duplicated totals may still be slightly high, probably by tens of millions at most. Water's lines and Parks' points are the least checked.
- Source: the City of Portland layers `cip_points`, `cip_lines` and `cip_polygons` (portlandmaps.com, COP_OpenData_CityProjects layers 43–45).
