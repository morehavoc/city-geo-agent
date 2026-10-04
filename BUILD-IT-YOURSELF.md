# Build one like this yourself

You don't need this repo to get an agent like this. These are the prompts to give Claude Code (we used Claude Opus 5.5) to build your own, for your own city's layers, in an afternoon. Change the bracketed parts.

Start in an empty folder:

```
mkdir my-city-agent && cd my-city-agent
claude
```

Give the prompts one at a time. Read what comes back before you send the next one. The pauses are where you add what you know about your data.

## 1. Agree on the tools before any code

```
I work in GIS for [the City of Springfield]. Most requests to my team are lookups:
is this address inside a boundary, what's on this parcel, what projects are near here,
how many of X by Y. I want an MCP server that lets an AI agent answer those questions
from our public ArcGIS layers, so people can ask in plain English instead of learning
our web maps.

Constraints:
- TypeScript, using the official MCP SDK. Runs locally over stdio.
- Read-only. No sign-in, no API keys: public layers only.
- The agent must be able to discover what data exists and what the fields mean,
  so it doesn't guess field names or values.

Before writing any code, propose the smallest set of tools an agent needs for those
questions. For each one: inputs, what it calls in the ArcGIS REST API, and what it
returns. Wait for me to agree.
```

## 2. Write the catalog: this is the real work

```
Here are the layers I want the agent to use:
[paste REST URLs of your public layers, e.g. https://.../FeatureServer/0]

For each layer, query it to check it is public and answers a simple query. Then write
a catalog JSON file with an id, name, URL, geometry type, the 5-8 fields that matter,
and a 2-3 sentence description in plain language: what the layer holds, what the key
fields mean, and any quirks (codes, split layers, odd spellings). Show me the
descriptions so I can correct them. Flag anything you could not verify.
```

Then fix the descriptions yourself. The agent knows nothing about your data except what they say.

## 3. Build it, with guardrails

```
Build the tools we agreed. Rules for every tool:
- Every result includes the exact REST URLs it called, so a person can check the answer.
- An empty result and a failed query must look different: "inside nothing" is an empty
  list; a layer that could not be queried returns an error, never an empty list.
- Cap how much comes back and say when you capped it. Never silently truncate.
- Counts and sums are computed by the ArcGIS server (outStatistics), not by fetching rows.
- Distances say what they were measured from.
Write a short README with how to install and connect it to Claude Code.
```

## 4. Test it against real questions, and look for where it's wrong

```
Write a test that starts the server and calls every tool against the live layers.
Then connect the server to yourself and answer these questions using ONLY its tools:
[paste 5-10 real requests from your queue, including one you know the answer to,
 one about a place outside your jurisdiction, and one the data can't answer]
For each, show the tool calls you made and tell me where the answer could be wrong.
```

Check the answers to the questions you already know. If one is wrong, it's usually a catalog description that's missing a quirk, not the code.

## 5. Use it

```
claude mcp add my-city -- node /full/path/to/my-city-agent/dist/stdio.js
```

Then ask it a question from your queue.

## Before anyone else relies on it

This gets you a working prototype, not a production system. Before you put it in front of the public or into a decision:
- Have someone who knows the data read the queries behind the answers for a while.
- Decide what it must refuse to answer (legal boundaries, ownership, anything official).
- Think about load on your services, logging, and who maintains the catalog when layers change.
