<script lang="ts">
	import { layout } from '$lib/index.js';
	let items = $state<{ id: number; name: string }[]>([]);
	let justify = $state('start');

	const layoutGroup = layout(
		() => [items.length, items.map((item) => item.id).join(','), justify],
		{ transition: { duration: 0.4 } }
	);

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};

	function shuffle() {
		items = [...items].sort(() => Math.random() - 0.5);
	}

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation: Array</h2>

		<div
			{@attach layoutGroup}
			class="flex min-h-24 w-full gap-2 rounded-md border border-slate-500 border-dashed bg-slate-50 p-4"
			style="justify-content: {justify};"
		>
			{#each items as item (item.id)}
				<div
					{...layout.props(item.id.toString())}
					class="box flex size-16 shrink-0 items-center justify-center rounded-md border border-slate-500 bg-blue-200 font-medium text-slate-800"
				>
					{item.id}
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				class={buttonClass}
				onclick={() => {
					items = [...items, { id: Math.ceil(Math.random() * 100), name: 'test' }];
				}}
			>
				Add item
			</button>
			<button
				class={buttonClass}
				onclick={() => {
					items = items.filter((_, index) => index !== 1);
				}}
			>
				Remove middle item
			</button>
			<button class={buttonClass} onclick={flip}>Flip</button>
			<button class={buttonClass} onclick={shuffle}>Shuffle</button>
		</div>
	</div>
</div>
