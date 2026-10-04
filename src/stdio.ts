#!/usr/bin/env node
// Local entry point: Claude Code, Claude Desktop and VS Code (Copilot) start
// this as a subprocess and talk to it over stdin/stdout.
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

await createServer().connect(new StdioServerTransport());
process.stderr.write('[city-geo-agent] ready on stdio\n');
