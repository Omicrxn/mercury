<script lang="ts">
	import { layout } from '$lib/index.js';

	const initialOrder = ['#ff0088', '#dd00ee', '#9911ff', '#0d63f8'];
	let order = $state(initialOrder);

	const layoutGroup = layout(() => order.join(','), { transition: { duration: 0.4 } });

	$effect(() => {
		void order;
		const timeout = setTimeout(() => (order = shuffle([...order])), 1000);
		return () => clearTimeout(timeout);
	});

	function shuffle([...array]: string[]) {
		return array.sort(() => Math.random() - 0.5);
	}

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Layout Animation: Reordering</h2>
			<p class="text-sm text-slate-600">Items automatically shuffle every second.</p>
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
						{...layout.props(backgroundColor)}
						class="size-[100px] shrink-0 rounded-md border border-slate-500"
						style:background-color={backgroundColor}
					></li>
				{/each}
			</ul>
		</div>

		<div class="flex flex-wrap gap-2">
			<button class={buttonClass} onclick={() => (order = [...order, '#000000'])}>Add</button>
			<button class={buttonClass} onclick={() => (order = shuffle([...order]))}>Shuffle</button>
			<button class={buttonClass} onclick={() => (order = [...initialOrder])}>Reset</button>
		</div>
	</div>
</div>
