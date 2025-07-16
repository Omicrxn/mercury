<script lang="ts">
	import { mercury, type AnimationInstance } from '@omicrxn/mercury';
	let animation = $state<AnimationInstance>();
</script>

<div class="flex flex-col gap-4">
	<div
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		style="transform: scale(0.4);"
		{@attach mercury({
			animate: { scale: 1 },
			whileHover: {   scale: 1.25 , transition: { duration: 0.5, type: 'spring', } },
			transition: { ease: 'circInOut', duration: 0.3 }
		})}
	></div>
</div>
