<script lang="ts">
	import { mercury, useExit } from '$lib/mercury/mercury-action.svelte.js';
	let justify = $state('justify-start');
	let x = $state(0);
</script>

<div class="relative flex h-full flex-col items-center gap-12 p-32">
	<div class="flex justify-center gap-4">
		<button
			variant="secondary"
			onclick={() => {
				justify = 'justify-start';
			}}>Justify Start</button
		>
		<button
			variant="secondary"
			onclick={() => {
				justify = 'justify-center';
			}}>Justify Center</button
		>
		<button
			variant="secondary"
			onclick={() => {
				justify = 'justify-end';
			}}>Justify End</button
		>
		<button
			onclick={() => {
				x = x + 1;
			}}>increase X</button
		>
	</div>
	<div class="flex min-h-16 w-96 p-4 items-center bg-gray-200 {justify}">
		<div
			class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
			style={justify === 'justify-end' ? 'width:200px;height:200px;' : 'width:96px;height:96px;'}
			use:mercury
			out:useExit
			layout
		></div>
	</div>
</div>
