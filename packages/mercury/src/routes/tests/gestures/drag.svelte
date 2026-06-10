<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let container = $state<HTMLElement | undefined>(undefined);
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Drag</h2>
			<p class="text-sm text-slate-600">Drag the box within the bounds.</p>
		</div>

		<div
			class="flex items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50 p-6"
		>
			<div
				bind:this={container}
				class="flex h-[300px] w-[400px] max-w-full items-center justify-center rounded-md border border-slate-500 bg-white"
			>
				<div
					{@attach mercury({
						drag: true,
						dragOptions: { bounds: container, rubberband: true }
					})}
					class="box draggable"
				></div>
			</div>
		</div>
	</div>
</div>
