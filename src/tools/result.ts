import type { CallToolResult } from "@modelcontextprotocol/server";
import type { ToolOutput } from "./config/index.ts";

export function toolResult(result: ToolOutput): CallToolResult {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(result),
      },
    ],
    structuredContent: result,
    isError: result.status === "error",
  };
}

export function toolError(error: unknown): CallToolResult {
  const message = error instanceof Error ? error.message : String(error);
  return toolResult({ status: "error", message });
}
