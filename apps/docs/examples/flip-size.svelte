<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let width = $state('40px');

	const layoutGroup = layout(() => width, { transition: { duration: 0.4 } });
</script>

<div class="flex flex-col gap-4">
	<div {@attach layoutGroup} class="container flex w-64 gap-2" style="justify-content: center;">
		<div {...layout.props()} class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500" />
		<div
			{...layout.props('test-size')}
			style="width: {width};"
			class="box h-16 bg-blue-200 rounded-md border border-slate-500"
		></div>
		<div {...layout.props()} class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500" />
	</div>
	<button
		onclick={() => {
			width = width === '40px' ? '100px' : '40px';
		}}
		class="rounded-md px-2 py-1 dark:bg-indigo-400 bg-indigo-200 dark:border-slate-50 border-slate-500 dark:hover:bg-indigo-500 hover:bg-indigo-300"
		>Flip</button
	>
</div>
