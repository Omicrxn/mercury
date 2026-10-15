<script lang="ts">
	import { mercury, presence, type Variants } from '$lib/index.js';

	const slides = ['One', 'Two', 'Three', 'Four'];
	let index = $state(0);
	let direction = $state(1);

	function paginate(step: number) {
		direction = step;
		index = (index + step + slides.length) % slides.length;
	}

	// Variants receive `custom`: the exiting slide reads the *latest* direction from
	// `presence`, so it leaves the way the new one comes from.
	const slide: Variants = {
		enter: (dir: number) => ({ x: dir * 120, opacity: 0 }),
		center: { x: 0, opacity: 1 },
		exit: (dir: number) => ({ x: dir * -120, opacity: 0 })
	};
</script>

<div class="flex flex-col items-center gap-4">
	<div class="relative flex h-32 w-56 items-center justify-center overflow-hidden">
		{#key index}
			<div
				class="box flex size-28! items-center justify-center text-lg font-semibold text-slate-800"
				transition:presence={{ mode: 'popLayout', custom: direction }}
				{@attach mercury({
					custom: direction,
					variants: slide,
					initial: 'enter',
					animate: 'center',
					exit: 'exit',
					transition: { type: 'spring', duration: 0.4, bounce: 0.15 }
				})}
			>
				{slides[index]}
			</div>
		{/key}
	</div>
	<div class="flex gap-2">
		<button
			type="button"
			class="min-h-11 rounded-md border border-slate-500 px-4 text-sm font-medium"
			onclick={() => paginate(-1)}>Previous</button
		>
		<button
			type="button"
			class="min-h-11 rounded-md border border-slate-500 px-4 text-sm font-medium"
			onclick={() => paginate(1)}>Next</button
		>
	</div>
</div>
