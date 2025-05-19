<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
	let justify = $state('justify-start');
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Flip</h2>
	<div layout {@attach mercury()} class="bg-slate-200 flex {justify}">
		<div
			layout
			{@attach mercury()}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
	</div>
	<button
		onclick={() => {
			if (justify === 'justify-start') {
				justify = 'justify-end';
			} else {
				justify = 'justify-start';
			}
		}}
		class="bg-slate-200">Flip</button
	>
</div>
