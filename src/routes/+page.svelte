<script lang="ts">
	import { mercury } from '$lib/index.js';
</script>

<div class="p-32 h-screen w-full grid grid-cols-4 gap-16">
	{#each { length: 10 } as _, i}
		<div
			use:mercury={{
				initial: {
					opacity: 0,
					scale: 0
				},
				animate: {
					opacity: 1,
					scale: 1,
					delay: i * 0.2
				}
			}}
			class="rounded-full min-w-16 min-h-16 max-h-16 max-w-16 bg-blue-300"
		></div>
	{/each}
</div>
