<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let rotated = $state(false);
</script>

<div class="flex flex-col items-center gap-4">
	<h2 class="text-xl font-bold">Spring</h2>
	<button
		type="button"
		aria-label="Rotate the box with a spring"
		aria-pressed={rotated}
		class="box size-16 cursor-pointer rounded-md border border-slate-500 bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
		onclick={() => (rotated = !rotated)}
		{@attach mercury({
			animate: { rotate: rotated ? 90 : 0 },
			transition: { type: 'spring', visualDuration: 0.35, bounce: 0.2 }
		})}
	></button>
	<p class="text-sm text-slate-600">Press the box to rotate it.</p>
</div>
