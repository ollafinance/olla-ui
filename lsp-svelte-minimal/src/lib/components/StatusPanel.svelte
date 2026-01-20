<script lang="ts">
    import { olla } from '../stores/olla.svelte';
</script>

<div class="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
    <h2 class="text-sm font-semibold text-blue-800 uppercase tracking-wide">Your Status</h2>
    <div class="text-sm text-gray-700 flex justify-between">
        <span>Asset Balance:</span>
        <span class="font-mono">{olla.balance} AZT</span>
    </div>
    <div class="text-sm text-gray-700 flex justify-between">
        <span>Allowance:</span>
        <span class="font-mono">{olla.allowance} AZT</span>
    </div>
</div>
