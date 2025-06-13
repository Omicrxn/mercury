<script lang="ts">
	import { mercury,layout } from '@omicrxn/mercury';
	let justify = $state('start');

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};
</script>

<div class="flex flex-col gap-4">

	<div class="bg-slate-200 flex w-32" style="justify-content: {justify};">
		<div
			{@attach layout({ layoutId: 'test-1', track: () => justify })}
			class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"
		>

		</div>
	</div>
	<button
		onclick={() => {
			flip();
		}}
		class="bg-slate-200">Flip</button
	>
</div>
