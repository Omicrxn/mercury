<script lang="ts">
	import { mercury, layout } from '@omicrxn/mercury';
	let justify = $state('start');

	const layoutGroup = layout(() => justify, { transition: { duration: 0.4 } });

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};
</script>

<div class="flex flex-col gap-4">
	<div
		{@attach layoutGroup}
		class="rounded-full dark:bg-slate-400 border-2 px-3 py-2 dark:border-slate-50 border-slate-500 bg-slate-200 flex w-36"
		style="justify-content: {justify};"
	>
		<div
			onclick={() => {
				flip();
			}}
			{...layout.props('test-1')}
			class="circle cursor-pointer"
		></div>
	</div>
</div>
