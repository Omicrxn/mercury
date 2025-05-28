<script lang="ts">
	import { mercury } from '$lib/index.js';
	import BouncingEasing from '../tests/javascript/bouncing-easing.svelte';
	import Spring from '../tests/javascript/spring.svelte';
	import Drag from '../tests/react/drag.svelte';
</script>

<div class=" flex h-dvh w-full">
	<div class="scroll-test flex flex-col gap-16 p-12 bg-red-500 w-full h-full overflow-auto">
		<div
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
			{@attach mercury({
				onTapStart: (event) => {
					console.log('pressed', event);
				},
				onTapEnd: (event) => {
					console.log('press released', event);
				},
				whileTap: { scale: 0.3 },
				whileHover: { scale: 1.5 },
				onHoverStart: (event) => {
					console.log('hovered', event);
				},
				onHoverEnd: (event) => {
					console.log('hovered released', event);
				}
			})}
		></div>
	</div>
</div>
