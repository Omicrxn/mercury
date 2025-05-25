<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Basic Animation</h2>
	<div
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		style="transform: scale(0.4);"
		{@attach mercury({
			animate: { scale: 1 },
			transition: { ease: 'circInOut', duration: 1 }
		})}
	></div>
</div>
