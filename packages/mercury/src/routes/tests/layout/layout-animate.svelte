<script lang="ts">
	import { layout } from '$lib/index.js';

	let columns = $state(4);
	let stage = $state<HTMLElement>();
	let log = $state('Ready');

	const items = Array.from({ length: 8 }, (_, index) => index + 1);

	// Capture the current layout before changing the column count.
	const setColumns = (next: number) =>
		layout.animate(() => (columns = next), {
			transition: { type: 'spring', bounce: 0, duration: 0.3 },
			scope: stage,
			callbacks: {
				onPlay: () => (log = 'playing'),
				onComplete: () => (log = 'complete')
			}
		});

	// Also works for DOM changes Svelte doesn't know about.
	const toggleCompact = () =>
		layout.animate(() => stage?.classList.toggle('compact'), {
			scope: stage,
			transition: { type: 'spring', duration: 0.3, bounce: 0 }
		});

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Layout Animation: layout.animate()</h2>
			<p class="text-sm text-slate-600">
				Animation status: <span data-log>{log}</span>
			</p>
		</div>

		<div
			bind:this={stage}
			class="stage grid w-full gap-2 rounded-md border border-dashed border-slate-500 bg-slate-50 p-4"
			style:grid-template-columns="repeat({columns}, minmax(0, 1fr))"
		>
			{#each items as item (item)}
				<div
					{...layout.props()}
					class="tile flex h-16 items-center justify-center rounded-md border border-slate-500 bg-blue-200 font-medium text-slate-800"
				>
					<span {...layout.props({ type: 'position' })}>{item}</span>
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap gap-2">
			<button class={buttonClass} onclick={() => setColumns(2)}>2 columns</button>
			<button class={buttonClass} onclick={() => setColumns(4)}>4 columns</button>
			<button class={buttonClass} onclick={() => setColumns(8)}>8 columns</button>
			<button class={buttonClass} onclick={toggleCompact}>Toggle compact</button>
		</div>
	</div>
</div>

<style>
	.stage:global(.compact) .tile {
		height: 2rem;
	}
</style>
