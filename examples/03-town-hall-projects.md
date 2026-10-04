# I have a town hall at the Hollywood Library on Thursday. What is the city building or planning within a mile of it? Give me a list I can hand out.

*Claude Code with Claude Opus 5.5 and this server attached, no other tools. 7 tool calls, 73 s. Run 2026-10-03; the city data changes, so your answer may differ.*

## What the agent did

1. `list_layers` {}
2. `geocode` {"text": "Hollywood Library, Portland, OR"}
3. `describe_layer` {"layer_id": "cip_points"}
4. `query_near` {"layer_id": "cip_points", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
5. `query_near` {"layer_id": "cip_lines", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
6. `query_near` {"layer_id": "cip_polygons", "lon": -122.62151, "lat": 45.53756, "distance": 1, "limit": 100, "fields": ["Project_Name", "Project_Description", "Status", "Phase", "Bureau_Name", "Est_Construction_Start_Date", "Est_Construction_Comp_Date", "Estimated_Total_Project_Cost", "URL"]}
7. `what_contains` {"lon": -122.62151, "lat": 45.53756, "layer_ids": ["neighborhoods", "council_districts"]}

## The answer

I've put together a one-page handout of every city capital project mapped within a mile of the library. Before you print it, check the fourth section. Six of the projects are still marked "Active" but their scheduled dates have already passed, and one of them is the closest project to the library.

---

# City projects within 1 mile of Hollywood Library
**4040 NE Tillamook St · Hollywood neighborhood · Council District 2**
*Source: City of Portland Capital Improvement Projects open data, pulled Oct 3, 2026*

### Under construction now
| Project | What it is | Schedule | Cost | Bureau | Distance |
|---|---|---|---|---|---|
| **NE Knott traffic calming, 21st–33rd** | 15 speed cushions, plus signs and pavement markings | Sep 14 – Oct 15, 2026 | $131K | Transportation | 0.5 mi |
| **NE Halsey water main, 45th–47th** | ~520 ft of new 6" water main replacing old cast iron; 9 service lines renewed | May 2025 – Jul 2027 | $52K | Water | 0.3 mi |
| **Cully neighborhood street improvements** | New paving, separated walkways, stormwater upgrades | May 2026 – Apr 2028 | $18.0M | Transportation | 0.8 mi |
| **Sewer repair, NE 32nd north of Siskiyou** | Refurbish 263 ft of sewer main | No dates given | $150K | Environmental Services | 0.8 mi |
| **Sewer lining, NE 30th (Oregon–Irving)** | Reline a 12" sewer main | No dates given | $150K | Environmental Services | 0.9 mi |

### Coming next (in design)
| Project | What it is | Schedule | Cost | Bureau | Distance |
|---|---|---|---|---|---|
| **NE 33rd & Tillamook sewer extension** | Extend sanitary sewer to serve 2 properties | Feb – Jun 2027 | $250K | Environmental Services | 0.4 mi |
| **NE Stanton water main, 38th–39th** | ~260 ft of new main; adds 1 hydrant | Jan – Sep 2027 | $132K | Water | 0.4 mi |
| **NE Sandy Crest Terrace water main** | ~930 ft of new main; hydrant work | Mar 2027 – Mar 2028 | $286K | Water | 0.7 mi |
| **District 3 sewer rehab & replacement** | Fix 7 high-priority sewers in NE/SE | Mar – Jul 2027 | $2.6M | Environmental Services | 0.8 mi |
| **NE Holladay water main, 27th–28th** | ~300 ft of new 8" main | Aug 2026 – Nov 2028 | $166K | Water | 0.9 mi |
| **Oak Basin A – Sandy Blvd trunk sewer** | New 42–48" trunk sewer from NE 29th/Sandy to NE 12th/Davis | Oct 2027 – Jul 2029 | $25.4M | Environmental Services | 0.7 mi |
| **Oak Basin A – collector sewers** | More sewer capacity to relieve street flooding at 54 locations and basement backups at 150 properties | Aug 2029 – May 2031 | $10.0M | Environmental Services | 0.85 mi |

### Early planning, no schedule yet
| Project | What it is | Cost | Bureau | Distance |
|---|---|---|---|---|
| **Sullivan trunk sewer section replacement** | Replace ~1,084 ft of trunk sewer in very poor condition | $12.4M | Environmental Services | 0.3 mi |
| **Grant Park Beverly Cleary Sculpture Garden & fountain** | Work at the sculpture garden and fountain | $500K | Parks | 0.5 mi |
| **Parks maintenance facility fencing** | Fencing (no other details listed) | — | Parks | 0.4 mi |
| **HSS_18 combined-sewer reroute** | Reroute combined sewer flows that now go under I-84 to NE 29th | — | Environmental Services | 0.8 mi |
| **Beech/Essex/Oak basin study** | Basin-wide study of stormwater controls, new pipes and storage | — | Environmental Services | 1.0 mi |

### Still marked "Active," but scheduled dates have passed (confirm before Thursday)
| Project | What it is | Scheduled | Cost | Distance |
|---|---|---|---|---|
| **NE Hancock & 42nd bike signal** | Bike-only signal for westbound riders on the Hancock greenway | Nov 2025 | $75K | 0.1 mi |
| **NE 43rd / Royal Ct intersection** | Pedestrian and traffic safety fixes at a 5-way intersection near a school | Nov 2025 – Apr 2026 | $45K | 0.4 mi |
| **NE 60th & Halsey area improvements** | Paving, signal upgrades and restriping on Halsey; wider sidewalks and crossings on 60th | May 2025 – Aug 2026 | $9.7M | 0.4 mi |
| ↳ Water and sewer work for the same project | Meter/hydrant relocation ($97K) and sumps ($37K) | 2024 – Aug 2026 | $134K | 0.8–1.0 mi |
| **NE 41st & Glisan traffic calming** | Restripe Glisan for protected bike lanes | Oct – Nov 2025 | $132K | 0.8 mi |
| **Stark–Buckman ADA ramps** | Curb ramps (Transportation and Environmental Services together) | Oct 2025 – Feb 2026 | $350K | 0.9 mi |

### Citywide programs with work sites nearby
- **ADA curb ramps:** 12 locations within a mile, under three program names
- **Neighborhood greenways** and **Quick Builds** (fast, low-cost safety fixes)
- **"Wait Here for Green" bike markings:** 2 intersections
- **Bus signal priority:** from the Division St. signal program, at 0.8 mi

*Budgets for these programs cover the whole city, so they aren't listed as local spending.*

---

**Notes for you (not for the handout):**
- **Capital projects only.** This data covers city construction by Transportation, Environmental Services, Parks and Water. It doesn't include private development, permits, zoning or land-use planning, or work by TriMet, ODOT or Portland Public Schools. If people at the town hall ask about "planning" in that sense, this list won't answer it.
- **Some records look stale.** The 60th & Halsey sumps are still listed as "Design" with dates that ended in April 2025, and the fencing project has an impossible 1905 completion date. The Hollywood community probably knows the Hancock & 42nd signal best, so check that one in particular.
- **A couple of distances look odd.** Stark–Buckman and the Division signal program are well south of the library. They probably show up because they have pieces mapped in several places, so you could leave them off.
- **How I counted.** The 31 projects on this list come from 43 map features in the three project layers, because some projects are mapped more than once.
- **Contacts and links.** I left out staff email addresses from the Parks records. The handout could point people to portland.gov/bes and portland.gov/water/improvements for sewer and water projects.

I can also make a map of these projects for a slide, or trim the list to just the current and upcoming work.
