#!/usr/bin/env npx tsx

import fs from "fs";
import path from "path";
import { createWalletClient, createPublicClient, http, parseEther, formatEther } from "viem";
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
  const amountToDeposit = process.argv[2] || "100";

  // 1. Setup Client
  const rpcUrl = process.env.VITE_RPC_URL || "http://127.0.0.1:8545";
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

  console.log(`Debug: Testing 'deposit' flow (Approve -> Deposit)`);
  console.log(`Signer: ${account.address}`);
  console.log(`Amount: ${amountToDeposit} AZT`);

  try {
    // 2. Check AZT Balance
    const balance = await publicClient.readContract({
      address: CONTRACTS.Asset.address,
      abi: CONTRACTS.Asset.abi,
      functionName: "balanceOf",
      args: [account.address],
    }) as bigint;

    console.log(`Current AZT Balance: ${formatEther(balance)}`);

    if (balance < parseEther(amountToDeposit)) {
      console.error("Error: Insufficient AZT balance. Run mint script first.");
      process.exit(1);
    }

    // 3. Approve OllaCore
    console.log("Step 1: Approving OllaCore...");
    const approveHash = await client.writeContract({
      address: CONTRACTS.Asset.address,
      abi: CONTRACTS.Asset.abi,
      functionName: "approve",
      args: [CONTRACTS.OllaCore.address, parseEther(amountToDeposit)],
    });

    console.log(`Approval Tx: ${approveHash}`);
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("Approval Confirmed.");

    // 4. Deposit
    console.log("Step 2: Calling deposit...");
    const depositHash = await client.writeContract({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
      functionName: "deposit",
      args: [parseEther(amountToDeposit), account.address],
    });

    console.log(`Deposit Tx: ${depositHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });

    if (receipt.status === "success") {
      console.log("SUCCESS: deposit transaction succeeded!");
    } else {
      console.error("FAILURE: deposit transaction reverted.");
    }

  } catch (error) {
    console.error("Execution failed:", error);
    process.exit(1);
  }
}

main();
