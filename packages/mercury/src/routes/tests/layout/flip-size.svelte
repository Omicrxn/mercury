<script lang="ts">
	import { layout } from '$lib/index.js';

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
		border: 1px dashed #94a3b8;
		border-radius: 12px;
	}
	.neighbor {
		width: 32px;
		height: 64px;
		flex-shrink: 0;
		border-radius: 8px;
		background: #e2e8f0;
		border: 1px solid #94a3b8;
	}
	.resizable {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 8px;
		background: #bfdbfe;
		border: 1px solid #64748b;
		color: #1e293b;
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
		border: 1px solid #94a3b8;
		border-radius: 8px;
		background: #e0e7ff;
		color: #1e293b;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	button:focus-visible {
		outline: 2px solid #6366f1;
		outline-offset: 3px;
	}
	@media (hover: hover) and (pointer: fine) {
		button:hover {
			background: #c7d2fe;
		}
	}
</style>
