<script lang="ts">
	import { layout, nodeMap } from '$lib/mercury/layout.svelte.js';

	let width = $state('40px');
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Layout Animation: Size</h2>
	<div class="bg-slate-200 flex w-64" style="justify-content: center;">
		<div
			{@attach layout({
				layoutId: 'test-size',
				track: () => width
			})}
			style="width: {width};"
			class="box h-16 bg-blue-200 rounded-md border border-slate-500"
		>
			<div>Test</div>
			<div class="bg-green-200 size-4"></div>
		</div>
	</div>
	<button
		onclick={() => {
			width = width === '40px' ? '100px' : '40px';
		}}
		class="bg-slate-200">Flip</button
	>
</div>
