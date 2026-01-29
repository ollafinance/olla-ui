import { createPublicClient, createWalletClient, http, formatEther, parseEther, parseSignature } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { foundry } from 'viem/chains';
import MockAztecABI from './src/generated/abis/MockAztec.json';
import OllaCoreABI from './src/generated/abis/OllaCore.json';

const transport = http('http://127.0.0.1:8545');
const publicClient = createPublicClient({ 
  chain: foundry,
  transport
});
const walletClient = createWalletClient({
  chain: foundry,
  transport
});

// Anvil default account #0
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

const assetAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const ollaCoreAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';

async function runTests() {
  console.log('='.repeat(60));
  console.log('OllaCore Deposit Tests');
  console.log('='.repeat(60));
  console.log('Account:', account.address);
  console.log('Asset:', assetAddress);
  console.log('OllaCore:', ollaCoreAddress);
  console.log('');

  // ============================================================
  // SETUP: Verify contract state
  // ============================================================
  console.log('--- Verifying Contract State ---');
  
  const assetOnCore = await publicClient.readContract({
    address: ollaCoreAddress,
    abi: OllaCoreABI,
    functionName: 'asset'
  });
  console.log('OllaCore.asset():', assetOnCore);
  console.log('Expected Asset:', assetAddress);
  console.log('Asset Match:', (assetOnCore as string).toLowerCase() === assetAddress.toLowerCase());

  const paused = await publicClient.readContract({
    address: ollaCoreAddress,
    abi: OllaCoreABI,
    functionName: 'paused'
  });
  console.log('OllaCore.paused():', paused);

  const stAztec = await publicClient.readContract({
    address: ollaCoreAddress,
    abi: OllaCoreABI,
    functionName: 'stAztec'
  });
  console.log('OllaCore.stAztec():', stAztec);

  console.log('');

  // ============================================================
  // SETUP: Mint tokens
  // ============================================================
  console.log('--- Minting Tokens ---');
  try {
    await walletClient.writeContract({
      account,
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'mint',
      args: [account.address, parseEther('1000')]
    });
    console.log('Minted 1000 AZTEC to', account.address);
  } catch (e: any) {
    console.error('Mint failed:', e.shortMessage || e.message);
  }

  const balance = await publicClient.readContract({
    address: assetAddress,
    abi: MockAztecABI,
    functionName: 'balanceOf',
    args: [account.address]
  });
  console.log('Balance:', formatEther(balance as bigint), 'AZTEC');
  console.log('');

  // ============================================================
  // TEST 1: Basic deposit (with approve)
  // ============================================================
  console.log('='.repeat(60));
  console.log('TEST 1: Basic deposit (approve + deposit)');
  console.log('='.repeat(60));

  const depositAmount = parseEther('10');

  try {
    // Approve
    console.log('Approving', formatEther(depositAmount), 'AZTEC...');
    await walletClient.writeContract({
      account,
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'approve',
      args: [ollaCoreAddress, depositAmount]
    });
    console.log('Approve: SUCCESS');

    // Deposit
    console.log('Calling deposit...');
    const hash = await walletClient.writeContract({
      account,
      address: ollaCoreAddress,
      abi: OllaCoreABI,
      functionName: 'deposit',
      args: [depositAmount, account.address],
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Deposit: SUCCESS');
    console.log('Tx Hash:', hash);
    console.log('Status:', receipt.status);
  } catch (e: any) {
    console.error('TEST 1 FAILED:', e.shortMessage || e.message);
    if (e.cause?.data) {
      console.error('Revert data:', e.cause.data);
    }
  }
  console.log('');

  // ============================================================
  // TEST 2: depositWithPermit
  // ============================================================
  console.log('='.repeat(60));
  console.log('TEST 2: depositWithPermit');
  console.log('='.repeat(60));

  try {
    // Get current nonce
    const nonce = await publicClient.readContract({
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'nonces',
      args: [account.address]
    });
    console.log('Nonce:', nonce);

    // Get asset name for domain
    const name = await publicClient.readContract({
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'name'
    });
    console.log('Asset Name:', name);

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const value = parseEther('10');

    console.log('');
    console.log('Permit Parameters:');
    console.log('  owner:', account.address);
    console.log('  spender:', ollaCoreAddress);
    console.log('  value:', formatEther(value), 'AZTEC');
    console.log('  nonce:', nonce);
    console.log('  deadline:', deadline.toString());
    console.log('');
    console.log('Domain:');
    console.log('  name:', name);
    console.log('  version: "1"');
    console.log('  chainId: 31337');
    console.log('  verifyingContract:', assetAddress);
    console.log('');

    // Sign Permit
    console.log('Signing permit...');
    const signature = await walletClient.signTypedData({
      account,
      domain: {
        name: name as string,
        version: '1',
        chainId: 31337,
        verifyingContract: assetAddress,
      },
      types: {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      message: {
        owner: account.address,
        spender: ollaCoreAddress,
        value,
        nonce: nonce as bigint,
        deadline,
      },
    });

    const { v, r, s } = parseSignature(signature);
    console.log('Signature:');
    console.log('  v:', Number(v));
    console.log('  r:', r);
    console.log('  s:', s);
    console.log('');

    // Call depositWithPermit
    console.log('Calling depositWithPermit...');
    const hash = await walletClient.writeContract({
      account,
      address: ollaCoreAddress,
      abi: OllaCoreABI,
      functionName: 'depositWithPermit',
      args: [
        value,
        account.address,
        deadline,
        Number(v),
        r,
        s
      ],
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('depositWithPermit: SUCCESS');
    console.log('Tx Hash:', hash);
    console.log('Status:', receipt.status);

    // Check for DebugPermitCall event
    if (receipt.logs.length > 0) {
      console.log('');
      console.log('Events emitted:', receipt.logs.length);
    }

  } catch (e: any) {
    console.error('TEST 2 FAILED:', e.shortMessage || e.message);
    if (e.cause?.data) {
      console.error('Revert data:', e.cause.data);
    }
  }
  console.log('');

  // ============================================================
  // TEST 3: Direct permit call (to verify signature is correct)
  // ============================================================
  console.log('='.repeat(60));
  console.log('TEST 3: Direct permit call on MockAztec');
  console.log('='.repeat(60));

  try {
    // Get fresh nonce
    const nonce = await publicClient.readContract({
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'nonces',
      args: [account.address]
    });
    console.log('Nonce:', nonce);

    const name = await publicClient.readContract({
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'name'
    });

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const value = parseEther('10');

    // Sign Permit
    console.log('Signing permit...');
    const signature = await walletClient.signTypedData({
      account,
      domain: {
        name: name as string,
        version: '1',
        chainId: 31337,
        verifyingContract: assetAddress,
      },
      types: {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      message: {
        owner: account.address,
        spender: ollaCoreAddress,
        value,
        nonce: nonce as bigint,
        deadline,
      },
    });

    const { v, r, s } = parseSignature(signature);

    // Call permit directly on MockAztec
    console.log('Calling permit directly on Asset...');
    await walletClient.writeContract({
      account,
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'permit',
      args: [
        account.address,
        ollaCoreAddress,
        value,
        deadline,
        Number(v),
        r,
        s
      ]
    });
    console.log('Direct permit: SUCCESS');
    console.log('');
    console.log('This proves the permit signature is VALID.');
    console.log('If TEST 2 failed but TEST 3 passed, the issue is in OllaCore._deposit()');

  } catch (e: any) {
    console.error('TEST 3 FAILED:', e.shortMessage || e.message);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Tests Complete');
  console.log('='.repeat(60));
}

runTests();
