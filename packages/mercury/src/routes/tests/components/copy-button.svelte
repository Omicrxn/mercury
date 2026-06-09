<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import { mercury, presence } from '$lib/index.js';
	let copied = $state(false);
	const copy = () => {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1000);
	};
</script>

<button onclick={copy} class="border rounded-md size-16 flex justify-center items-center relative overflow-hidden">
	{#if copied}
		<span
			class="opacity-0 absolute inset-0 flex justify-center items-center"
			{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
			out:presence={{ opacity: 0, scale: 0, mode: 'sync' }}><Check /></span
		>
	{:else}
		<span
			class="opacity-0 absolute inset-0 flex justify-center items-center"
			{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
			out:presence={{ opacity: 0, scale: 0, mode: 'sync' }}><Copy /></span
		>
	{/if}
</button>
