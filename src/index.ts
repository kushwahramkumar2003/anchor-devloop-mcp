import { McpServer, type McpServerFactory } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { registerTools } from "./tools/index.ts";

const createServer: McpServerFactory = (): McpServer => {
  const server = new McpServer({
    name: "anchor-devloop-mcp",
    version: "1.0.0",
  });

  registerTools(server);
  return server;
};

serveStdio(createServer);

console.error("anchor-devloop-mcp started");
