<script lang="ts">
	import { type AnimationInstance } from '$lib/mercury/animation-interface.js';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let animation = $state<AnimationInstance>();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Basic Animation</h2>
	<div
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		style="opacity: 0; transform: scale(0.95);"
		{@attach mercury({
			animate: { opacity: [0, 1], scale: [0.95, 1] },
			instance: (instance) => {
				animation = instance;
			},
			transition: { ease: [0.19, 1, 0.22, 1], duration: 0.25 }
		})}
	></div>

	<button
		type="button"
		class="min-h-11 rounded-md border border-slate-500 px-3 text-sm font-medium"
		onclick={() => {
			animation?.play();
		}}>Play</button
	>
</div>
