<script lang="ts">
	import { type AnimationInstance } from '@omicrxn/mercury';
	import { mercury } from '@omicrxn/mercury';
	let { animation = $bindable() }: { animation?: AnimationInstance } = $props();
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Basic Animation</h2>
	<div
		class="box w-16 h-16 bg-demo-fill rounded-md border border-demo-stroke"
		style="opacity: 0; transform: scale(0.95);"
		{@attach mercury({
			animate: { opacity: [0, 1], scale: [0.95, 1] },
			instance: (instance) => {
				animation = instance;
			},
			transition: { ease: [0.19, 1, 0.22, 1], duration: 0.25 }
		})}
	></div>

	<button
		type="button"
		class="min-h-11 rounded-md border border-demo-stroke px-3 text-sm font-medium"
		onclick={() => {
			animation?.play();
		}}>Play</button
	>
</div>
