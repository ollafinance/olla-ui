import { createConfig, http, connect, reconnect, watchAccount, disconnect, getConnectors, type Config, type Connector } from '@wagmi/core';
import { foundry } from '@wagmi/core/chains';
import { injected } from '@wagmi/connectors';
import type { Address } from 'viem';

export class WalletStore {
    address = $state<Address | undefined>(undefined);
    status = $state<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
    error = $state<string | undefined>(undefined);
    chainId = $state<number | undefined>(undefined);
    
    // Modal State
    isModalOpen = $state(false);
    connectors = $state<Connector[]>([]);

    config: Config;

    constructor() {
        this.config = createConfig({
            chains: [foundry],
            transports: {
                [foundry.id]: http('http://127.0.0.1:8545'),
            },
            connectors: typeof window !== 'undefined' ? [
                injected({ target: 'metaMask', shimDisconnect: true }), 
                injected(), 
            ] : [],
            ssr: true, 
        });

        if (typeof window !== 'undefined') {
            this.updateState(this.config.state.connections.size > 0 ? 'connected' : 'disconnected');
            // De-duplicate connectors
            const allConnectors = getConnectors(this.config);
            const seen = new Set();
            this.connectors = allConnectors.filter(c => {
                if (seen.has(c.id)) return false;
                seen.add(c.id);
                return true;
            });

            watchAccount(this.config, {
                onChange: (account) => {
                    this.address = account.address;
                    this.status = account.status;
                    this.chainId = account.chainId;
                },
            });

            reconnect(this.config);
        }
    }

    private updateState(status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting') {
        this.status = status;
    }

    // --- Modal Actions ---

    openModal() {
        this.isModalOpen = true;
        this.error = undefined;
        // Refresh connectors in case new ones injected
        const allConnectors = getConnectors(this.config);
        const seen = new Set();
        this.connectors = allConnectors.filter(c => {
            if (seen.has(c.id)) return false;
            seen.add(c.id);
            return true;
        });
    }

    closeModal() {
        this.isModalOpen = false;
        this.error = undefined;
    }

    // --- Connection Actions ---

    async connect(args: { connector: Connector }) {
        this.error = undefined;
        this.status = 'connecting';
        try {
            await connect(this.config, args);
            this.closeModal();
        } catch (e) {
            console.error(e);
            this.status = 'disconnected';
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
