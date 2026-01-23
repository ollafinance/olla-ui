import { z } from "zod";

const envSchema = z.object({
  VITE_RPC_URL: z.string().url("VITE_RPC_URL must be a valid URL"),
  VITE_WALLET_CONNECT_PROJECT_ID: z.string().min(1, "VITE_WALLET_CONNECT_PROJECT_ID is required"),
});

function validateEnv() {
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

  return result.data;
}

const env = validateEnv();

export const RPC_URL = env.VITE_RPC_URL;
export const WALLET_CONNECT_PROJECT_ID = env.VITE_WALLET_CONNECT_PROJECT_ID;
