<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';

	let width = $state('40px');

	const layoutGroup = layout(() => width, { transition: { duration: 0.4 } });
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Layout Animation: Size</h2>
	<div {@attach layoutGroup} class="bg-slate-200 flex w-64" style="justify-content: center;">
		<div {...layout.props()} class="box"></div>
		<div
			{...layout.props('test-size')}
			style="width: {width};"
			class="box h-16 bg-blue-200 rounded-md border border-slate-500"
		>
			<div>Test</div>
			<div class="bg-green-200 size-4"></div>
		</div>
		<div {...layout.props()} class="box"></div>
	</div>
	<button
		onclick={() => {
			width = width === '40px' ? '100px' : '40px';
		}}
		class="bg-slate-200">Flip</button
	>
</div>
