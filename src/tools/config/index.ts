import { z } from "zod";

const pubkey = (label: string) =>
  z
    .string()
    .min(32, `${label} must be at least 32 characters long.`)
    .max(44, `${label} must be at most 44 characters long.`);

export const toolOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
});

export const airdropInputSchema = z.object({
  walletAddress: pubkey("Wallet address"),
  amount: z.number().positive("Amount must be greater than zero."),
});

export const balanceInputSchema = z.object({
  walletAddress: pubkey("Wallet address"),
});

export const cloneInputSchema = z.object({
  clone: z
    .object({
      url: z.url("Clone URL must be a valid URL."),
      accounts: z.array(pubkey("Account address")).optional(),
      programs: z.array(pubkey("Program address")).optional(),
    })
    .optional(),
});

export type ToolOutput = z.infer<typeof toolOutputSchema>;
export type AirdropInput = z.infer<typeof airdropInputSchema>;
export type BalanceInput = z.infer<typeof balanceInputSchema>;
export type CloneInput = z.infer<typeof cloneInputSchema>;
