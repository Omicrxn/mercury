<script lang="ts">
	import {
		animate,
		motionValue,
		styleEffect,
		transformValue,
		type AnimationPlaybackControls
	} from 'motion';
	import { onMount } from 'svelte';

	const clipPathValue = motionValue(0);
	const clipPath = transformValue(() => `inset(0px ${clipPathValue.get()}% 0px 0px)`);
	let graph = $state<SVGSVGElement | null>(null);
	let returnAnimation: AnimationPlaybackControls | undefined;
	let reducedMotion = false;

	onMount(() => {
		if (!graph) return;
		const stopEffect = styleEffect(graph, { clipPath });
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const updatePreference = () => {
			reducedMotion = preference.matches;
			if (reducedMotion) {
				returnAnimation?.stop();
				clipPathValue.set(0);
			}
		};
		updatePreference();
		preference.addEventListener('change', updatePreference);

		return () => {
			preference.removeEventListener('change', updatePreference);
			returnAnimation?.stop();
			stopEffect();
			clipPath.destroy();
			clipPathValue.destroy();
		};
	});

	function onPointerMove(event: PointerEvent) {
		if (!(event.currentTarget instanceof HTMLElement)) return;
		returnAnimation?.stop();
		const rect = event.currentTarget.getBoundingClientRect();
		if (!rect.width) return;
		const percentageFromRight = Math.max(
			0,
			Math.min(((rect.right - event.clientX) / rect.width) * 100, 100)
		);
		clipPathValue.set(percentageFromRight);
	}

	function resetGraph() {
		returnAnimation?.stop();
		if (reducedMotion) {
			clipPathValue.set(0);
			return;
		}
		returnAnimation = animate(clipPathValue, 0, { type: 'spring', duration: 0.3, bounce: 0 });
	}
</script>

<div
	class="w-full"
	role="img"
	aria-label="Interactive growth chart"
	onpointermove={onPointerMove}
	onpointerleave={resetGraph}
	onpointercancel={resetGraph}
>
	<svg
		bind:this={graph}
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 644 188"
		aria-hidden="true"
	>
		<path
			stroke="#0090FF"
			stroke-width="2"
			d="M1 118.5s82.308-15.501 113.735-29 74.769-1.713 121.217-12c37.596-8.328 58.517-15.006 93.781-30.5 80.146-35.215 123.213-16 154.141-24.5S635.97.849 644 1.5"
		></path>
		<path
			fill="url(#paint0_linear_540_31)"
			d="M113.912 89.012C82.437 102.511 1 118.01 1 118.01V188h643V1.023c-8.043-.65-129.399 12.499-160.375 20.998-30.976 8.498-74.11-10.714-154.38 24.496-35.319 15.493-56.272 22.17-93.927 30.497-46.52 10.286-89.93-1.5-121.406 11.998"
		></path>
		<defs>
			<linearGradient
				id="paint0_linear_540_31"
				x1="322.5"
				x2="322.5"
				y1="1"
				y2="188"
				gradientUnits="userSpaceOnUse"
			>
				<stop stop-color="#138EED" stop-opacity="0.4"></stop>
				<stop offset="1" stop-color="#058FFB" stop-opacity="0"></stop>
			</linearGradient>
		</defs>
	</svg>
</div>
