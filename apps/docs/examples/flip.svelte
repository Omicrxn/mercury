<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	let justify = $state('start');

	const layoutGroup = layout(() => justify, {
		transition: { type: 'spring', duration: 0.3, bounce: 0 }
	});

	const flip = () => {
		if (justify === 'start') {
			justify = 'end';
		} else {
			justify = 'start';
		}
	};

	const buttonClass =
		'rounded-md border border-demo-stroke bg-demo-fill px-4 py-2 text-sm font-medium text-demo-fill-foreground transition-colors hover:bg-demo-fill-hover';
</script>

<div class="flex min-h-80 flex-col justify-center gap-8 p-8">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
		<h2 class="text-xl font-bold">Layout Animation</h2>

		<div
			{@attach layoutGroup}
			class="flex min-h-24 w-96 max-w-full gap-2 rounded-md border border-demo-stroke border-dashed bg-demo-surface p-4"
			style="justify-content: {justify};"
		>
			<div
				{...layout.props({ type: 'position' })}
				class="box flex size-16 shrink-0 items-center justify-center rounded-md border border-demo-stroke bg-demo-fill font-medium text-demo-fill-foreground"
			>
				Test
			</div>
			<div
				{...layout.props({ type: 'position' })}
				class="box size-16 shrink-0 rounded-md border border-demo-stroke bg-demo-fill"
			></div>
		</div>

		<button class={buttonClass} onclick={flip}>Flip</button>
	</div>
</div>
