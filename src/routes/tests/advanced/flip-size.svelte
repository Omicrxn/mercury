<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	import { animateView } from 'motion';

	let width = $state('40px');
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Layout Animation: Size</h2>
	<div class="bg-slate-200 flex w-64" style="justify-content: center;">
		<div
			{@attach layout({
				track: () => width
			})}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>

		<div
			{@attach layout({
				track: () => width
			})}
			style="width: {width};"
			class="box h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
		<div
			{@attach layout({
				track: () => width
			})}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
	</div>
	<button
		onclick={() => {
			animateView(() => {
				width = width === '40px' ? '100px' : '40px';
			});
		}}
		class="bg-slate-200">Flip</button
	>
</div>
