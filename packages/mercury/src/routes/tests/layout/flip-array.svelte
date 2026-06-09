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
</script>

<div {@attach layoutGroup} class="flex gap-2" style="justify-content: {justify};">
	{#each items as item (item.id)}
		<div
			{...layout.props(item.id.toString())}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		>
			{item.id}
		</div>
	{/each}
</div>

<button
	onclick={() => {
		items = [...items, { id: Math.ceil(Math.random() * 100), name: 'test' }];
	}}>Add item</button
>

<button
	onclick={() => {
		items = items.filter((_, index) => index !== 1);
	}}>Remove middle item</button
>
<button onclick={flip}>Flip</button>
<button onclick={shuffle}>Shuffle</button>
