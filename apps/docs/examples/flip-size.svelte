<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let expanded = $state(false);
	const layoutGroup = layout(() => expanded, {
		transition: { type: 'spring', duration: 0.3, bounce: 0 }
	});
</script>

<div class="size-demo">
	<div class="heading">
		<h2>Animate size</h2>
		<p>The middle box grows. Its label keeps its shape.</p>
	</div>
	<div {@attach layoutGroup} class="stage">
		<div {...layout.props({ type: 'position' })} class="neighbor" aria-hidden="true"></div>
		<div
			{...layout.props({ type: 'size' })}
			class="resizable"
			style:width={expanded ? '144px' : '64px'}
			style:height={expanded ? '112px' : '64px'}
		>
			<span {...layout.props({ type: 'position' })}>Size</span>
		</div>
		<div {...layout.props({ type: 'position' })} class="neighbor" aria-hidden="true"></div>
	</div>
	<button type="button" aria-pressed={expanded} onclick={() => (expanded = !expanded)}>
		{expanded ? 'Shrink' : 'Expand'}
	</button>
</div>

<style>
	.size-demo {
		width: 100%;
		max-width: 360px;
		display: grid;
		gap: 20px;
	}
	.heading h2 {
		margin: 0 0 4px;
		font-size: 16px;
		font-weight: 600;
	}
	.heading p {
		margin: 0;
		font-size: 13px;
		opacity: 0.65;
	}
	.stage {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		min-height: 146px;
		padding: 16px 8px;
		border: 1px dashed var(--demo-stroke-muted);
		border-radius: 12px;
	}
	.neighbor {
		width: 32px;
		height: 64px;
		flex-shrink: 0;
		border-radius: 8px;
		background: var(--demo-container);
		border: 1px solid var(--demo-stroke-muted);
	}
	.resizable {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 8px;
		background: var(--demo-fill);
		border: 1px solid var(--demo-stroke);
		color: var(--demo-fill-foreground);
	}
	.resizable span {
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}
	button {
		justify-self: start;
		min-height: 44px;
		padding: 0 16px;
		border: 1px solid var(--demo-stroke);
		border-radius: 8px;
		background: var(--demo-fill);
		color: var(--demo-fill-foreground);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	button:focus-visible {
		outline: 2px solid var(--demo-accent);
		outline-offset: 3px;
	}
	@media (hover: hover) and (pointer: fine) {
		button:hover {
			background: var(--demo-fill-hover);
		}
	}
</style>
