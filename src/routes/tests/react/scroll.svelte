<script lang="ts">
	import { type AnimationInstance } from '$lib/mercury/animation-interface.js';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let animation = $state<AnimationInstance>();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Scroll Animation</h2>
	<div
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		{@attach mercury({
			scroll: {
				enter: { x: 150, rotate: 180 },
				exit: { x: 0, rotate: 0 },
				transition: { duration: 1, type: 'spring' }
			},
			transition: { ease: 'circInOut', duration: 1 }
		})}
	></div>
</div>
