<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	let justify = $state('start');

	const layoutGroup = layout(() => justify, { transition: { duration: 0.4 } });

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Layout Animation</h2>

	<div {@attach layoutGroup} class="bg-slate-200 flex w-64" style="justify-content: {justify};">
		<div
			{...layout.props('test-1')}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		>
			Test
		</div>
		<div
			{...layout.props('test-2')}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
	</div>
	<button onclick={flip} class="bg-slate-200">Flip</button>
</div>
