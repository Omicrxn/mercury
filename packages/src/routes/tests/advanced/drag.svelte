<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let container = $state<HTMLElement | undefined>(undefined);
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Drag</h2>
	<!-- <div
		{@attach mercury({ drag: true, whileDrag: { bounds: { bottom: 500 }, rubberband: true } })}
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
	></div> -->

	<div bind:this={container} class="bg-red-500 w-[500px] h-[500px] rounded-md">
		<div
			{@attach mercury({
				drag: true,
				whileDrag: { bounds: container, rubberband: true },
				onDragStart: (event) => {
					console.log(event);
				},
				onDragEnd: (event) => {
					console.log(event);
				}
			})}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
	</div>
</div>
