<script lang="ts">
	import { spring } from 'motion';
	let value = $state(true);
	const springAnimation = spring(0.5, 0.8);
</script>

<div class="flex flex-col gap-4 items-center">
	<h2 class="text-xl font-bold">CSS Spring</h2>
	<div
		data-state={value}
		class={['box w-16 h-16 bg-blue-200 rounded-md border border-slate-500']}
		style="transition: transform {springAnimation};"
	></div>
	<button onclick={() => (value = !value)}>Toggle position</button>
</div>

<style>
	.box {
		transform: translateX(-100%);
	}

	.box[data-state='true'] {
		transform: translateX(100%) rotate(180deg);
	}
	button {
		background-color: #8df0cc;
		color: #0f1115;
		border-radius: 5px;
		padding: 10px;
		margin: 10px;
	}
</style>
