# I have a town hall at the Hollywood Library on Thursday. What is the city building or planning within a mile of it? Give me a list I can hand out.

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 7 tool calls, 48 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "Hollywood Library, Portland, OR"}
3. `describe_layer` {"layer_id": "cip_points"}
4. `query_near` {"layer_id": "cip_points", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
5. `query_near` {"layer_id": "cip_lines", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
6. `query_near` {"layer_id": "cip_polygons", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
7. `what_contains` {"lon": -122.62151, "lat": 45.53756, "layer_ids": ["neighborhoods", "council_districts"]}

## The answer

I found 43 city project records within a mile of the Hollywood Library. Some are duplicates and some are citywide programs, which leaves about 30 distinct projects. The handout is below, followed by a few things to check before you print it.

---

# City projects within 1 mile of Hollywood Library
**4040 NE Tillamook St · Hollywood neighborhood · Council District 2**
*Source: City of Portland Capital Improvement Projects open data, pulled Oct 3, 2026. Dates are the city's estimates.*

## Under construction now
| Project | What it is | Bureau | Schedule | Est. cost |
|---|---|---|---|---|
| **NE Knott St traffic calming (21st–33rd)** | 15 speed cushions, plus signs and pavement markings | Transportation | Sep 14 – Oct 15, 2026 | $131K |
| **NE 60th & Halsey area improvements** | Repaving, signal upgrades and new lane striping on Halsey. Wider sidewalks and new crossings on 60th | Transportation | May 2025 – Aug 2026 | $9.7M |
| **NE Halsey water main (45th–47th)** | 520 ft of new 6-inch water main. 9 service lines renewed | Water | May 2025 – Jul 2027 | $52K |
| **NE 60th & Halsey water work** | 25 water meters and 4 hydrants relocated or renewed | Water | Feb 2025 – Aug 2026 | $97K |
| **Cully neighborhood street improvements** | New pavement, separated walkways and stormwater work in Cully | Transportation | May 2026 – Apr 2028 | $18.0M |
| **Sewer repairs** | Rehab of the main on NE 32nd north of Siskiyou. Lining of the main on NE 30th between Oregon and Irving | Environmental Services | Underway | $150K each |

## In design: construction starting 2026–2029
| Project | What it is | Bureau | Schedule | Est. cost |
|---|---|---|---|---|
| **NE Holladay water main (27th–28th)** | 300 ft of new 8-inch water main | Water | Aug 2026 – Nov 2028 | $166K |
| **NE Stanton water main (38th–39th)** | 260 ft of new main and 1 new hydrant | Water | Jan – Sep 2027 | $132K |
| **NE 33rd sewer extension (Tillamook–Hancock)** | Sewer service for 2 properties | Environmental Services | Feb – Jun 2027 | $250K |
| **NE Sandy Crest Terrace water main (Sandy–57th)** | 930 ft of new 6-inch water main | Water | Mar 2027 – Mar 2028 | $286K |
| **District 3 sewer rehab & replacement** | 7 high-priority sewers in NE and SE Portland | Environmental Services | Mar – Jul 2027 | $2.6M |
| **Oak Basin A: Sandy Blvd trunk sewer** | New 42–48 inch trunk sewer from NE 29th/Sandy to NE 12th/Davis | Environmental Services | Oct 2027 – Jul 2029 | $25.4M |
| **Oak Basin A: collectors** | Reduce street flooding at 54 locations and basement sewer backups at 150 properties (NE 10th–22nd, I-84 to Sandy) | Environmental Services | Aug 2029 – May 2031 | $10.0M |

## Early planning (no construction dates yet)
- **Sullivan's Gulch trunk sewer replacement:** about 1,084 ft of old concrete trunk sewer to be relined. About 0.3 mi from the library. Est. $12.4M.
- **HSS_18 sewer rerouting:** redirects combined sewer flow that now runs under I-84 to the Sullivan's Gulch trunk near NE 29th.
- **Beech/Essex/Oak basin study:** basin-wide planning for stormwater controls, new pipes and underground storage.
- **Grant Park:** Beverly Cleary Sculpture Garden and fountain project (Parks). Est. $500K.

## Ongoing citywide programs with work in this area
- **ADA curb ramps:** about 15 locations within a mile are part of the city's curb-ramp program.
- **Neighborhood greenways, quick builds and "Wait for Green" bike markings:** small safety upgrades.

---

**Questions?** Most projects have a page at portland.gov/transportation, portland.gov/water/improvements, or portland.gov/bes (search "find sewer and stormwater construction projects").

---

### Things to check before you print
1. **Some projects may already be finished.** The city still lists these as active, but their completion dates have passed, so I left them off the handout:
   - Hancock & 42nd bike signal (0.1 mi away, due Nov 2025)
   - 43rd & Royal Ct crossing improvements (due Apr 2026)
   - 41st & Glisan protected bike lanes (due Nov 2025)
   - Stark–Buckman ADA ramps (due Feb 2026)
   - 60th & Halsey sumps (due Apr 2025)
   
   Two items on the handout have also passed their completion dates: the 60th & Halsey improvements and the 60th & Halsey water work were both due in August 2026. Before Thursday, ask the bureaus whether those two are done.
2. **"Within a mile" counts any part of a project.** Long sewer lines and large areas like Cully and Oak Basin show up because one edge reaches inside the mile. Most of that work happens farther away. I left off the Division St transit signal project because it's mostly on SE Division, about 2 miles south.
3. **This data only covers city capital projects.** Private development, land-use applications, ODOT work on I-84, and TriMet aren't in it. I couldn't check those.
4. **Costs are the city's estimates.** I left off projects with no cost listed. One Parks record (the ARP maintenance facility fencing) has a completion date of 1905, so I treated it as a data error and left it off too.
