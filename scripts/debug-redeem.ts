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
  const amountToRedeem = process.argv[2] || "10";

  // 1. Setup Client
  const rpcUrl = process.env.VITE_RPC_URL || "http://127.0.0.1:8545";
  // Default anvil key #0
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

  console.log(`Debug: Testing 'requestRedeem' flow (Approve -> Request)`);
  console.log(`Signer: ${account.address}`);
  console.log(`Amount: ${amountToRedeem} stAZT`);
  console.log(`OllaCore Address: ${CONTRACTS.OllaCore.address}`);
  console.log(`stAztec Address: ${CONTRACTS.StAztec.address}`);

  try {
    // 2. Check stAztec Balance
    const balance = await publicClient.readContract({
      address: CONTRACTS.StAztec.address,
      abi: CONTRACTS.StAztec.abi,
      functionName: "balanceOf",
      args: [account.address],
    }) as bigint;

    console.log(`Current stAztec Balance: ${formatEther(balance)}`);

    // 2.1 Check Paused State & Stats
    const isPaused = await publicClient.readContract({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
      functionName: "paused",
    });
    const totalAssets = await publicClient.readContract({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
      functionName: "totalAssets",
    }) as bigint;
    const exchangeRate = await publicClient.readContract({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
      functionName: "exchangeRate",
    }) as bigint;

    console.log(`OllaCore Paused: ${isPaused}`);
    console.log(`Total Assets: ${formatEther(totalAssets)} AZT`);
    console.log(`Exchange Rate: ${formatEther(exchangeRate)}`);

    // 2.5 Check for Active Requests
    console.log("Checking for active withdrawal requests...");
    const activeRequestId = await publicClient.readContract({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
      functionName: "activeRequestId",
      args: [account.address],
    }) as bigint;

    if (activeRequestId > 0n) {
      console.log(`WARN: Found active request ID: ${activeRequestId}`);
      const request = await publicClient.readContract({
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "getActiveWithdrawalRequest",
        args: [account.address],
      }) as any; 

      console.log("Active Request Details:", request);
      
      // Try to claim if finalized, or just proceed (likely revert if pending)
      if (request.finalized && !request.claimed) {
         console.log("Request is finalized. Attempting to claim...");
         const claimHash = await client.writeContract({
            address: CONTRACTS.OllaCore.address,
            abi: CONTRACTS.OllaCore.abi,
            functionName: "claimActiveRequest",
            args: [account.address],
         });
         await publicClient.waitForTransactionReceipt({ hash: claimHash });
         console.log("Claimed successfully.");
      }
    } else {
        console.log("No active withdrawal requests found.");
    }

    if (balance < parseEther(amountToRedeem)) {
      console.error("Error: Insufficient stAztec balance.");
      process.exit(1);
    }

    // 3. Approve OllaCore (Max Int)
    console.log("Step 1: Approving OllaCore (Max)...");
    const maxUint256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;
    const approveHash = await client.writeContract({
      address: CONTRACTS.StAztec.address,
      abi: CONTRACTS.StAztec.abi,
      functionName: "approve",
      args: [CONTRACTS.OllaCore.address, maxUint256],
    });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log("Approval Confirmed.");

    // 4. Request Redeem
    console.log("Step 2: Simulating requestRedeem...");
    
    try {
        const { result } = await publicClient.simulateContract({
            address: CONTRACTS.OllaCore.address,
            abi: CONTRACTS.OllaCore.abi,
            functionName: "requestRedeem",
            args: [parseEther(amountToRedeem), account.address],
            account: account.address, // Simulate as sender
        });
        console.log("Simulation SUCCESS. Result:", result);

        const redeemHash = await client.writeContract({
            address: CONTRACTS.OllaCore.address,
            abi: CONTRACTS.OllaCore.abi,
            functionName: "requestRedeem",
            args: [parseEther(amountToRedeem), account.address],
        });

        console.log(`Redeem Tx: ${redeemHash}`);
        const receipt = await publicClient.waitForTransactionReceipt({ hash: redeemHash });

        if (receipt.status === "success") {
            console.log("SUCCESS: requestRedeem transaction succeeded!");
            console.log(`Logs in receipt: ${receipt.logs.length}`);
        } else {
            console.error("FAILURE: requestRedeem transaction reverted.");
        }
    } catch (e: any) {
        console.error("Simulation/Execution FAILED:");
        console.error("Reason:", e.reason || e.shortMessage || e.message);
        if (e.metaMessages) console.error("Meta:", e.metaMessages);
    }

  } catch (error) {
    console.error("Execution failed:", error);
    process.exit(1);
  }
}

main();
