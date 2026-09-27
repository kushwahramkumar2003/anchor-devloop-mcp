import type { McpServer } from "@modelcontextprotocol/server";
import { airdropHandler } from "./handler/airDrop.ts";
import { balanceHandler } from "./handler/balance.ts";
import { resetValidatorHandler } from "./handler/resetValidator.ts";
import { startValidatorHandler } from "./handler/startValidator.ts";
import {
  airdropInputSchema,
  balanceInputSchema,
  cloneInputSchema,
  toolOutputSchema,
} from "./config/index.ts";

export function registerTools(server: McpServer): void {
  server.registerTool(
    "request_airdrop",
    {
      title: "Request Airdrop",
      description:
        "Airdrop SOL from the local test validator to a wallet and wait until the airdrop is confirmed.",
      inputSchema: airdropInputSchema,
      outputSchema: toolOutputSchema,
    },
    airdropHandler,
  );

  server.registerTool(
    "get_balance",
    {
      title: "Get Balance",
      description: "Read the SOL balance of a wallet on the local test validator.",
      inputSchema: balanceInputSchema,
      outputSchema: toolOutputSchema,
    },
    balanceHandler,
  );

  server.registerTool(
    "start_validator",
    {
      title: "Start Validator",
      description:
        "Start solana-test-validator on http://127.0.0.1:8899. Optionally clone accounts or upgradeable programs from another cluster.",
      inputSchema: cloneInputSchema,
      outputSchema: toolOutputSchema,
    },
    startValidatorHandler,
  );

  server.registerTool(
    "reset_validator",
    {
      title: "Reset Validator",
      description:
        "Stop the local validator and start it again from a clean ledger. Pass the same clone options used at startup, because --reset drops previously cloned accounts.",
      inputSchema: cloneInputSchema,
      outputSchema: toolOutputSchema,
    },
    resetValidatorHandler,
  );
}
