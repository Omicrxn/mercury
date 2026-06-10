<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Tap</h2>
			<p class="text-sm text-slate-600">Click or tap the box to scale it down.</p>
		</div>

		<div
			class="flex min-h-48 w-full items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50 p-8"
		>
			<div
				class="box size-16 cursor-pointer rounded-md border border-slate-500 bg-blue-200"
				style="transform: scale(0.4);"
				{@attach mercury({
					animate: { scale: 1 },
					whileTap: { scale: 0.5, transition: { duration: 0.5, type: 'spring' } },
					whileHover: { scale: 1.5 },
					transition: { ease: 'circInOut', duration: 1 }
				})}
			></div>
		</div>
	</div>
</div>
