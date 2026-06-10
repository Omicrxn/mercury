<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Loading Spinner</h2>

	<div class="flex items-center justify-center rounded-lg p-10">
		<div
			class="size-[50px] rounded-full border-4 border-slate-300 border-t-blue-400 will-change-transform"
			{@attach mercury({
				animate: { rotate: 360 },
				transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
			})}
		></div>
	</div>
</div>
