<script lang="ts">
	import { mercury, useExit } from '$lib/mercury/mercury-action.svelte.js';
	let justify = $state('justify-start');
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
	</div>
	<div class="flex min-h-16 w-96 items-center {justify}">
		<div
			class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
			use:mercury
			out:useExit={{ opacity: 0, duration: 0.3 }}
			layout
		></div>
	</div>
</div>
