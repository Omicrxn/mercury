<script lang="ts">
	import { mercury } from '$lib/mercury/mercury.svelte.js';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Drag</h2>
	<div
		drag
		{@attach mercury()}
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
	></div>
</div>
