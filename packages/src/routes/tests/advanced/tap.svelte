<script lang="ts">
	import { type AnimationInstance } from '$lib/mercury/animation-interface.js';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let animation = $state<AnimationInstance>();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Tap Animation</h2>
	<div
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		style="transform: scale(0.4);"
		{@attach mercury({
			animate: { scale: 1 },
			whileTap: { enter: { scale: 0.5 }, transition: { duration: 0.5, type: 'spring' } },
			transition: { ease: 'circInOut', duration: 1 }
		})}
	></div>
</div>
