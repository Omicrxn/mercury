<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	import { stagger } from 'motion';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Stagger</h2>
	<div class="flex gap-2">
		{#each { length: 3 }, i}
			<div
				class="box w-16 h-16 bg-blue-200 rounded-md opacity-0 border border-slate-500"
				{@attach mercury({
					animate: { opacity: 1, y: [64, 0] },
					transition: { delay: i * 0.05 }
				})}
			></div>
		{/each}
	</div>
</div>
