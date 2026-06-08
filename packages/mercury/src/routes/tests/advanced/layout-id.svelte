<script lang="ts">
	import { layout } from '$lib/mercury/layout.svelte.js';
	let showSecond = $state(false);

	const layoutGroup = layout(() => showSecond, { transition: { duration: 0.4 } });
</script>

<div {@attach layoutGroup} class="wrapper">
	<button class="button" onclick={() => (showSecond = !showSecond)}> Animate </button>
	{#if showSecond}
		<div {...layout.props('rectangle')} class="second-element">
			<div
				{...layout.props('rectangle-square')}
				class="size-4 bg-blue-200 rounded-md"
			></div>
		</div>
	{:else}
		<div {...layout.props('rectangle')} class="element">
			<div
				{...layout.props('rectangle-square')}
				class="size-4 bg-red-500 rounded-md m-4"
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
