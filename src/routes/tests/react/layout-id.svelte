<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	import { gsap } from 'gsap';
	import { Flip } from 'gsap/Flip';
	import { animateView } from 'motion';
	import { tick } from 'svelte';
	let toggle = $state(false);
	let smallBox = $state<HTMLElement | null>();
	let bigBox = $state<HTMLElement | null>();
	gsap.registerPlugin(Flip);

	// $effect.pre(() => {
	// 	let state = Flip.getState(`[data-flip-id="test"]`);
	// 	console.log('testing');
	// 	toggle;
	// 	tick().then(() => {
	// 		Flip.from(state, {
	// 			targets: `[data-flip-id="test"]`,
	// 			duration: 1
	// 		});
	// 	});
	// });
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Layout Animation: Size</h2>

	{#if toggle}
		<div
			bind:this={smallBox}
			{@attach layout({ layoutId: 'test', track: () => toggle })}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
	{:else}
		<div
			bind:this={bigBox}
			{@attach layout({ layoutId: 'test', track: () => toggle })}
			class="box w-24 h-24 bg-blue-200 rounded-md border border-slate-500"
		></div>
	{/if}

	<button
		onclick={async () => {
			// let state = Flip.getState(`[data-flip-id="test"]`);
			toggle = !toggle;
			// await tick();
			// Flip.from(state, {
			// 	targets: `[data-flip-id="test"]`,
			// 	duration: 1
			// });
		}}
		class="bg-slate-200">Flip</button
	>
</div>
