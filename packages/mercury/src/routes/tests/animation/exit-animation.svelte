<script lang="ts">
	import { layout, mercury, presence } from '$lib/index.js';
	let show = $state(true);
	let trigger = $state(true);

	// 	<AnimatePresence>
	//   {show && <motion.div key="modal" exit={{ opacity: 0 }} />}
	// </AnimatePresence>
</script>

<button onclick={() => (show = !show)}>
	{#if show}
		hide
	{:else}
		show
	{/if}
</button>
<!-- {#if show}
	<div
		in:presence={{ opacity: 1, scale: 1 }}
		out:presence={{ opacity: 0, scale: 0 }}
		class="size-16 bg-blue-200 rounded-md border border-slate-500"
	/>
{/if} -->
<div>
	{#if show}
		<div
			{@attach mercury({ animate: { opacity: 1 } })}
			out:presence={{
				opacity: 0,
				mode: 'sync'
			}}
			class="size-16 bg-blue-200 rounded-md border border-slate-500 opacity-0"
		></div>
	{/if}
</div>
