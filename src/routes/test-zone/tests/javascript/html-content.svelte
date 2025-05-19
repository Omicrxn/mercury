<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	import { animate } from 'motion';
	let count = $state<HTMLElement | null>();
	animate(0, 10);
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Rotate</h2>
	<pre
		bind:this={count}
		class="text-6xl text-green-300"
		{@attach mercury({
			values: {
				from: 0,
				to: 28
			},
			transition: { duration: 2, ease: 'circOut' },
			callbacks: {
				onUpdate: (latest) => (count.innerHTML = Math.round(latest))
			}
		})}>0</pre>
</div>
