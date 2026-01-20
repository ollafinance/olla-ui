<script lang="ts">
    import { olla } from '$lib/stores/olla.svelte';
    import { wallet } from '$lib/stores/wallet.svelte';
    import Header from '$lib/components/Header.svelte';
    import StatusPanel from '$lib/components/StatusPanel.svelte';
    import ActionButtons from '$lib/components/ActionButtons.svelte';

    $effect(() => {
        if (wallet.status === 'connected') {
            olla.refreshData();
        }
    });
</script>

<div class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
	<div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        
		<Header />

		<div class="space-y-6">
			<StatusPanel />

			<ActionButtons />

			{#if olla.hash}
				<div
					class="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-200"
				>
					<span class="font-semibold">Tx Hash:</span>
					{olla.hash}
				</div>
			{/if}

			{#if olla.isConfirmed}
				<div
					class="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200 text-center font-medium"
				>
					Transaction Confirmed!
				</div>
			{/if}

			{#if olla.error}
				<div class="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
					Error: {olla.error}
				</div>
			{/if}
		</div>
	</div>
</div>
