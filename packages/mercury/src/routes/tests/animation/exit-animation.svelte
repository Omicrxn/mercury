<script lang="ts">
	import { mercury, presence } from '$lib/index.js';
	let show = $state(true);
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
	<button
		onclick={() => (show = !show)}
		class="rounded-md border border-slate-500 bg-blue-200 px-5 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300"
	>
		{show ? 'Hide' : 'Show'}
	</button>

	<div
		class="flex size-48 items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50"
	>
		{#if show}
			<div
				{@attach mercury({ animate: { opacity: 1 } })}
				out:presence={{
					opacity: 0,
					mode: 'sync'
				}}
				class="size-16 rounded-md border border-slate-500 bg-blue-200 opacity-0"
			></div>
		{/if}
	</div>
</div>
