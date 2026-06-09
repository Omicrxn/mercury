<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import { mercury, presence } from '$lib/index.js';
	import { transform } from 'motion';
	let copied = $state(false);
	const copy = () => {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1000);
	};
</script>

<button onclick={copy} class="border rounded-md size-16 flex justify-center items-center">
	{#key copied}
		{#if copied}
			<span
				class="opacity-0"
				{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
				out:presence={{ opacity: 0, scale: 0, mode: 'sync' }}><Check /></span
			>
		{:else}
			<span
				class="opacity-0"
				{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
				out:presence={{ opacity: 0, scale: 0, mode: 'sync' }}><Copy /></span
			>
		{/if}
	{/key}
</button>
