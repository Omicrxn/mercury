<script lang="ts">
	import { motionConfig } from '@omicrxn/mercury';
	import BouncingEasing from '../../examples/bouncing-easing.svelte';
	import DragControls from '../../examples/drag-controls.svelte';
	import LayoutId from '../../examples/layout-id.svelte';
	import ScrollProgress from '../../examples/scroll-progress.svelte';
	import Slideshow from '../../examples/slideshow.svelte';
	import Variants from '../../examples/variants.svelte';

	const demos = {
		'bouncing-easing': BouncingEasing,
		variants: Variants,
		'drag-controls': DragControls,
		slideshow: Slideshow,
		'layout-id': LayoutId,
		'scroll-progress': ScrollProgress
	};

	let { example, width = 400 }: { example: keyof typeof demos; width?: number } = $props();
	const Demo = $derived(demos[example]);

	// The demo renders at its natural size on a fixed-width stage, scaled down to
	// fit the card. It stays interactive, so pointer coordinates for drag and pan
	// are mapped back into the stage's unscaled space.
	let scale = $state(1);

	function fit(stage: HTMLElement) {
		const frame = stage.parentElement!;
		const update = () => {
			scale = Math.min(
				frame.clientWidth / stage.offsetWidth,
				frame.clientHeight / stage.offsetHeight,
				1
			);
		};
		const observer = new ResizeObserver(update);
		observer.observe(frame);
		observer.observe(stage);
		update();
		return () => observer.disconnect();
	}

	const config = motionConfig({
		transformPagePoint: ({ x, y }) => ({ x: x / scale, y: y / scale })
	});
</script>

<div class="frame">
	<div class="stage" style:width="{width}px" style:--scale={scale} {@attach fit} {@attach config}>
		<Demo />
	</div>
</div>

<style>
	.frame {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.stage {
		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		transform: translate(-50%, -50%) scale(var(--scale));
		transform-origin: center;
	}

	/* The card names and describes the feature; drop the demo's own heading and blurb. */
	.stage :global(h2),
	.stage :global(h2 + p),
	.stage > :global(div > p.text-muted-foreground:first-child) {
		display: none;
	}
</style>
