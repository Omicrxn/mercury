<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	let showSecond = $state(false);

	const layoutGroup = layout(() => showSecond, { transition: { duration: 0.4 } });

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation: Layout ID</h2>

		<div
			class="flex min-h-48 w-full items-center justify-center rounded-md border border-slate-500 border-dashed bg-slate-50 p-8"
		>
			<div {@attach layoutGroup}>
				{#if showSecond}
					<div
						{...layout.props('rectangle')}
						class="size-24 rounded-xl border border-slate-500 bg-blue-200"
					>
						<div
							{...layout.props('rectangle-square')}
							class="size-4 rounded-md border m-2 border-slate-500 bg-amber-200"
						></div>
					</div>
				{:else}
					<div
						{...layout.props('rectangle')}
						class="size-12 rounded-xl border border-slate-500 bg-blue-200"
					>
						<div
							{...layout.props('rectangle-square')}
							class="m-4 size-4 rounded-md bg-purple-400"
						></div>
					</div>
				{/if}
			</div>
		</div>

		<button class={buttonClass} onclick={() => (showSecond = !showSecond)}>
			{showSecond ? 'Shrink' : 'Expand'}
		</button>
	</div>
</div>
