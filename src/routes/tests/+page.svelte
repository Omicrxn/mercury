<script lang="ts">
	import { mercury, useExit, spring } from '$lib/index';
	let items = [
		{ description: 'main page', title: 'house', color: '#f0dcd8' },
		{ description: 'libraries page', title: 'libraries', color: '#fde58a' },
		{ description: 'work page', title: 'work', color: '#d9ceff' },
		{ description: 'alchemy page', title: 'alchemy', color: '#b8fadd' }
	];
	let hoveredIndex = $state(0);
</script>

<div class="flex flex-col justify-center items-center p-32">
	<div class="flex border rounded-md">
		{#each items as item, i (item.title)}
			<button
				onmouseenter={() => {
					hoveredIndex = i;
				}}
				onclick={() => {}}
				class="flex items-center p-2 button gap-2"
				style="--hover-color: {hoveredIndex === i ? item.color : 'grey'};"
			>
				<span use:mercury layout>{item.title}</span>

				<span
					style="opacity: 0;"
					use:mercury={{ opacity: 0, whileHover: { opacity: 1 } }}
					layout="desc"
				>
					{item.description}
				</span>
			</button>
		{/each}
	</div>
	<div
		class="w-[200px] h-[200px] rounded-md bg-red-400 cursor-pointer"
		use:mercury={{
			scale: 1,
			whileHover: { scale: 1.2, ease: spring(1, 300, 17) },
			whileTap: { scale: 0.9, ease: spring(1, 300, 17) },
			ease: spring(1, 300, 17)
		}}
	/>
</div>

<style>
	.button {
		background-color: var(--hover-color);
	}
</style>
