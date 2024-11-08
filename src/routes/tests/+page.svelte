<script lang="ts">
	import { mercury } from '$lib/index.js';
	import { nodeMap } from '$lib/mercury/layout.svelte.js';

	import { Briefcase, FlaskConical, House, Library } from 'lucide-svelte';
	// import getRandomTailwindColor from '$lib/utils/random-color';
	import { onMount, type ComponentType } from 'svelte';

	interface ToolbarItem {
		link: string;
		title: string;
		icon: ComponentType;
		color?: string;
	}

	let {
		items = [
			{ icon: House, title: 'Home', link: '/', color: '#f0dcd8' },
			{ icon: House, title: 'Potato', link: '/', color: '#f0dcd8' },
			{ icon: Library, title: 'Libraries', link: '/libraries', color: '#fde58a' },
			{ icon: Briefcase, title: 'Work', link: '/work', color: '#d9ceff' },
			{ icon: FlaskConical, title: 'Alchemy', link: '/alchemy', color: '#b8fadd' }
		]
	}: { items: ToolbarItem[] } = $props();
	let hoveredIndex = $state(0);
	function logTree() {
		console.log(nodeMap);
	}
</script>

<div class="flex flex-col gap-2 p-32">
	<div class="bg-red-500 h-[2000px]"></div>
	<button onclick={logTree}>Log Map</button>
	<div id="root" class="flex rounded-md border px-4 py-2 gap-3" use:mercury layout="root">
		{#each items as item, i (item.title)}
			<div id="item-{item.title}" class="relative" use:mercury layout="item-{item.title}">
				<span id="title-{item.title}" onmouseenter={() => (hoveredIndex = i)} use:mercury
					>{item.title}</span
				>
				{#if hoveredIndex === i}
					<div id="bar-{item.title}" class="w-4 h-1 bg-red-500" use:mercury layout="bar"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
