<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	let container = $state<HTMLElement>();
</script>

<div class="flex w-full max-w-[400px] flex-col items-center gap-4">
	<h2 class="text-xl font-bold">Drag</h2>
	<p class="text-sm text-muted-foreground">Drag the box, or focus it and use the arrow keys.</p>
	<div
		bind:this={container}
		class="flex h-64 w-full items-center justify-center overflow-hidden rounded-md border-2 border-demo-accent"
	>
		{#if container}
			<button
				type="button"
				aria-label="Drag the box, or move it with the arrow keys"
				{@attach mercury({
					drag: true,
					dragConstraints: container,
					dragElastic: 0.12
				})}
				class="box draggable touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-demo-accent"
			></button>
		{/if}
	</div>
</div>
