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

// Use a random private key for testing
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // Anvil default #0

const assetAddress = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const ollaCoreAddress = '0xdc64a140aa3e981100a9beca4e685f962f0cf6c9';

async function testPermit() {
  try {
    console.log('Testing with account:', account.address);

    // 1. Mint tokens
    console.log('Minting...');
    await walletClient.writeContract({
      account,
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'mint',
      args: [account.address, parseEther('100')]
    });

    // 2. Prepare Permit
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
    console.log('Name:', name);

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const value = parseEther('10');

    // 3. Approve
    console.log('Approving...');
    await walletClient.writeContract({
      account,
      address: assetAddress,
      abi: MockAztecABI,
      functionName: 'approve',
      args: [ollaCoreAddress, value]
    });

    // 4. Call deposit
    console.log('Calling deposit...');
    const hash = await walletClient.writeContract({
      account,
      address: ollaCoreAddress,
      abi: OllaCoreABI,
      functionName: 'deposit',
      args: [
        value,
        account.address
      ],
    });
    
    console.log('Tx Hash:', hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log('Status:', receipt.status);


  } catch (e) {
    console.error('Error:', e);
  }
}

testPermit();

