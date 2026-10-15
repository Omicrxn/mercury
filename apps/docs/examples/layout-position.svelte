<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let expanded = $state(false);
	let settings = $state({ align: 'start' });

	// The trigger tracks changes to settings.align.
	const layoutGroup = layout(() => [expanded, settings], {
		transition: { type: 'spring', duration: 0.3, bounce: 0 },
		shared: { pill: { type: 'spring', bounce: 0.1, duration: 0.35 } }
	});

	const buttonClass =
		'rounded-md border border-demo-stroke bg-demo-fill px-4 py-2 text-sm font-medium text-demo-fill-foreground transition-colors hover:bg-demo-fill-hover';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div {@attach layoutGroup} class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-bold">Layout Animation: Position, Shared Transitions</h2>
			<p class="text-sm text-muted-foreground">
				The card animates its size; its text only animates its position, so it never stretches.
			</p>
		</div>

		<div
			class="flex min-h-48 w-full rounded-md border border-dashed border-demo-stroke bg-demo-surface p-4"
			style:justify-content={settings.align}
		>
			<div
				{...layout.props()}
				class="max-w-full rounded-md border border-demo-stroke bg-demo-fill p-4"
				style:width={expanded ? '320px' : '160px'}
				style:height={expanded ? '160px' : '80px'}
			>
				<p {...layout.props({ type: 'position' })} class="text-sm font-medium text-demo-fill-foreground">
					Position only
				</p>
			</div>
		</div>

		<div class="flex h-10 w-full items-center rounded-full border border-demo-stroke bg-demo-surface p-1">
			{#each ['start', 'center', 'end'] as align (align)}
				<div
					class={[
						'relative flex h-full flex-1 items-center justify-center text-sm transition-colors',
						settings.align === align ? 'text-demo-fill-foreground' : 'text-foreground'
					]}
				>
					{#if settings.align === align}
						<div
							{...layout.props('pill')}
							class="absolute inset-0 bg-demo-fill"
							style="border-radius: 9999px;"
						></div>
					{/if}
					<span class="relative">{align}</span>
				</div>
			{/each}
		</div>

		<div class="flex flex-wrap gap-2">
			<button class={buttonClass} onclick={() => (expanded = !expanded)}>
				{expanded ? 'Collapse' : 'Expand'}
			</button>
			<button class={buttonClass} onclick={() => (settings.align = 'start')}>Start</button>
			<button class={buttonClass} onclick={() => (settings.align = 'center')}>Center</button>
			<button class={buttonClass} onclick={() => (settings.align = 'end')}>End</button>
		</div>
	</div>
</div>
