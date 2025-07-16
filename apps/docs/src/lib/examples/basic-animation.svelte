<script lang="ts">
	import { mercury, type AnimationInstance } from '@omicrxn/mercury';
	let {animation = $bindable()}:{animation:AnimationInstance} = $props()
</script>

<div class="flex flex-col gap-4 justify-center items-center w-full h-full">
	<div
		class="box"
		style="transform: scale(0.4);"
		{@attach mercury({
			animate: { scale: 1 },
			instance: (instance)=>{
			  animation = instance
			},
			transition: { ease: 'circInOut', duration: 1, autoplay: true }
		})}
	></div>
</div>
