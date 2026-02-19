import { z } from "zod";

const walletConnectProjectIdSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).optional());

const envSchema = z.object({
  VITE_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_RPC_URL_FOUNDRY: z
    .string()
    .url("VITE_RPC_URL_FOUNDRY must be a valid URL")
    .default("http://127.0.0.1:8545"),
  VITE_RPC_URL_MAINNET: z.string().optional(),
  VITE_RPC_URL_SEPOLIA: z.string().optional(),
  VITE_WALLET_CONNECT_PROJECT_ID: walletConnectProjectIdSchema,
});

function validateEnv() {
  const isDev = import.meta.env.DEV;
  const result = envSchema.safeParse({
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_RPC_URL_FOUNDRY: import.meta.env.VITE_RPC_URL_FOUNDRY,
    VITE_RPC_URL_MAINNET: import.meta.env.VITE_RPC_URL_MAINNET,
    VITE_RPC_URL_SEPOLIA: import.meta.env.VITE_RPC_URL_SEPOLIA,
    VITE_WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  if (!isDev && !result.data.VITE_WALLET_CONNECT_PROJECT_ID) {
    throw new Error(
      "Environment validation failed:\n  - VITE_WALLET_CONNECT_PROJECT_ID: VITE_WALLET_CONNECT_PROJECT_ID is required"
    );
  }

  return result.data;
}

const env = validateEnv();

export const APP_ENV = env.VITE_APP_ENV;
export const RPC_URL_FOUNDRY = env.VITE_RPC_URL_FOUNDRY;
export const RPC_URL_MAINNET = env.VITE_RPC_URL_MAINNET;
export const RPC_URL_SEPOLIA = env.VITE_RPC_URL_SEPOLIA;
export const WALLET_CONNECT_PROJECT_ID = env.VITE_WALLET_CONNECT_PROJECT_ID;
