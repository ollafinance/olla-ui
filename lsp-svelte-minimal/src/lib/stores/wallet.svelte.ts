import { createConfig, http, connect, reconnect, watchAccount, disconnect, getConnectors, watchConnectors, type Config, type Connector } from '@wagmi/core';
import { foundry } from '@wagmi/core/chains';
import { metaMask, coinbaseWallet, injected } from '@wagmi/connectors';
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
                metaMask(),
                coinbaseWallet({ appName: 'Olla UI' }),
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
        const sortedConnectors: Connector[] = [];
        const seenIds = new Set<string>();

        for (const connector of allConnectors) {
            let shouldInclude = true;

            // Handle Generic 'injected' Connector Logic
            if (connector.id === 'injected') {
                // Filtering Rule:
                // Only hide 'injected' if we ALREADY have a specific connector for it.
                // e.g. If we have a connector named 'MetaMask' (id: metaMask or EIP-6963 uuid),
                // and this injected one is ALSO identifying as MetaMask, we might skip it.

                // We can check window.ethereum.isMetaMask but we shouldn't mutate connector.name here.
                // We'll trust the ID deduplication mostly, but handle the specific MetaMask overlap.

                let isMetaMaskInjected = false;
                if (typeof window !== 'undefined' && window.ethereum) {
                    // @ts-ignore
                    isMetaMaskInjected = !!window.ethereum.isMetaMask;
                }

                const hasExplicitMetaMask = allConnectors.some(c => c.id === 'metaMask' && c !== connector);

                if (isMetaMaskInjected && hasExplicitMetaMask) {
                    shouldInclude = false;
                }
            }

            if (shouldInclude && !seenIds.has(connector.id)) {
                sortedConnectors.push(connector);
                seenIds.add(connector.id);
            }
        }

        this.connectors = sortedConnectors;
    }

    // --- Connection Actions ---

    async connect(args: { connector: Connector }) {
        this.error = undefined;
        this.status = 'connecting';
        try {
            // Svelte 5 State Proxy Fix:
            // The 'args.connector' passed from the UI is likely a Proxy object.
            // Wagmi needs the raw internal Connector instance.
            // We find it by ID from the config's live list.
            const rawConnector = getConnectors(this.config).find(c => c.id === args.connector.id);

            if (!rawConnector) {
                throw new Error(`Connector ${args.connector.id} not found`);
            }

            await connect(this.config, { connector: rawConnector });
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
