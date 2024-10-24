<script>
	import { mercury } from '$lib/mercury/mercury-action.svelte';

	let show = $state(false);
</script>

<div class="wrapper">
	<button use:mercury layout class="button" onclick={() => (show = !show)}> Animate </button>
	{#if show}
		<div layout="rectangle" use:mercury class="second-element" />
	{:else}
		<div layout="rectangle" use:mercury class="element" />
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
