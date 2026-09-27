import type { ServerContext } from "@modelcontextprotocol/server";
import { address, sol, solToLamports } from "@solana/kit";
import type { AirdropInput } from "../config/index.ts";
import { toolError, toolResult } from "../result.ts";
import { airdrop } from "../../utils/solana.ts";

export const airdropHandler = async (
  { walletAddress, amount }: AirdropInput,
  _ctx: ServerContext,
) => {
  try {
    const signature = await airdrop({
      commitment: "confirmed",
      recipientAddress: address(walletAddress),
      lamports: solToLamports(sol(amount.toString(), "round")),
    });

    return toolResult({
      status: "success",
      message: `Airdropped ${amount} SOL to ${walletAddress}. Signature: ${signature}.`,
    });
  } catch (error) {
    return toolError(error);
  }
};
