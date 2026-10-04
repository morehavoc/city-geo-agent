#!/usr/bin/env node
// Hosted entry point: ChatGPT (and claude.ai custom connectors) need a URL.
// Stateless Streamable HTTP at /mcp; no sign-in, because the data is public.
import { createServer as createHttpServer } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer } from './server.js';

const PORT = Number(process.env.PORT || 3000);

createHttpServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
    return;
  }
  if (url.pathname !== '/mcp') {
    res.writeHead(404).end('city-geo-agent: MCP endpoint is /mcp\n');
    return;
  }
  if (req.method !== 'POST') {
    res.writeHead(405, { allow: 'POST' }).end();
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined;
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => { transport.close(); server.close(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (e: any) {
    if (!res.headersSent) res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: e?.message || 'bad request' }, id: null }));
  }
}).listen(PORT, () => process.stderr.write(`[city-geo-agent] http on :${PORT}/mcp\n`));
