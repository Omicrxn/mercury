<script lang="ts">
	import { mercury } from '$lib/index.js';

	let scrollRoot = $state<HTMLElement | undefined>(undefined);
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Scroll</h2>
			<p class="text-sm text-slate-600">Scroll the area below to animate the box.</p>
		</div>

		<div class="rounded-md border border-slate-500 border-dashed bg-slate-50 p-4">
			<div
				bind:this={scrollRoot}
				class="h-[400px] overflow-y-auto overscroll-contain rounded-md border border-slate-500 bg-white"
			>
				<div class="h-[1000px] shrink-0"></div>
				{#if scrollRoot}
					<div
						class="box mb-8 size-16 shrink-0 rounded-md border border-slate-500 bg-blue-200"
						{@attach mercury({
							scroll: {
								enter: { x: 150, rotate: 180 },
								exit: { x: 0, rotate: 0 },
								transition: { duration: 1 },
								root: scrollRoot
							},
							transition: { ease: 'circInOut', duration: 1 }
						})}
					></div>
				{/if}
			</div>
		</div>
	</div>
</div>
