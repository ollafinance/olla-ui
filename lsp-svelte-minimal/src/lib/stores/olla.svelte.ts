import { parseEther, formatEther, type Address } from 'viem';
import { foundry } from 'viem/chains';
import { wallet } from './wallet.svelte';
import OllaCoreABI from '../../../src/abis/OllaCore.json';
import MockAztecABI from '../../../src/abis/MockAztec.json';
import addresses from '../../../src/abis/addresses.json';

const ASSET_ADDRESS = addresses.Asset as Address;
const OLLA_CORE_ADDRESS = addresses.OllaCore as Address;

export class OllaProtocolStore {
    // Data State
    balance = $state<string>("0");
    allowance = $state<string>("0");

    // Transaction State
    hash = $state<string | undefined>(undefined);
    error = $state<string | undefined>(undefined);
    isPending = $state(false);
    isConfirmed = $state(false);
    txType = $state<'mint' | 'approve' | 'deposit' | null>(null);

    constructor() {
        // Initialization if needed
    }

    async refreshData() {
        if (!wallet.publicClient || !wallet.address) return;
        
        try {
            const balance = await wallet.publicClient.readContract({
                address: ASSET_ADDRESS,
                abi: MockAztecABI,
                functionName: 'balanceOf',
                args: [wallet.address]
            }) as bigint;
            this.balance = formatEther(balance);

            const allowance = await wallet.publicClient.readContract({
                address: ASSET_ADDRESS,
                abi: MockAztecABI,
                functionName: 'allowance',
                args: [wallet.address, OLLA_CORE_ADDRESS]
            }) as bigint;
            this.allowance = formatEther(allowance);
        } catch (e) {
            console.error("Failed to fetch data", e);
        }
    }

    async mint() {
        await this.executeTx('mint', async () => {
             return await wallet.client!.writeContract({
                account: wallet.address!,
                address: ASSET_ADDRESS,
                abi: MockAztecABI,
                functionName: 'mint',
                args: [wallet.address, parseEther('100')],
                chain: foundry
            });
        });
    }

    async approve() {
        await this.executeTx('approve', async () => {
            return await wallet.client!.writeContract({
                account: wallet.address!,
                address: ASSET_ADDRESS,
                abi: MockAztecABI,
                functionName: 'approve',
                args: [OLLA_CORE_ADDRESS, parseEther('0.1')],
                chain: foundry
            });
        });
    }

    async deposit() {
        await this.executeTx('deposit', async () => {
            return await wallet.client!.writeContract({
                account: wallet.address!,
                address: OLLA_CORE_ADDRESS,
                abi: OllaCoreABI,
                functionName: 'deposit',
                args: [parseEther('0.1'), wallet.address],
                chain: foundry
            });
        });
    }

    private async executeTx(type: 'mint' | 'approve' | 'deposit', txFn: () => Promise<`0x${string}`>) {
        if (!wallet.client || !wallet.publicClient || !wallet.address) return;
        
        this.isPending = true;
        this.error = undefined;
        this.hash = undefined;
        this.isConfirmed = false;
        this.txType = type;

        try {
            const hash = await txFn();
            this.hash = hash;
            
            await wallet.publicClient.waitForTransactionReceipt({ hash });
            
            this.isConfirmed = true;
            await this.refreshData();
        } catch (e) {
             this.error = (e as Error).message;
        } finally {
            this.isPending = false;
        }
    }
}

export const olla = new OllaProtocolStore();
