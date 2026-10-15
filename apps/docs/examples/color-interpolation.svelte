<script>
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Color Interpolation</h2>

	<div class="flex gap-4">
		<div
			class="box w-16 h-16 bg-demo-fill rounded-md border border-demo-stroke"
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
