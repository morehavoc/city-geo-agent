# How much active capital project spending is there across the city, by bureau?

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 14 tool calls, 34 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `describe_layer` {"layer_id": "cip_points"}
   - *"Status has both "Active" and "ACTIVE", so I'll include both spellings. I'll also check the status values in the other two layers."*
3. `summarize` {"layer_id": "cip_lines", "group_by": "Status"}
4. `summarize` {"layer_id": "cip_polygons", "group_by": "Status"}
5. `summarize` {"layer_id": "cip_points", "group_by": "Status"}
6. `summarize` {"layer_id": "cip_points", "group_by": "Bureau_Name", "stat": "sum", "field": "Estimated_Total_Project_Cost", "where": "Status IN ('Active','ACTIVE')"}
7. `summarize` {"layer_id": "cip_lines", "group_by": "Bureau_Name", "stat": "sum", "field": "Estimated_Total_Project_Cost", "where": "Status IN ('Active','ACTIVE')"}
8. `summarize` {"layer_id": "cip_polygons", "group_by": "Bureau_Name", "stat": "sum", "field": "Estimated_Total_Project_Cost", "where": "Status IN ('Active','ACTIVE')"}
9. `summarize` {"layer_id": "cip_points", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
10. `summarize` {"layer_id": "cip_lines", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
11. `summarize` {"layer_id": "cip_polygons", "group_by": "Bureau_Name", "where": "Status IN ('Active','ACTIVE')"}
   - *"Before reporting totals, I'll check whether any project appears as several features, which would count its cost more than once."*
12. `summarize` {"layer_id": "cip_points", "group_by": "Project_Name", "stat": "sum", "field": "Estimated_Total_Project_Cost", "where": "Status IN ('Active','ACTIVE') AND Bureau_Name = 'WTR' AND Estimated_Total_Project_Cost > 50000000"}
13. `summarize` {"layer_id": "cip_points", "group_by": "Project_Name", "where": "Status IN ('Active','ACTIVE') AND Bureau_Name = 'WTR' AND Estimated_Total_Project_Cost > 50000000"}
   - *"The big Water projects each appear once in the points layer. Next I'll check whether they also show up in the lines layer."*
14. `summarize` {"layer_id": "cip_lines", "group_by": "Project_Name", "stat": "sum", "field": "Estimated_Total_Project_Cost", "where": "Status IN ('Active','ACTIVE') AND (Project_Name LIKE '%Bull Run%' OR Estimated_Total_Project_Cost > 50000000)"}

## The answer

Active capital projects add up to about **$8.9 billion** in estimated total project cost, across **1,342 project records**.

| Bureau | Active records | Est. total project cost | Share |
|---|---:|---:|---:|
| **PDT** – Transportation (PBOT) | 518 | **$3.09B** | 35% |
| **WTR** – Water Bureau | 318 | **$3.04B** | 34% |
| **BES** – Environmental Services (sewer/stormwater) | 377 | **$2.56B** | 29% |
| **PKS** – Parks & Recreation | 129 | **$0.20B** | 2% |
| **Total** | **1,342** | **$8.90B** | |

**What drives the numbers:**
- **Water's total comes mostly from two projects.** Bull Run Filtration is about $2.05B and Bull Run Treatment Project Pipelines about $595M. Together they're over 85% of Water's total. Without them, Water has the smallest budget of the three utility-type bureaus.
- **Transportation is spread across many smaller projects.** It has the most records, and its largest single line project is the 82nd Ave Major Maintenance at about $64M.
- **Parks is small by comparison:** about $200M over 129 records.

**How I got this:**
- I added up `Estimated_Total_Project_Cost` across all three capital project layers (`cip_points`, `cip_lines`, `cip_polygons`), grouped by `Bureau_Name`.
- The data spells the status both `Active` and `ACTIVE`, so I included both. I left out the 57 projects marked `FUTURE`.
- "Active" covers every phase from Planning to Closeout, not just projects under construction.
- This is each project's **lifetime estimated cost**, not this year's spending. The data also has a `Current_Fiscal_Year_Budget` field if you want annual spending instead.

**Caveat about double counting:** I checked that the largest Water projects each appear only once and aren't repeated between the points and lines layers. I didn't check every record, though. If a project is mapped as several features, its cost could be counted more than once, so treat the totals as close estimates rather than exact figures.

I can also break this down by phase, or show the current fiscal year budget by bureau, if that would help.
