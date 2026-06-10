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

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation</h2>

		<div
			{@attach layoutGroup}
			class="flex min-h-24 w-96 max-w-full gap-2 rounded-md border border-slate-500 border-dashed bg-slate-50 p-4"
			style="justify-content: {justify};"
		>
			<div
				{...layout.props('test-1')}
				class="box flex size-16 shrink-0 items-center justify-center rounded-md border border-slate-500 bg-blue-200 font-medium text-slate-800"
			>
				Test
			</div>
			<div
				{...layout.props('test-2')}
				class="box size-16 shrink-0 rounded-md border border-slate-500 bg-blue-200"
			></div>
		</div>

		<button class={buttonClass} onclick={flip}>Flip</button>
	</div>
</div>
