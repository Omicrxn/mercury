<script lang="ts">
	import { layout } from '$lib/index.js';
	import { Folder } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';

	let expanded = $state(false);
	// Swapping the badge under a resting pointer makes the browser fire pointerenter
	// again without a pointerleave; only a real entry should expand it.
	let pointerInside = false;
	const canHover = new MediaQuery('(hover: hover) and (pointer: fine)', false);

	const path = ['Mango', 'Jackets', 'Winter collection', '2026'];
	const indent = (depth: number) => `${depth * 12}px`;
	const leafDepth = path.length - 1;

	const layoutGroup = layout(() => expanded, {
		transition: { type: 'spring', duration: 0.2, bounce: 0 }
	});
</script>

<div class="relative h-64 w-80 max-w-full rounded-lg border border-dashed border-gray-300">
	<button
		type="button"
		class="absolute top-4 left-4 flex min-h-11 min-w-20 max-w-[calc(100%_-_2rem)] cursor-pointer items-start rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
		aria-label="Folder path: {expanded ? path.join(' / ') : path[leafDepth]}"
		aria-expanded={expanded}
		{@attach layoutGroup}
		onpointerenter={(event) => {
			if (pointerInside) return;
			pointerInside = true;
			if (event.pointerType === 'mouse' && canHover.current) expanded = true;
		}}
		onpointerleave={(event) => {
			pointerInside = false;
			if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus-visible'))
				expanded = false;
		}}
		onfocus={(event) => {
			if (event.currentTarget.matches(':focus-visible')) expanded = true;
		}}
		onblur={() => (expanded = false)}
		onclick={() => (expanded = !expanded)}
		onkeydown={(event) => {
			if (event.key === 'Escape') expanded = false;
		}}
	>
		{#if !expanded}
			<span
				{...layout.props('badge')}
				class="flex w-fit flex-col gap-0.5 bg-black px-3 py-1.5 text-sm text-white"
				style="border-radius: 3rem;"
			>
				<span
					{...layout.props('badge-leaf', { type: 'position' })}
					class="flex items-center gap-1.5"
				>
					<Folder size={12} class="shrink-0" />
					<span>2026</span>
				</span>
			</span>
		{/if}
		{#if expanded}
			<span
				{...layout.props('badge')}
				class="flex w-fit flex-col gap-0.5 bg-black px-3 py-1.5 text-sm text-white"
				style="border-radius: 1rem;"
			>
				{#each path as segment, i (segment)}
					<span
						{...layout.props(i === leafDepth ? 'badge-leaf' : undefined, { type: 'position' })}
						class="flex items-center gap-1.5"
						style:padding-left={indent(i)}
					>
						<Folder size={12} class="shrink-0 {i < leafDepth ? 'opacity-80' : ''}" />
						<span class={i < leafDepth ? 'opacity-80' : ''}>{segment}</span>
					</span>
				{/each}
			</span>
		{/if}
	</button>
</div>
