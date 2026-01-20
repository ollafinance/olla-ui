import { createConfig, http, connect, reconnect, watchAccount, disconnect, type Config, type GetAccountReturnType } from '@wagmi/core';
import { foundry } from '@wagmi/core/chains';
import { injected } from '@wagmi/connectors';
import type { Address } from 'viem';

export class WalletStore {
    address = $state<Address | undefined>(undefined);
    status = $state<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
    error = $state<string | undefined>(undefined);
    chainId = $state<number | undefined>(undefined);
    
    config: Config;

    constructor() {
        this.config = createConfig({
            chains: [foundry],
            transports: {
                [foundry.id]: http(),
            },
            connectors: [injected()],
        });

        // Initialize state from current wagmi state
        this.updateState(this.config.state.connections.size > 0 ? 'connected' : 'disconnected');

        // Watch for account changes
        watchAccount(this.config, {
            onChange: (account) => {
                this.address = account.address;
                this.status = account.status;
                this.chainId = account.chainId;
            },
        });

        // Attempt auto-reconnect
        reconnect(this.config);
    }

    private updateState(status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting') {
        this.status = status;
    }

    async connect() {
        this.error = undefined;
        try {
            await connect(this.config, { connector: injected() });
        } catch (e) {
            console.error(e);
            this.error = (e as Error).message;
        }
    }

    async disconnect() {
        try {
            await disconnect(this.config);
        } catch (e) {
            console.error(e);
        }
    }
}

export const wallet = new WalletStore();
