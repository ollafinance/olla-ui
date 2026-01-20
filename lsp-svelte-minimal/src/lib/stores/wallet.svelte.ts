import { createWalletClient, createPublicClient, custom, type WalletClient, type PublicClient, type Address } from 'viem';
import { foundry } from 'viem/chains';

export class WalletStore {
    address = $state<Address | undefined>(undefined);
    status = $state<'disconnected' | 'connecting' | 'connected'>('disconnected');
    error = $state<string | undefined>(undefined);
    
    client: WalletClient | undefined;
    publicClient: PublicClient | undefined;

    constructor() {
        // Auto-connect logic could go here
    }

    async connect() {
         if (typeof window === 'undefined' || !window.ethereum) {
             this.error = "No wallet found";
             return;
         }
         this.status = 'connecting';
         try {
             this.client = createWalletClient({
                 chain: foundry,
                 transport: custom(window.ethereum)
             });
             this.publicClient = createPublicClient({
                 chain: foundry,
                 transport: custom(window.ethereum)
             });

             const [address] = await this.client.requestAddresses();
             this.address = address;
             this.status = 'connected';
         } catch (e) {
             console.error(e);
             this.status = 'disconnected';
             this.error = (e as Error).message;
         }
    }
}

export const wallet = new WalletStore();
