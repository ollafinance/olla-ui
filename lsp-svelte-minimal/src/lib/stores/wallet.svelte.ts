import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { foundry } from '@wagmi/core/chains';
import { watchAccount, reconnect, http, type Config } from '@wagmi/core';
import type { Address } from 'viem';

// 1. Get Project ID from Cloud (Use a placeholder for this demo)
const projectId = '1f4405908295832c695a12154625514f'; // Reown Demo ID

// 2. Configure Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
    networks: [foundry],
    projectId,
    transports: {
        [foundry.id]: http('http://127.0.0.1:8545')
    }
});

export class WalletStore {
    address = $state<Address | undefined>(undefined);
    status = $state<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
    error = $state<string | undefined>(undefined);
    chainId = $state<number | undefined>(undefined);
    
    // Expose config for Olla store
    config: Config = wagmiAdapter.wagmiConfig;
    
    // AppKit Instance
    modal: ReturnType<typeof createAppKit>;

    constructor() {
        // 3. Create AppKit Modal
        this.modal = createAppKit({
            adapters: [wagmiAdapter],
            networks: [foundry],
            projectId,
            features: {
                analytics: true,
            },
            themeMode: 'light'
        });

        // 4. Watch for account changes
        watchAccount(this.config, {
            onChange: (account) => {
                this.address = account.address;
                this.status = account.status;
                this.chainId = account.chainId;
            },
        });
        
        // 5. Initialize Reconnect
        reconnect(this.config);
    }

    async open() {
        await this.modal.open();
    }

    async disconnect() {
        await this.modal.disconnect();
    }
}

export const wallet = new WalletStore();
