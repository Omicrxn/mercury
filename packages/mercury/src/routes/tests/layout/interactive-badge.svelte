<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	import { Folder } from '@lucide/svelte';

	let isHovered = $state(false);

	const path = ['Mango', 'Jackets', 'Winter bla bla bla bal bla', '2026'];
	const indent = (depth: number) => `${depth * 12}px`;
	const leafDepth = path.length - 1;

	const layoutGroup = layout(() => isHovered, {
		transition: { duration: 0.15, type: 'spring', bounce: 0.15, stiffness: 320, damping: 32 },
		states: {
			enterFrom: { opacity: 1 },
			leaveTo: { opacity: 0 },
			swapAt: { opacity: 0 }
		}
	});
</script>

<div class="relative h-64 w-80 rounded-lg border border-dashed border-gray-300">
	<div
		class="absolute top-4 left-4 w-fit cursor-default overflow-hidden"
		role="group"
		aria-label="Folder path"
		{@attach layoutGroup}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
	>
		{#if !isHovered}
			<div
				{...layout.props('badge')}
				class="flex w-fit flex-col gap-0.5 bg-black px-3 py-1.5 text-sm text-white"
				style="border-radius: 3rem;"
			>
				<div class="flex items-center gap-1.5" >
					<Folder size={12} class="shrink-0" />
					<span>2026</span>
				</div>
			</div>
		{/if}
		{#if isHovered}
			<div
				{...layout.props('badge')}
				class="flex w-fit flex-col gap-0.5 bg-black px-3 py-1.5 text-sm text-white"
				style="border-radius: 1rem;"
			>
				{#each path as segment, i (segment)}
					<div class="flex items-center gap-1.5" style:padding-left={indent(i)}>
						<Folder size={12} class="shrink-0 {i < leafDepth ? 'opacity-80' : ''}" />
						<span class={i < leafDepth ? 'opacity-80' : ''}>{segment}</span>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
