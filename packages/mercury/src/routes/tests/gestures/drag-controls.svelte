<script lang="ts">
	import { mercury, createDragControls } from '$lib/index.js';

	let area = $state<HTMLElement>();
	const controls = createDragControls();
</script>

<div class="flex w-full max-w-[400px] flex-col items-center gap-4">
	<p class="text-sm text-slate-600">
		Drag the card by its handle. It stays inside the area, and the ball snaps back.
	</p>
	<div
		bind:this={area}
		class="relative flex h-56 w-full items-center justify-around rounded-md border-2 border-dashed border-slate-500"
	>
		<div
			class="w-28 rounded-md border border-slate-500 bg-white shadow-sm"
			{@attach mercury({
				drag: true,
				dragControls: controls,
				dragListener: false,
				dragConstraints: area,
				dragElastic: 0.1,
				whileDrag: { scale: 1.05, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }
			})}
		>
			<div
				role="button"
				tabindex="-1"
				aria-label="Drag handle"
				class="flex h-6 cursor-grab touch-none items-center justify-center rounded-t-md bg-slate-200 active:cursor-grabbing"
				onpointerdown={(event) => controls.start(event)}
			>
				<span class="h-1 w-8 rounded-full bg-slate-500"></span>
			</div>
			<p class="p-3 text-sm">Card</p>
		</div>
		<button
			type="button"
			aria-label="Drag the ball, or move it with the arrow keys"
			class="circle cursor-grab active:cursor-grabbing"
			{@attach mercury({
				drag: true,
				dragSnapToOrigin: true,
				whileDrag: { scale: 1.2 },
				transition: { type: 'spring', bounce: 0.4 }
			})}
		></button>
	</div>
</div>
