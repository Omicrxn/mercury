<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	let showSecond = $state(false);
</script>

<div class="wrapper">
	<button {@attach layout({ track: () => showSecond })}
            class="button"
            onclick={() => (showSecond = !showSecond)}>
                Animate </button>
	{#if showSecond}
		<div
			{@attach layout({ layoutId: 'rectangle', track: () => showSecond })}
			class="second-element"
		>
			<div
				class="size-4 bg-red-500 rounded-md"
				{@attach layout({ layoutId: 'rectangle-square', track: () => showSecond })}
			></div>
		</div>
	{:else}
		<div {@attach layout({ layoutId: 'rectangle', track: () => showSecond })} class="element">
			<div
				class="size-4 bg-red-500 rounded-md m-4"
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
