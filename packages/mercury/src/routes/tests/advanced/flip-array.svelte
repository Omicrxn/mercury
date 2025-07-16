<script lang="ts">
	import { layout } from '$lib/index.js';
	let items = $state([]);
	let justify = $state('start');

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};
	function shuffle() {
		return items.sort(() => Math.random() - 0.5);
	}
</script>

<div class="flex gap-2" style="justify-content: {justify};">
	{#each items as item, index (item)}
		<div
			{@attach layout({
				layoutId: item.id.toString(),
				track: () => {
					items;
					justify;
				}
			})}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		>
			{item.id}
		</div>
	{/each}
</div>

<button
	onclick={() => {
		items.push({ id: Math.ceil(Math.random() * (100 - 0) + 0), name: 'test' });
	}}>Add item</button
>

<button
	onclick={() => {
		items.splice(1, 1);
	}}>Remove middle item</button
>
<button
	onclick={() => {
		flip();
	}}>Flip</button
>
<button
	onclick={() => {
		shuffle();
	}}>Shuffle</button
>
