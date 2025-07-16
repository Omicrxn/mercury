<script>
	import { animate } from 'motion';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Color Interpolation</h2>

	<div class="flex gap-4">
		<div
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
			{@attach mercury({
				animate: {
					backgroundColor: ['#ff0088', '#0d63f8']
				},
				transition: {
					duration: 2,
					repeat: Infinity,
					repeatType: 'reverse',
					easing: 'linear'
				}
			})}
		></div>
	</div>
</div>
