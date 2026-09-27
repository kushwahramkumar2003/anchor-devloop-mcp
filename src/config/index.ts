import { devnet } from "@solana/kit";

/** Local `solana-test-validator` HTTP and websocket endpoints. */
const LOCAL_RPC_HTTP = "http://127.0.0.1:8899";
const LOCAL_RPC_WS = "ws://127.0.0.1:8900";

export const config = {
  /**
   * Branded as devnet so Kit helpers that only run on test clusters
   * (airdrop confirmation) accept the local validator.
   */
  rpcUrl: devnet(LOCAL_RPC_HTTP),
  rpcSubscriptionsUrl: devnet(LOCAL_RPC_WS),
};
