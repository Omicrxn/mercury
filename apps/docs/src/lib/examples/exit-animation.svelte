<script lang="ts">
	import { layout, mercury, presence } from '@omicrxn/mercury';
    import { Button } from '@svecodocs/kit';
	let show = $state(true);
	let trigger = $state(true);

	// 	<AnimatePresence>
	//   {show && <motion.div key="modal" exit={{ opacity: 0 }} />}
	// </AnimatePresence>
</script>


<div class="flex flex-col items-center justify-center gap-4">
    <div>
	{#if show}
		<div
			{@attach mercury({ animate: { opacity: 1 } })}
			out:presence={{
				opacity: 0,
				mode: 'sync'
			}}
			class="box opacity-0"
		></div>
	{/if}
    </div>
    <Button size="sm" onclick={() => (show = !show)}>
        {#if show}
            Hide
        {:else}
            Show
        {/if}
    </Button>

</div>
