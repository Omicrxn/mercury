<script>
	import { animate } from 'motion';
	import { mercury } from '@omicrxn/mercury';

	// From https://easings.net/#easeOutBounce
	function bounceEase(x) {
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

	const bounce = {
		duration: 1.2,
		ease: bounceEase
	};

	const spring = {
		type: 'spring',
		stiffness: 700,
		damping: 30
	};

	let isOn = $state(true);
	// 	animate(ball, { y: isOn ? 0 : 120 }, isOn ? spring : bounce);
	// });
</script>

<div class="flex flex-col h-full w-full items-center justify-center gap-4">
	<div
		class="w-[60px] h-[150px] bg-slate-200 flex items-start justify-center rounded-full p-3 cursor-pointer"
		onclick={() => (isOn = !isOn)}
	>
		<div
			class="rounded-full size-12 shrink-0 bg-blue-200 border border-slate-500 will-change-transform"
			{@attach mercury({ animate: { y: isOn ? 0 : 80 }, transition: isOn ? spring : bounce })}
		></div>
	</div>
</div>
