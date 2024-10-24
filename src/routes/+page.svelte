<script lang="ts">
	import { mercury, useExit } from '$lib/mercury/mercury-action.svelte.js';
	let show = $state(true);
	let xValue = $state(0);
	let yValue = $state(0);
	let rotateValue = $state(0);
</script>

<div class="p-32 h-screen w-full flex flex-col gap-16">
	<button onclick={() => (show = !show)}>Toggle Show</button>

	{#if show}
		<div
			class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
			use:mercury={{
				opacity: 1,
				scale: [1, 2, 2, 1, 1],
				rotate: [0, 0, 180, 180, 0],
				borderRadius: ['8%', '8%', '50%', '50%', '8%'],
				duration: 3,
				ease: 'inOutSine',
				delay: 0.5,
				loop: true
			}}
			out:useExit={{
				opacity: 0,
				scale: 0,
				duration: 1
			}}
		></div>
	{/if}
	<div class="flex gap-3">
		<input type="range" bind:value={xValue} min={0} max={500} />
		<input type="range" bind:value={yValue} min={0} max={500} />
		<input type="range" bind:value={rotateValue} min={0} max={360} />
	</div>

	<div
		class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
		use:mercury={() => ({
			x: xValue,
			y: yValue,
			rotate: rotateValue
		})}
		draggable
		out:useExit={{
			opacity: 0,
			scale: 0,
			duration: 1
		}}
	></div>
</div>
