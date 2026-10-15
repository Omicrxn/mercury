<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Tap</h2>
			<p class="text-sm text-slate-600">
				Click, tap, or press Space on the box for press feedback.
			</p>
		</div>

		<div
			class="flex min-h-48 w-full items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50 p-8"
		>
			<button
				type="button"
				aria-label="Tap feedback example"
				class="box size-16 cursor-pointer rounded-md border border-slate-500 bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
				{@attach mercury({
					animate: { scale: 1 },
					whileHover: {
						scale: 1.02,
						transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
					},
					whileTap: { scale: 0.97, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } }
				})}
			></button>
		</div>
	</div>
</div>
