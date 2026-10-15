<script lang="ts">
	import { spring } from 'motion';
	let value = $state(true);
	const springAnimation = spring(0.35, 0.2);
</script>

<div class="flex flex-col gap-4 items-center">
	<h2 class="text-xl font-bold">CSS Spring</h2>
	<div
		data-state={value}
		class={['box w-16 h-16 bg-blue-200 rounded-md border border-slate-500']}
		style="--spring-transition: {springAnimation};"
	></div>
	<button
		type="button"
		class="bg-blue-200 hover:bg-blue-300 min-h-11 cursor-pointer p-2 rounded-md"
		onclick={() => (value = !value)}>Toggle position</button
	>
</div>

<style>
	.box {
		transition: transform var(--spring-transition);
		transform: translateX(-100%);
	}

	.box[data-state='true'] {
		transform: translateX(100%) rotate(180deg);
	}
	@media (prefers-reduced-motion: reduce) {
		.box {
			transition: none;
		}
	}
</style>
