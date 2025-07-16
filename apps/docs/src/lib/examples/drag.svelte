<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	let container = $state<HTMLElement | undefined>(undefined);
</script>

<div class="flex flex-col gap-4">
	<div bind:this={container} class="border-2 border-blue-500 w-[400px] h-[300px] rounded-md flex items-center justify-center">
		<div
			{@attach mercury({
				drag: true,
				whileDrag: { bounds: container, rubberband: true },
			})}
			class="box draggable"
		></div>
	</div>
</div>
