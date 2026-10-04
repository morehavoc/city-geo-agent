# Example questions and answers

Nine real runs. Each file shows the question, every tool call the agent made (with its arguments and anything it said along the way), and its final answer, unedited.

Setup for all of them: Claude Code with Claude Opus 5.5, this server attached, and **no other tools**, so everything it knows came through the seven tools here. Run 2026-10-03 against live Portland data. The data changes and the model is not deterministic, so your answers will differ.

| # | Question | Tool calls | What to look at |
|---|---|---|---|
| [01](01-inside-city-limits.md) | Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned? | 4 | The basic lookup. It notices a different zone starts 46 ft away and says the parcel record looks incomplete. |
| [02](02-whats-on-this-parcel.md) | What's on the parcel at 1221 SW 4th Ave? | 4 | The geocoder returns two perfect matches about a kilometre apart; the agent checks both, picks the right one (City Hall), and says which part came from its own knowledge rather than the data. |
| [03](03-town-hall-projects.md) | What is the city building near the Hollywood Library? A handout for a town hall. | 7 | The executive question. Queries all three project layers, then flags projects whose dates have passed before you print. |
| [04](04-which-district.md) | Which council district and neighborhood is Lincoln High School in? | 3 | A place name, not an address. Six seconds. |
| [05](05-spending-by-bureau.md) | How much active capital project spending is there, by bureau? | 17 | Catches the `Active` / `ACTIVE` spelling trap, then a double-counting trap. Read the note below. |
| [06](06-not-in-portland.md) | Is 15000 SE Sunnyside Rd in the City of Portland? | 3 | A "no" answer: it's in Happy Valley. |
| [07](07-water-near-park.md) | Any water bureau projects within half a mile of Laurelhurst Park? | 6 | Says what it measured from (the park's centre point) and what that could miss. |
| [08](08-cant-answer.md) | Who owns 4040 NE Tillamook St? | 4 | Owner names aren't in the public data, so it says so and points to where they are. Its ownership type (COUNTY) is right, but its guess at *why* is wrong: the building is the Hollywood Library, with apartments above. It labels that as a guess, which is why a person reads the answer. |
| [09](09-projects-by-district.md) | Which council district has the most active capital projects? | 7 | **It can't**, and it says why: no tool counts features inside a polygon. A good next tool to build. |

## Read the queries, not just the answer

**Example 05 is the warning.** The project layers map one project as several features, and each feature carries the full project budget, so simply adding up features counts big projects many times: about $8.9 billion. In this run the agent spotted that, counted each project once, and reported about **$5.5 billion**. In an earlier run of the same question it stopped early, reported the $8.9 billion, and only mentioned double counting as a caveat. Same tools, same data, a different amount of diligence.

That is why every tool result carries the exact queries it ran. An agent can do a GIS lookup in seconds, but a person who knows the data should still read how it got the number before it goes in front of council.

## Run them yourself

```
claude mcp add city-geo -- node /path/to/city-geo-agent/dist/stdio.js
claude "Is 4040 NE Tillamook St inside Portland city limits, and what is it zoned?"
```
