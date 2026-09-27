import type { ServerContext } from "@modelcontextprotocol/server";
import { address } from "@solana/kit";
import type { BalanceInput } from "../config/index.ts";
import { toolError, toolResult } from "../result.ts";
import { formatLamports, rpc } from "../../utils/solana.ts";

export const balanceHandler = async (
  { walletAddress }: BalanceInput,
  _ctx: ServerContext,
) => {
  try {
    const balance = await rpc.getBalance(address(walletAddress)).send();
    const sol = formatLamports(balance.value);

    return toolResult({
      status: "success",
      message: `Current balance for ${walletAddress} is ${sol} SOL.`,
    });
  } catch (error) {
    return toolError(error);
  }
};
