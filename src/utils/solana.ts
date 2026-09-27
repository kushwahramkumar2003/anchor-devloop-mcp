import {
  airdropFactory,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  lamportsToSol,
  type Lamports,
} from "@solana/kit";
import { config } from "../config/index.ts";

export const rpc = createSolanaRpc(config.rpcUrl);
export const rpcSubscriptions = createSolanaRpcSubscriptions(
  config.rpcSubscriptionsUrl,
);

/** Requests an airdrop and waits until the local validator confirms it. */
export const airdrop = airdropFactory({ rpc, rpcSubscriptions });

/** Exact SOL string for a lamport balance (1 SOL = 1_000_000_000 lamports). */
export function formatLamports(value: Lamports): string {
  const asSol = lamportsToSol(value);
  const scale = 10n ** BigInt(asSol.decimals);
  const whole = asSol.raw / scale;
  const fraction = (asSol.raw % scale)
    .toString()
    .padStart(asSol.decimals, "0")
    .replace(/0+$/, "");

  return fraction.length === 0 ? whole.toString() : `${whole}.${fraction}`;
}
