import { z } from "zod";

const walletConnectProjectIdSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z.string().min(1).optional(),
);

const envSchema = z.object({
  VITE_RPC_URL: z.url("VITE_RPC_URL must be a valid URL").default("http://127.0.0.1:8545"),
  VITE_WALLET_CONNECT_PROJECT_ID: walletConnectProjectIdSchema,
});

function validateEnv() {
  const isDev = import.meta.env.DEV;
  const result = envSchema.safeParse({
    VITE_RPC_URL: import.meta.env.VITE_RPC_URL,
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
      "Environment validation failed:\n  - VITE_WALLET_CONNECT_PROJECT_ID: VITE_WALLET_CONNECT_PROJECT_ID is required",
    );
  }

  return result.data;
}

const env = validateEnv();

export const RPC_URL = env.VITE_RPC_URL;
export const WALLET_CONNECT_PROJECT_ID = env.VITE_WALLET_CONNECT_PROJECT_ID;
