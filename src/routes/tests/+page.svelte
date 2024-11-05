<script lang="ts">
	import { mercury } from '$lib/index.js';

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
			{ icon: House, title: 'Potato', link: '/', color: '#f0dcd8' }
			// { icon: Library, title: 'Libraries', link: '/libraries', color: '#fde58a' },
			// { icon: Briefcase, title: 'Work', link: '/work', color: '#d9ceff' },
			// { icon: FlaskConical, title: 'Alchemy', link: '/alchemy', color: '#b8fadd' }
		]
	}: { items: ToolbarItem[] } = $props();
	let hoveredIndex = $state(-1);
</script>

<div class="flex flex-col gap-2 p-32">
	<!-- <div id="parent-flex" class="flex rounded-md border px-4 py-2" use:mercury layout>
		{#each items as item, i (item.title)}
			{@const Icon = item.icon}
			<button
				id="button-{item.title}"
				class="flex gap-2 p-4"
				onmouseenter={() => (hoveredIndex = i)}
				style="background-color:var(--hover-color)"
				use:mercury
				layout="button-{item.title}"
			>
				<div id="icon-{item.title}" use:mercury layout><Icon /></div>
				{#if hoveredIndex === i}
					<span id="title-{item.title}" use:mercury layout="title">{item.title}</span>
				{/if}
			</button>
		{/each}
	</div> -->
	<div class="flex rounded-md border px-4 py-2 gap-3">
		{#each items as item, i (item.title)}
			<div class="relative" use:mercury layout>
				<span onmouseenter={() => (hoveredIndex = i)} id="title-{item.title}" use:mercury
					>{item.title}</span
				>
				{#if hoveredIndex === i}
					<div class="w-4 h-1 bg-red-500" use:mercury layout="bar"></div>
				{/if}
			</div>
		{/each}
	</div>
</div>
