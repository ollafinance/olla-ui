#!/usr/bin/env npx tsx

import fs from "fs";
import path from "path";
import { createWalletClient, createPublicClient, http, parseEther, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { foundry } from "viem/chains";
import { CONTRACTS } from "../src/constants/contracts";

// --- Env Loader ---
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        process.env[match[1]] = match[2].replace(/^"(.*)"$/, "$1");
      }
    });
  }
}
loadEnv();

async function main() {
  // 1. Get arguments
  const recipient = process.argv[2];
  const amount = process.argv[3] || "100";

  if (!recipient) {
    console.error(
      "Usage: npx tsx scripts/mint-mock-aztec-tokens.ts <recipient_address> [amount]",
    );
    process.exit(1);
  }

  // 2. Setup Client
  const rpcUrl = process.env.VITE_RPC_URL_FOUNDRY || "http://127.0.0.1:8545";
  // Default anvil key #0 if not provided.
  const privateKey = (process.env.PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80") as `0x${string}`;

  const account = privateKeyToAccount(privateKey);

  const client = createWalletClient({
    account,
    chain: foundry,
    transport: http(rpcUrl),
  });

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(rpcUrl),
  });

  console.log(`Minting ${amount} AZT to ${recipient}...`);
  console.log(`Using RPC: ${rpcUrl}`);
  console.log(`Signer: ${account.address}`);

  // Retry logic for nonce issues
  let nonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: "pending",
  });
  let hash: Hex | null = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts && !hash) {
    try {
      console.log(`Attempt ${attempts + 1}/${maxAttempts} with nonce ${nonce}...`);
      
      hash = await client.writeContract({
        address: CONTRACTS.Asset.address,
        abi: CONTRACTS.Asset.abi,
        functionName: "mint",
        args: [recipient as Hex, parseEther(amount)],
        nonce,
      });

      console.log(`Transaction sent: ${hash}`);
      break;
    } catch (error) {
      const errorMessage = String(error);
      if (errorMessage.includes("nonce too low") || errorMessage.includes("Nonce provided for the transaction")) {
        console.log(`Nonce ${nonce} was too low, retrying with ${nonce + 1}...`);
        nonce++;
        attempts++;
        // Small delay before retry
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        // Not a nonce error, rethrow
        throw error;
      }
    }
  }

  if (!hash) {
    console.error(`Failed to mint after ${maxAttempts} attempts due to nonce issues.`);
    console.error("This usually happens when the RPC node is under heavy load or the account is being used concurrently.");
    process.exit(1);
  }

  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (receipt.status === "success") {
      console.log("Minting successful!");
    } else {
      console.error("Minting failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error waiting for transaction receipt:", error);
    process.exit(1);
  }
}

main();
