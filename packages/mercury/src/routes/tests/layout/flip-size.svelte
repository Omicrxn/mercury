<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';

	let width = $state('40px');

	const layoutGroup = layout(() => width, { transition: { duration: 0.4 } });

	const buttonClass =
		'rounded-md border border-slate-500 bg-blue-200 px-4 py-2 text-sm font-medium text-slate-800 transition-colors hover:bg-blue-300';
</script>

<div class="flex min-h-screen flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation: Size</h2>

		<div
			{@attach layoutGroup}
			class="flex min-h-24 w-full items-center justify-center gap-2 rounded-md border border-slate-500 border-dashed bg-slate-50 p-4"
		>
			<div {...layout.props()} class="box size-16 shrink-0"></div>
			<div
				{...layout.props('test-size')}
				style="width: {width};"
				class="box flex h-16 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-slate-500 bg-blue-200 px-2 text-sm font-medium text-slate-800"
			>
				<div>Test</div>
				<div class="size-4 rounded-sm bg-green-200"></div>
			</div>
			<div {...layout.props()} class="box size-16 shrink-0"></div>
		</div>

		<button
			class={buttonClass}
			onclick={() => {
				width = width === '40px' ? '100px' : '40px';
			}}
		>
			Flip
		</button>
	</div>
</div>
