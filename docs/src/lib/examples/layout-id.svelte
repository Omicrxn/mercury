<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	let showSecond = $state(true);
</script>

<div class="wrapper">
	<button {@attach layout({ track: () => showSecond })}
	class="rounded-md px-2 py-1 dark:bg-indigo-400 bg-indigo-200 dark:border-slate-50 border-slate-500 dark:hover:bg-indigo-500 hover:bg-indigo-300"
            onclick={() => (showSecond = !showSecond)}>
                Animate </button>
	{#if showSecond}
		<div
			{@attach layout({ layoutId: 'rectangle', track: () => showSecond })}
			class="box"
		>
			<div
				class="size-4 bg-rose-600 rounded-md"
				{@attach layout({ layoutId: 'rectangle-square', track: () => showSecond })}
			></div>
		</div>
	{:else}
		<div class="box size-32!" {@attach layout({ layoutId: 'rectangle', track: () => showSecond })} >
			<div
				class="size-4 bg-rose-600 rounded-md m-4"
				{@attach layout({ layoutId: 'rectangle-square', track: () => showSecond })}
			></div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		place-items: center;
		flex:1;
		width: 100%;
	}

	.element {
		width: 48px;
		height: 48px;
		background: #fad658;
		border-radius: 12px;
	}

	.second-element {
		height: 96px;
		width: 96px;
		background: #fad658;
		border-radius: 12px;
	}

	.button {
		background: white;
		padding: 8px 16px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		font-size: 14px;
	}
</style>
