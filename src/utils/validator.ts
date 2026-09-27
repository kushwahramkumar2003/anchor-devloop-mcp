import { spawn, type ChildProcess } from "node:child_process";
import { config } from "../config/index.ts";

const VALIDATOR_RPC_URL = config.rpcUrl;

export interface CloneOptions {
  /**
   * Cluster to clone from: a moniker ("mainnet-beta" | "devnet" | "testnet")
   * or a full RPC URL (e.g. your Helius endpoint). Required if you pass
   * `accounts` or `programs`.
   */
  url?: string;
  /** Regular account addresses to clone as-is (token accounts, PDAs, mints, etc). */
  accounts?: string[];
  /** Upgradeable program IDs to clone (also pulls the ProgramData account). */
  programs?: string[];
}

let validator: ChildProcess | undefined;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isLikelyPubkey(value: string): boolean {
  // base58, no 0/O/I/l, typically 32-44 chars
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);
}

function buildValidatorArgs(clone?: CloneOptions): string[] {
  const args = ["--reset", "--rpc-port", "8899"];

  const hasCloneTargets =
    (clone?.accounts?.length ?? 0) > 0 || (clone?.programs?.length ?? 0) > 0;

  if (hasCloneTargets) {
    if (!clone?.url) {
      throw new Error(
        "CloneOptions.url is required when cloning accounts or programs (e.g. 'mainnet-beta', 'devnet', or a full RPC URL)"
      );
    }
    args.push("--url", clone.url);

    for (const address of clone.accounts ?? []) {
      if (!isLikelyPubkey(address)) {
        throw new Error(`Not a valid pubkey to clone: ${address}`);
      }
      args.push("--clone", address);
    }

    for (const programId of clone.programs ?? []) {
      if (!isLikelyPubkey(programId)) {
        throw new Error(`Not a valid pubkey to clone: ${programId}`);
      }
      args.push("--clone-upgradeable-program", programId);
    }
  }

  return args;
}

function waitForProcessExit(
  process: ChildProcess,
  timeoutMs = 10_000
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (process.exitCode !== null || process.signalCode !== null) {
      resolve();
      return;
    }

    let settled = false;

    const cleanup = () => {
      process.removeListener("close", onClose);
      process.removeListener("error", onError);
      clearTimeout(timeout);
    };

    const onClose = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const onError = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`Validator did not exit within ${timeoutMs}ms`));
    }, timeoutMs);

    process.once("close", onClose);
    process.once("error", onError);
  });
}

async function waitForValidator(
  process: ChildProcess,
  timeoutMs = 30_000,
  retryIntervalMs = 500
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (process.exitCode !== null || process.signalCode !== null) {
      throw new Error(
        `Validator exited during startup. exitCode=${process.exitCode}, signal=${process.signalCode}`
      );
    }

    try {
      const response = await fetch(`${VALIDATOR_RPC_URL}/health`);
      if (response.ok) {
        const body = await response.text();
        if (body.trim() === "ok") {
          return;
        }
      }
    } catch {
      // still starting
    }

    await sleep(retryIntervalMs);
  }

  throw new Error(`Validator did not become healthy within ${timeoutMs}ms`);
}

/**
 * Start a local Solana validator, optionally cloning accounts/programs
 * from a live cluster (mainnet-beta, devnet, or a custom RPC like Helius).
 *
 * Example:
 *   await startValidator({
 *     url: "https://api.mainnet-beta.solana.com",
 *     programs: ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyDC6b"], // Jupiter program
 *     accounts: ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"], // USDC mint
 *   });
 */
export async function startValidator(clone?: CloneOptions): Promise<void> {
  if (validator) {
    const running =
      validator.exitCode === null && validator.signalCode === null;

    if (running) {
      throw new Error("Validator is already running");
    }

    validator = undefined;
  }

  const args = buildValidatorArgs(clone);

  console.error(
    `Starting Solana test validator${
      clone?.url ? ` (cloning from ${clone.url})` : ""
    }...`
  );

  validator = spawn("solana-test-validator", args, {
    // Keep validator logs off stdout. MCP stdio uses stdout for JSON-RPC.
    stdio: ["ignore", "pipe", "pipe"],
  });

  const forward = (chunk: Buffer) => {
    console.error(chunk.toString());
  };
  validator.stdout?.on("data", forward);
  validator.stderr?.on("data", forward);

  validator.once("error", (error) => {
    console.error("Failed to start validator:", error);
  });

  await waitForValidator(validator);

  console.error(`Solana validator is ready at ${VALIDATOR_RPC_URL}`);
}

export async function stopValidator(): Promise<void> {
  if (!validator) {
    console.error("Validator is not running");
    return;
  }

  const currentValidator = validator;

  const running =
    currentValidator.exitCode === null && currentValidator.signalCode === null;

  if (!running) {
    validator = undefined;
    return;
  }

  console.error("Stopping Solana test validator...");

  currentValidator.kill("SIGTERM");

  try {
    await waitForProcessExit(currentValidator, 10_000);
  } catch {
    console.warn("Validator did not stop gracefully. Sending SIGKILL...");

    if (
      currentValidator.exitCode === null &&
      currentValidator.signalCode === null
    ) {
      currentValidator.kill("SIGKILL");
    }

    await waitForProcessExit(currentValidator, 5_000);
  }

  validator = undefined;

  console.error("Solana validator stopped");
}

/**
 * Restart validator from a clean state, re-applying the same
 * clone set (since --reset wipes any previously cloned accounts).
 */
export async function resetValidator(clone?: CloneOptions): Promise<void> {
  console.error("Resetting Solana validator...");

  await stopValidator();
  await sleep(500);
  await startValidator(clone);

  console.error("Solana validator reset complete");
}

export function isValidatorRunning(): boolean {
  if (!validator) {
    return false;
  }
  return validator.exitCode === null && validator.signalCode === null;
}

export function getValidatorProcess(): ChildProcess | undefined {
  return validator;
}
