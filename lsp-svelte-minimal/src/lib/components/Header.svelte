<script lang="ts">
	import { wallet } from '../stores/wallet.svelte';

	function handleConnect() {
		wallet.connect();
	}
</script>

<header class="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
    <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Olla Dashboard</h1>
    {#if wallet.status === 'connected'}
        <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-700">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
            </span>
        </div>
    {:else}
        <button
            onclick={handleConnect}
            class="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer"
        >
            {wallet.status === 'connecting' ? 'Connecting...' : 'Connect Wallet'}
        </button>
    {/if}
</header>
