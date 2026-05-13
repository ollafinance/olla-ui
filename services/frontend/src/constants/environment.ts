import { z } from "zod";

const optionalUrlSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().url("must be a valid URL").optional());

const walletConnectProjectIdSchema = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).optional());

const booleanFlagSchema = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return value.trim().toLowerCase() === "true";
}, z.boolean());

const envSchema = z.object({
  VITE_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_CONTRACTS_ENV: z.enum(["local", "sepolia", "mainnet"]).default("local"),
  VITE_RPC_URL_FOUNDRY: optionalUrlSchema,
  VITE_RPC_URL_MAINNET: optionalUrlSchema,
  VITE_RPC_URL_SEPOLIA: optionalUrlSchema,
  VITE_WALLET_CONNECT_PROJECT_ID: walletConnectProjectIdSchema,
  VITE_INDEXER_API_URL: optionalUrlSchema,
  VITE_ETHEREUM_EXPLORER_URL: optionalUrlSchema,
  VITE_LAUNCH_ACTIVE: booleanFlagSchema.default(false),
});

function validateEnv() {
  const isDev = import.meta.env.DEV;
  const result = envSchema.safeParse({
    VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
    VITE_CONTRACTS_ENV: import.meta.env.VITE_CONTRACTS_ENV,
    VITE_RPC_URL_FOUNDRY: import.meta.env.VITE_RPC_URL_FOUNDRY,
    VITE_RPC_URL_MAINNET: import.meta.env.VITE_RPC_URL_MAINNET,
    VITE_RPC_URL_SEPOLIA: import.meta.env.VITE_RPC_URL_SEPOLIA,
    VITE_WALLET_CONNECT_PROJECT_ID: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
    VITE_INDEXER_API_URL: import.meta.env.VITE_INDEXER_API_URL,
    VITE_ETHEREUM_EXPLORER_URL: import.meta.env.VITE_ETHEREUM_EXPLORER_URL,
    VITE_LAUNCH_ACTIVE: import.meta.env.VITE_LAUNCH_ACTIVE,
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

  if (result.data.VITE_CONTRACTS_ENV === "local" && !result.data.VITE_RPC_URL_FOUNDRY) {
    result.data.VITE_RPC_URL_FOUNDRY = "http://127.0.0.1:8545";
  }

  if (result.data.VITE_CONTRACTS_ENV === "sepolia" && !result.data.VITE_RPC_URL_SEPOLIA) {
    throw new Error(
      "Environment validation failed:\n  - VITE_RPC_URL_SEPOLIA: VITE_RPC_URL_SEPOLIA is required when VITE_CONTRACTS_ENV=sepolia"
    );
  }

  if (result.data.VITE_CONTRACTS_ENV === "mainnet" && !result.data.VITE_RPC_URL_MAINNET) {
    throw new Error(
      "Environment validation failed:\n  - VITE_RPC_URL_MAINNET: VITE_RPC_URL_MAINNET is required when VITE_CONTRACTS_ENV=mainnet"
    );
  }

  return result.data;
}

const env = validateEnv();

export const APP_ENV = env.VITE_APP_ENV;
export const CONTRACTS_ENV = env.VITE_CONTRACTS_ENV;
export const RPC_URL_FOUNDRY = env.VITE_RPC_URL_FOUNDRY;
export const RPC_URL_MAINNET = env.VITE_RPC_URL_MAINNET;
export const RPC_URL_SEPOLIA = env.VITE_RPC_URL_SEPOLIA;
export const WALLET_CONNECT_PROJECT_ID = env.VITE_WALLET_CONNECT_PROJECT_ID;
export const INDEXER_API_URL = env.VITE_INDEXER_API_URL;
export const ETHEREUM_EXPLORER_URL = env.VITE_ETHEREUM_EXPLORER_URL;
export const LAUNCH_ACTIVE = env.VITE_LAUNCH_ACTIVE;
