<script lang="ts">
	import { mercury, presence } from '@omicrxn/mercury';
	let show = $state(true);
</script>

<div class="flex min-h-80 flex-col items-center justify-center gap-8 p-8">
	<button
		type="button"
		onclick={() => (show = !show)}
		class="rounded-md border border-demo-stroke bg-demo-fill min-h-11 px-5 py-2 text-sm font-medium text-demo-fill-foreground transition-colors hover:bg-demo-fill-hover"
	>
		{show ? 'Hide' : 'Show'}
	</button>

	<div
		class="flex size-48 items-center justify-center rounded-md border border-demo-stroke border-dashed bg-demo-surface"
	>
		{#if show}
			<div
				{@attach mercury({
					animate: { opacity: 1, scale: 1 },
					transition: { duration: 0.25, ease: [0.19, 1, 0.22, 1] }
				})}
				out:presence={{
					opacity: 0,
					scale: 0.95,
					mode: 'sync',
					transition: { duration: 0.18, ease: [0.19, 1, 0.22, 1] }
				}}
				class="size-16 rounded-md border border-demo-stroke bg-demo-fill opacity-0"
				style="transform: scale(0.95);"
			></div>
		{/if}
	</div>
</div>
