<script lang="ts">
	import { mercury, presence } from '@omicrxn/mercury';
	let show = $state(true);
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
    <button
        type="button"
        class="rounded-md border border-slate-500 px-3 py-1 text-sm font-medium"
        onclick={() => (show = !show)}
    >
        {#if show}
            Hide
        {:else}
            Show
        {/if}
    </button>

</div>
