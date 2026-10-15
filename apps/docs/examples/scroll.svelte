<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	let scrollRoot = $state<HTMLElement>();
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (The scroll region needs keyboard focus to scroll.) -->
<div
	bind:this={scrollRoot}
	role="region"
	aria-label="Scroll animation example"
	tabindex="0"
	class="flex h-64 w-full flex-col items-center overflow-y-auto overscroll-contain rounded-md border border-border p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-demo-accent"
>
	<div class="flex h-72 w-full shrink-0 flex-col items-center gap-2 pt-8 text-sm font-medium">
		<p>Scroll down to move and rotate the box</p>
		<span aria-hidden="true">↓</span>
	</div>
	{#if scrollRoot}
		<div
			class="box shrink-0"
			{@attach mercury({
				scroll: {
					enter: { x: 64, rotate: 180 },
					exit: { x: 0, rotate: 0 },
					transition: { duration: 0.6, ease: 'easeInOut' },
					amount: 0.5,
					root: scrollRoot
				}
			})}
		></div>
	{/if}
	<div class="h-24 w-full shrink-0" aria-hidden="true"></div>
</div>
