<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	let showSecond = $state(false);
</script>

<div class="wrapper">
	<button class="button" onclick={() => (showSecond = !showSecond)}> Animate </button>
	{#if showSecond}
		<div
			{@attach layout({ layoutId: 'rectangle', track: () => showSecond })}
			class="second-element"
		>
			<div
				class="size-4 bg-blue-200 rounded-md"
				{@attach layout({ layoutId: 'rectangle-text', track: () => showSecond })}
			></div>
		</div>
	{:else}
		<div {@attach layout({ layoutId: 'rectangle', track: () => showSecond })} class="element">
			<div
				class="size-4 bg-red-500 rounded-md m-4"
				{@attach layout({ layoutId: 'rectangle-text', track: () => showSecond })}
			></div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		height: 100vh;
		width: 100vw;
		place-items: center;
		background: #0d0d0d;
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
		font-size: 14px;
	}
</style>
