<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let width = $state('40px');

</script>

<div class="flex flex-col gap-4">
	<div class="bg-slate-200 flex w-64" style="justify-content: center;">
	<div
		{@attach layout({  track: () => width })}
		class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		/>
		<div
			{@attach layout({
				layoutId: 'test-size',
				track: () => width
			})}
			style="width: {width};"
			class="box h-16 bg-blue-200 rounded-md border border-slate-500"
		>
		</div>
		<div
			{@attach layout({  track: () => width })}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
			/>
	</div>
	<button
		onclick={() => {
			width = width === '40px' ? '100px' : '40px';
		}}
		class="bg-slate-200">Flip</button
	>
</div>
