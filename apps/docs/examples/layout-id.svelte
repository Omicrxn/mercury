<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let showSecond = $state(false);

	const layoutGroup = layout(() => showSecond, { transition: { duration: 0.4 } });
</script>

<div {@attach layoutGroup} class="wrapper">
	<button
		class="rounded-md px-2 py-1 dark:bg-indigo-400 bg-indigo-200 dark:hover:bg-indigo-500 hover:bg-indigo-300"
		onclick={() => (showSecond = !showSecond)}
	>
		Animate
	</button>
	{#if showSecond}
		<div {...layout.props('rectangle')} class="second-element">
			<div {...layout.props('rectangle-square')} class="size-4 bg-blue-200 rounded-md"></div>
		</div>
	{:else}
		<div {...layout.props('rectangle')} class="element">
			<div {...layout.props('rectangle-square')} class="size-4 bg-red-500 rounded-md m-4"></div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		place-items: center;
		flex: 1;
		width: 100%;
		gap: 16px;
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
</style>
