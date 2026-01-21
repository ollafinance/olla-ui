<script lang="ts">
    import { wallet } from '$lib/stores/wallet.svelte';
    import { fade, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    
    // Fallback/Generic Icons
    const ICONS: Record<string, string> = {
        'metaMask': '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M27.425 2.854l-5.467 5.619 2.508-8.473zM4.775 2.854l2.959-2.854 2.508 8.473zM14.775 24.437l1.092 3.693 1.092-3.693 7.85-4.482-1.425-9.675-7.517 3.596-7.517-3.596-1.425 9.675zM8.883 17.587l2.825 8.921-6.933-4.325zM20.292 26.508l2.825-8.921 4.108 4.596zM28.025 8.783l2.85 4.308-5.325 3.167 1.5-6.683zM4.175 8.783l0.975 0.792 1.5 6.683-5.325-3.167z" fill="#E17726"/></svg>',
        'injected': '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>',
        'safe': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'walletConnect': '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5-3 5 3M7 10v4l5 3 5-3v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        'coinbaseWallet': '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>'
    };

    function handleConnect(connector: any) {
        wallet.connect({ connector });
    }

    // Helper to get display icon (prioritize connector's own icon if EIP-6963 provided it)
    function getConnectorIcon(connector: any) {
        if (connector.icon) return `<img src="${connector.icon}" alt="${connector.name}" class="w-full h-full object-contain" />`;
        
        // Fallbacks
        const name = connector.name.toLowerCase();
        if (name.includes('metamask')) return ICONS['metaMask'];
        if (name.includes('safe')) return ICONS['safe'];
        if (name.includes('coinbase')) return ICONS['coinbaseWallet'];
        if (connector.id === 'walletConnect') return ICONS['walletConnect'];
        
        return ICONS['injected'];
    }
</script>

{#if wallet.isModalOpen}
    <div 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
    >
        <!-- Backdrop -->
        <div 
            class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            transition:fade={{ duration: 200 }}
            onclick={() => wallet.closeModal()}
            role="presentation"
        ></div>

        <!-- Modal Container -->
        <div 
            class="relative bg-white rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden scale-100"
            transition:scale={{ duration: 250, easing: cubicOut, start: 0.96, opacity: 0 }}
            onclick={(e) => e.stopPropagation()}
            role="document"
        >
            <!-- Header -->
            <div class="px-6 pt-6 pb-2 flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-900">Connect Wallet</h3>
                <button 
                    onclick={() => wallet.closeModal()}
                    class="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-all p-2 rounded-full cursor-pointer"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L10 8.586 5.707 4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Body -->
            <div class="p-4 space-y-2">
                {#if wallet.error}
                    <div class="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl border border-red-100 flex gap-2 items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                             <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <span>{wallet.error}</span>
                    </div>
                {/if}

                <div class="flex flex-col gap-2">
                    {#each wallet.connectors as connector (connector.uid || connector.id)}
                        <button
                            onclick={() => handleConnect(connector)}
                            class="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all group text-left border border-transparent hover:border-gray-200 cursor-pointer"
                        >
                            <span class="font-bold text-gray-800 text-base">
                                {connector.name}
                            </span>
                            
                            <div class="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 p-1.5 text-gray-600 group-hover:scale-110 transition-transform flex items-center justify-center">
                                 {@html getConnectorIcon(connector)}
                            </div>
                        </button>
                    {/each}
                </div>

                {#if wallet.connectors.length === 0}
                    <div class="text-center py-12 text-gray-400">
                        <p class="text-sm font-medium">No wallets found</p>
                        <p class="text-xs mt-1">Try installing MetaMask or similar.</p>
                    </div>
                {/if}
            </div>
            
            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
                <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Powered by Wagmi Core
                </p>
            </div>
        </div>
    </div>
{/if}
