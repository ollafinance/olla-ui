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
        const allConnectors = getConnectors(this.config);
        
        // 1. Separate EIP-6963 connectors (distinct IDs) from the generic fallback
        const eip6963Connectors = allConnectors.filter(c => c.id !== 'injected');
        const genericInjected = allConnectors.find(c => c.id === 'injected');

        let finalConnectors: Connector[] = [];

        if (eip6963Connectors.length > 0) {
            // If we have specific EIP-6963 wallets, use them.
            // We generally hide the generic 'injected' to avoid duplicates, 
            // UNLESS the user has a wallet that doesn't support EIP-6963 yet.
            // For simplicity, we'll prioritize the specific ones.
            finalConnectors = [...eip6963Connectors];
        } else if (genericInjected) {
            // Fallback: No EIP-6963 detection. Use the generic injected provider.
            // Try to infer its name from window.ethereum
            if (typeof window !== 'undefined' && window.ethereum) {
                const eth = window.ethereum as any;
                if (eth.isPhantom) genericInjected.name = 'Phantom';
                else if (eth.isMetaMask) genericInjected.name = 'MetaMask';
                else if (eth.isTrust) genericInjected.name = 'Trust Wallet';
                else if (eth.isCoinbaseWallet) genericInjected.name = 'Coinbase Wallet';
                else if (eth.isBraveWallet) genericInjected.name = 'Brave Wallet';
                else genericInjected.name = 'Browser Wallet';
            }
            finalConnectors = [genericInjected];
        }

        // Deduplicate by UID or ID
        const seen = new Set();
        this.connectors = finalConnectors.filter(c => {
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
