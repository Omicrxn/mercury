<script lang="ts">
	import { mercury, animateExit } from '$lib/index';
	import { scale } from 'svelte/transition';
	let show = $state(true);
	let xValue = $state(0);
	let yValue = $state(0);
	let rotateValue = $state(0);
</script>

<div class="p-32 h-screen w-full flex flex-col gap-16">
	<div class="flex gap-3">
		<input type="range" bind:value={xValue} min={0} max={500} />
		<input type="range" bind:value={yValue} min={0} max={500} />
		<input type="range" bind:value={rotateValue} min={0} max={360} />
	</div>

	<div
		class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
		use:mercury={() => ({
			animate: {
				x: xValue,
				y: yValue,
				rotate: rotateValue
			}
		})}
		draggable
		out:animateExit={{
			opacity: 0,
			scale: 0,
			duration: 1
		}}
	></div>
</div>
