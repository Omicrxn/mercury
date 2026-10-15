<script lang="ts">
	import { examples, exampleTitle } from './registry';

	// Each cover renders the live example on a fixed-width stage, then scales the
	// stage down to fit the card, so covers show the whole demo instead of a
	// clipped corner of it.
	const STAGE_WIDTH = 480;

	function fitStage(stage: HTMLElement) {
		const frame = stage.parentElement!;
		const fit = () => {
			const scale = Math.min(
				frame.clientWidth / stage.offsetWidth,
				frame.clientHeight / stage.offsetHeight,
				1
			);
			stage.style.setProperty('--cover-scale', String(scale));
		};
		const observer = new ResizeObserver(fit);
		observer.observe(frame);
		observer.observe(stage);
		fit();
		return () => observer.disconnect();
	}
</script>

<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
	{#each Object.entries(examples) as [slug, example] (slug)}
		{@const Example = example.component}
		<a href="/docs/examples/{slug}" class="card group flex flex-col gap-3">
			<div
				class="cover relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-background transition-colors group-hover:border-muted-foreground"
				aria-hidden="true"
				inert
			>
				<div
					class="cover-stage pointer-events-none absolute top-1/2 left-1/2 flex flex-col items-center justify-center p-6"
					style:width="{STAGE_WIDTH}px"
					{@attach fitStage}
				>
					<Example />
				</div>
			</div>
			<div class="flex items-center justify-between gap-3 px-1">
				<span class="text-sm font-medium text-foreground">{exampleTitle(slug)}</span>
				<span
					class="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
				>
					{example.isPremium ? 'Motion+' : 'Source'}
				</span>
			</div>
		</a>
	{/each}
</div>

<style>
	/* Blume's prose link styles don't honour not-prose; keep the cards plain. */
	a.card {
		color: inherit;
		text-decoration: none;
		font-weight: inherit;
	}

	.cover {
		background-image: radial-gradient(
			circle at center,
			color-mix(in oklab, var(--color-muted-foreground, #64748b) 22%, transparent) 1px,
			transparent 0
		);
		background-size: 16px 16px;
		background-position: center;
	}

	/* The card already names the example; drop the demo's own heading and blurb. */
	.cover-stage :global(h2),
	.cover-stage :global(h2 + p) {
		display: none;
	}

	.cover-stage {
		transform: translate(-50%, -50%) scale(var(--cover-scale, 0.5));
		transform-origin: center;
	}

	@media (prefers-reduced-motion: no-preference) {
		.cover {
			transition-property: border-color, box-shadow;
		}

		a.card:hover .cover {
			box-shadow: 0 8px 24px -12px rgb(0 0 0 / 0.25);
		}
	}
</style>
