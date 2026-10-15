<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Hover</h2>
			<p class="text-sm text-muted-foreground">
				Hover over the box, then press it to feel both responses.
			</p>
		</div>

		<div
			class="flex min-h-48 w-full items-center justify-center rounded-md border border-demo-stroke border-dashed bg-demo-surface p-8"
		>
			<button
				type="button"
				aria-label="Hover feedback example"
				class="box size-16 cursor-pointer rounded-md border border-demo-stroke bg-demo-fill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-demo-accent"
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
