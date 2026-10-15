<script lang="ts">
	import { layout } from '$lib/index.js';
	import Ring from './dynamic-island/ring.svelte';

	let view = $state<'idle' | 'ring'>('idle');
	const layoutGroup = layout(() => view, {
		transition: { type: 'spring', bounce: 0.5 }
	});
</script>

<div>
	<div class="flex h-[160px] justify-center">
		<div
			{...layout.props()}
			class="h-fit min-w-[100px] overflow-hidden bg-black text-white"
			style="border-radius: 32px;"
			{@attach layoutGroup}
		>
			{#if view === 'idle'}
				<div class="h-7" {...layout.props({ type: 'position' })}>Idle</div>
			{:else}
				<Ring {...layout.props({ type: 'position' })} />
			{/if}
		</div>
	</div>
	<div class="flex justify-center gap-4">
		<button
			type="button"
			class="h-10 w-32 rounded-full bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
			onclick={() => {
				view = 'idle';
			}}>Idle</button
		>
		<button
			type="button"
			class="h-10 w-32 rounded-full bg-white px-2.5 py-1.5 text-sm font-medium text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
			onclick={() => {
				view = 'ring';
			}}>Ring</button
		>
	</div>
</div>
