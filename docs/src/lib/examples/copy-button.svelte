<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';
	import { mercury, presence } from '@omicrxn/mercury';
	import { transform } from 'motion';
	let copied = $state(false);
	const copy = () => {
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 1000);
	};
</script>

<button onclick={copy} class="dark:bg-slate-400 border dark:border-slate-50 border-slate-500 bg-slate-200 rounded-md size-9 flex justify-center items-center">
	{#key copied}
		{#if copied}
			<span
				class="opacity-0"
				{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
				out:presence={{ opacity: 0, scale: 0, transition:{duration:0.3} }}><Check size={16} /></span
			>
		{:else}
			<span
				class="opacity-0"
				{@attach mercury({ animate: { opacity: 1, scale: 1 } })}
				out:presence={{ opacity: 0, scale: 0, transition:{duration:0.3} }}><Copy size={16}/></span
			>
		{/if}
	{/key}
</button>
