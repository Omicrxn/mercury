<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	let items = $state([{ id: 1 }, { id: 2 }, { id: 3 }]);
	let nextId = 4;
	let justify = $state('start');

	const layoutGroup = layout(() => [items, justify], {
		transition: { type: 'spring', duration: 0.3, bounce: 0 }
	});

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};

	function shuffle() {
		for (let index = items.length - 1; index > 0; index--) {
			const other = Math.floor(Math.random() * (index + 1));
			[items[index], items[other]] = [items[other], items[index]];
		}
	}

	const buttonClass =
		'rounded-md border border-demo-stroke bg-demo-fill px-4 py-2 text-sm font-medium text-demo-fill-foreground transition-colors hover:bg-demo-fill-hover';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation: Array</h2>

		<div
			{@attach layoutGroup}
			class="flex min-h-24 w-full flex-wrap gap-2 rounded-md border border-demo-stroke border-dashed bg-demo-surface p-4"
			style="justify-content: {justify};"
		>
			{#each items as item (item.id)}
				<div
					{...layout.props({ type: 'position' })}
					class="box flex size-16 shrink-0 items-center justify-center rounded-md border border-demo-stroke bg-demo-fill font-medium text-demo-fill-foreground"
				>
					{item.id}
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap gap-2">
			<button
				class={buttonClass}
				onclick={() => {
					items.push({ id: nextId++ });
				}}
			>
				Add item
			</button>
			<button
				class={buttonClass}
				onclick={() => {
					items.splice(Math.floor(items.length / 2), 1);
				}}
			>
				Remove middle item
			</button>
			<button class={buttonClass} onclick={flip}>Flip</button>
			<button class={buttonClass} onclick={shuffle}>Shuffle</button>
		</div>
	</div>
</div>
