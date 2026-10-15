<script lang="ts">
	import { layout } from '$lib/index.js';
	import { MediaQuery } from 'svelte/reactivity';

	const initialOrder = ['#ff0088', '#dd00ee', '#9911ff', '#0d63f8'];
	let order = $state([...initialOrder]);
	let autoplay = $state(true);
	const motionAllowed = new MediaQuery('(prefers-reduced-motion: no-preference)', false);

	const layoutGroup = layout(() => order, {
		transition: { type: 'spring', duration: 0.35, bounce: 0 }
	});

	$effect(() => {
		if (!autoplay || !motionAllowed.current) return;
		const interval = setInterval(() => (order = shuffle(order)), 1800);
		return () => clearInterval(interval);
	});

	function shuffle([...array]: string[]) {
		for (let index = array.length - 1; index > 0; index--) {
			const other = Math.floor(Math.random() * (index + 1));
			[array[index], array[other]] = [array[other], array[index]];
		}
		return array;
	}

	const buttonClass =
		'min-h-11 rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Layout Animation: Reordering</h2>
			<p class="text-sm text-slate-600">Shuffle the tiles, or play the automatic rearrangement.</p>
		</div>

		<div
			class="flex min-h-64 w-full items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50 p-6"
		>
			<ul
				{@attach layoutGroup}
				class="flex w-[300px] flex-wrap list-none items-center justify-center gap-2.5"
			>
				{#each order as backgroundColor (backgroundColor)}
					<li
						{...layout.props({ type: 'position' })}
						class="size-[100px] shrink-0 rounded-md border border-slate-500"
						style:background-color={backgroundColor}
					></li>
				{/each}
			</ul>
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				class={buttonClass}
				disabled={order.includes('#000000')}
				onclick={() => order.push('#000000')}>Add</button
			>
			<button
				class={buttonClass}
				onclick={() => {
					autoplay = false;
					order = shuffle(order);
				}}>Shuffle</button
			>
			<button
				class={buttonClass}
				onclick={() => {
					autoplay = false;
					order = [...initialOrder];
				}}>Reset</button
			>
			<button
				class={buttonClass}
				disabled={!motionAllowed.current}
				aria-pressed={autoplay && motionAllowed.current}
				onclick={() => (autoplay = !autoplay)}
			>
				{autoplay && motionAllowed.current ? 'Pause' : 'Play automatically'}
			</button>
		</div>
	</div>
</div>
