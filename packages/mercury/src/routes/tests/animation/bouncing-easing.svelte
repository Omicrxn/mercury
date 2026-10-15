<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	import type { AnimationTransition } from '$lib/mercury/animation-interface.js';

	// From https://easings.net/#easeOutBounce
	function bounceEase(x: number) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	}

	const bounce: AnimationTransition = {
		duration: 0.7,
		ease: bounceEase
	};

	const spring: AnimationTransition = {
		type: 'spring',
		stiffness: 700,
		damping: 38
	};

	let isOn = $state(true);
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Bouncing Easing</h2>
	<button
		type="button"
		aria-label="Toggle bouncing ball"
		aria-pressed={isOn}
		class="flex h-[176px] w-20 cursor-pointer items-start justify-center rounded-full border-2 border-slate-500 bg-slate-200 p-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 dark:border-slate-50 dark:bg-slate-400"
		onclick={() => (isOn = !isOn)}
	>
		<div
			class="box size-12! shrink-0 rounded-full!"
			{@attach mercury({ animate: { y: isOn ? 0 : 96 }, transition: isOn ? spring : bounce })}
		></div>
	</button>
</div>
