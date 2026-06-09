<script lang="ts">
	import { layout } from '$lib/index.js';

	const initialOrder = ['#ff0088', '#dd00ee', '#9911ff', '#0d63f8'];
	let order = $state(initialOrder);

	const layoutGroup = layout(() => order.join(','), { transition: { duration: 0.4 } });

	$effect(() => {
		void order;
		const timeout = setTimeout(() => (order = shuffle([...order])), 1000);
		return () => clearTimeout(timeout);
	});

	function shuffle([...array]: string[]) {
		return array.sort(() => Math.random() - 0.5);
	}
</script>

<ul
	{@attach layoutGroup}
	class="list-none gap-2.5 w-[300px] flex-wrap flex justify-center items-center"
>
	{#each order as backgroundColor (backgroundColor)}
		<li
			{...layout.props(backgroundColor)}
			class="w-[100px] h-[100px] rounded-md"
			style:background-color={backgroundColor}
		></li>
	{/each}
</ul>

<button onclick={() => (order = [...order, '#000000'])}>Add</button>
