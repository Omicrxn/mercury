<script lang="ts">
	import { mercury } from '$lib/index.js';
	import { nodes } from '$lib/mercury/layout.js';

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
			{ icon: House, title: 'Home', link: '/', color: '#f0dcd8' }
			// { icon: Library, title: 'Libraries', link: '/libraries', color: '#fde58a' },
			// { icon: Briefcase, title: 'Work', link: '/work', color: '#d9ceff' },
			// { icon: FlaskConical, title: 'Alchemy', link: '/alchemy', color: '#b8fadd' }
		]
	}: { items: ToolbarItem[] } = $props();
	let hoveredIndex = $state(-1);
	onMount(() => {
		console.log(nodes);
	});
</script>

<div class="flex rounded-md border px-4 py-2">
	{#each items as item, i (item.title)}
		{@const Icon = item.icon}
		<div id="parent-flex" class="flex items-center gap-2">
			<button
				id="button-{item.title}"
				class="flex gap-2 p-4"
				onmouseenter={() => (hoveredIndex = i)}
				style="background-color:var(--hover-color)"
				use:mercury
				layout="button-{item.title}"
			>
				<div id="icon-{item.title}" use:mercury layout="icon-{item.title}">COOOL</div>
				{#if hoveredIndex === i}
					{#key item.title}
						<span id="title-{item.title}" use:mercury layout="title-{item.title}">{item.title}</span
						>
					{/key}
				{/if}
			</button>
		</div>
	{/each}
</div>
