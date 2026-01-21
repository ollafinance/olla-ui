import { createConfig, http, connect, reconnect, watchAccount, disconnect, getConnectors, watchConnectors, type Config, type Connector } from '@wagmi/core';
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
                injected(), 
            ] : [],
            ssr: true, 
        });

        if (typeof window !== 'undefined') {
            this.updateState(this.config.state.connections.size > 0 ? 'connected' : 'disconnected');
            
            // Watch for new connectors (EIP-6963 injection)
            watchConnectors(this.config, {
                onChange: () => this.refreshConnectors(),
            });
            this.refreshConnectors();

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
        this.refreshConnectors();
    }

    closeModal() {
        this.isModalOpen = false;
        this.error = undefined;
    }

    private refreshConnectors() {
        let allConnectors = getConnectors(this.config);
        
        // 1. Separate generic "Injected" from others
        const genericInjected = allConnectors.find(c => c.id === 'injected' && c.name === 'Injected');
        const specificConnectors = allConnectors.filter(c => c.id !== 'injected' || c.name !== 'Injected');

        // 2. If we have specific connectors (MetaMask, Phantom, etc.), hide the generic one
        // EIP-6963 providers will have distinct IDs or Names
        if (specificConnectors.length > 0 && genericInjected) {
             allConnectors = specificConnectors;
        }

        // 3. Deduplicate by ID
        const seen = new Set();
        this.connectors = allConnectors.filter(c => {
            const key = c.uid || c.id; 
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
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
