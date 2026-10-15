<script lang="ts">
	import { Folder } from '@lucide/svelte';
	import { MediaQuery } from 'svelte/reactivity';

	let expanded = $state(false);
	const canHover = new MediaQuery('(hover: hover) and (pointer: fine)', false);

	const path = ['Mango', 'Jackets', 'Winter collection', '2026'];
	const leafDepth = path.length - 1;
	const indents = ['pl-0', 'pl-3', 'pl-6', 'pl-9'] as const;
</script>

<div
	class="relative h-64 w-80 max-w-full rounded-lg border border-dashed border-gray-300 overflow-visible"
>
	<button
		type="button"
		class="badge absolute top-4 left-4 flex min-h-11 min-w-20 max-w-[calc(100%_-_2rem)] cursor-pointer items-start rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
		aria-label="Folder path: {expanded ? path.join(' / ') : path[leafDepth]}"
		aria-expanded={expanded}
		data-expanded={expanded}
		onpointerenter={(event) => {
			if (event.pointerType === 'mouse' && canHover.current) expanded = true;
		}}
		onpointerleave={(event) => {
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
		<span
			class="badge-shell flex w-fit flex-col gap-0 overflow-hidden rounded-[3rem] bg-black px-2 py-1 text-sm text-white"
		>
			{#each path as segment, i (segment)}
				{#if i < leafDepth}
					<span
						aria-hidden={!expanded}
						class="badge-branch grid min-h-0 w-0 min-w-0 grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,opacity,width] duration-200"
					>
						<span class="overflow-hidden">
							<span class="flex items-center gap-1.5 {indents[i]}">
								<Folder size={12} class="shrink-0 opacity-80" />
								<span class="opacity-80">{segment}</span>
							</span>
						</span>
					</span>
				{:else}
					<span
						class="badge-leaf flex items-center gap-1.5 pl-0 transition-[padding-left] duration-200"
					>
						<Folder size={12} class="shrink-0" />
						<span>{segment}</span>
					</span>
				{/if}
			{/each}
		</span>
	</button>
</div>

<style>
	.badge-shell {
		transition-property: border-radius, padding, gap;
		transition-duration: 200ms;
		transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
	}

	.badge-branch,
	.badge-leaf {
		transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
	}

	.badge[data-expanded='true'] .badge-shell {
		gap: 2px;
		border-radius: 16px;
		padding: 6px 12px;
	}

	.badge[data-expanded='true'] .badge-branch {
		width: auto;
		grid-template-rows: 1fr;
		opacity: 1;
	}

	.badge[data-expanded='true'] .badge-leaf {
		padding-left: 36px;
	}

	@media (prefers-reduced-motion: reduce) {
		.badge-shell,
		.badge-branch,
		.badge-leaf {
			transition: none;
		}
	}
</style>
