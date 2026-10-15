<script>
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Color Interpolation</h2>

	<div class="flex gap-4">
		<div
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
			{@attach mercury({
				animate: {
					backgroundColor: [
						'oklch(88.2% 0.059 254.128)',
						'oklch(82.3% 0.12 346.018)',
						'oklch(87.1% 0.15 154.449)'
					]
				},
				transition: {
					duration: 5,
					repeat: Infinity,
					repeatType: 'reverse',
					ease: 'linear'
				}
			})}
		></div>
	</div>
</div>
