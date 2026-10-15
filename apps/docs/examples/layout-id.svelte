<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	let showSecond = $state(false);

	const layoutGroup = layout(() => showSecond, {
		transition: { type: 'spring', duration: 0.3, bounce: 0 }
	});

	const buttonClass =
		'rounded-md border border-demo-stroke bg-demo-fill px-4 py-2 text-sm font-medium text-demo-fill-foreground transition-colors hover:bg-demo-fill-hover';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation: Layout ID</h2>

		<div
			class="flex min-h-48 w-full items-center justify-center rounded-md border border-demo-stroke border-dashed bg-demo-surface p-8"
		>
			<div {@attach layoutGroup}>
				{#if showSecond}
					<div
						{...layout.props('rectangle')}
						class="size-24 rounded-xl border border-demo-stroke bg-demo-fill"
					>
						<div
							{...layout.props('rectangle-square')}
							class="size-4 rounded-md border m-2 border-demo-stroke bg-amber-200"
						></div>
					</div>
				{:else}
					<div
						{...layout.props('rectangle')}
						class="size-12 rounded-xl border border-demo-stroke bg-demo-fill"
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
