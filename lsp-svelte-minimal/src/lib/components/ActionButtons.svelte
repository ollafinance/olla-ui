<script lang="ts">
    import { wallet } from '../stores/wallet.svelte';
    import { olla } from '../stores/olla.svelte';
</script>

<div class="flex flex-col gap-4">
    <!-- Mint -->
    <button
        onclick={() => olla.mint()}
        disabled={wallet.status !== 'connected' || olla.isPending}
        class="w-full py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-all cursor-pointer"
    >
        {olla.isPending && olla.txType === 'mint' ? 'Minting...' : '1. Mint 100 AZT'}
    </button>

    <!-- Approve -->
    <button
        onclick={() => olla.approve()}
        disabled={wallet.status !== 'connected' || olla.isPending || parseFloat(olla.allowance) >= 0.1}
        class="w-full py-3 px-4 rounded-lg font-medium text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 transition-all cursor-pointer"
    >
        {olla.isPending && olla.txType === 'approve' ? 'Approving...' : parseFloat(olla.allowance) >= 0.1 ? 'Approved' : '2. Approve 0.1 AZT'}
    </button>

    <!-- Deposit -->
    <button
        onclick={() => olla.deposit()}
        disabled={wallet.status !== 'connected' || olla.isPending || parseFloat(olla.allowance) < 0.1}
        class="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-all cursor-pointer"
    >
        {olla.isPending && olla.txType === 'deposit' ? 'Depositing...' : '3. Deposit 0.1 AZT'}
    </button>
</div>
