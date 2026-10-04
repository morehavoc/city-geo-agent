// Every tool is the same shape: a name, a description the model reads to
// decide when to use it, a JSON Schema for its inputs, and a function.

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  /** Returns plain data; the server turns it into an MCP result. */
  run(args: any): Promise<unknown>;
  /** Optional: return a full MCP result yourself (show_map does). */
  raw?: boolean;
  _meta?: Record<string, unknown>;
}
