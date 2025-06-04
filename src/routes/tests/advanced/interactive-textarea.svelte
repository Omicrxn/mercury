<script lang="ts">
	import { mercury, layout } from '$lib/index.js';
	// const tabs = ['Home', 'React', 'Vue', 'Svelte'];
	const tabs = ['Home', 'React'];
	let selectedTab = $state(0);
</script>

<nav class="container">
	<ul>
		{#each tabs as tab, i (tab)}
			{@const selected = selectedTab === i}
			<li class:selected role="tab" aria-selected={selected}>
				{#if selected}
					<div
						{@attach layout({ layoutId: 'selected-indicator', track: () => selectedTab })}
						class="selected-indicator"
					/>
				{/if}
				<button
					{@attach mercury({ onTapStart: () => (selectedTab = i), whileTap: { scale: 0.9 } })}
				>
					{tab}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	:global(.container) {
		background-color: #0b1011;
		border-radius: 10px;
		border: 1px solid #1d2628;
		padding: 5px;
	}

	:global(.container ul) {
		display: flex;
		gap: 5px;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	:global(.container li) {
		color: #f5f5f5;
		position: relative;
	}

	:global(.container .selected-indicator) {
		background-color: #ff0088;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1;
		border-radius: 5px;
	}

	:global(.container button) {
		z-index: 2;
		position: relative;
		cursor: pointer;
		padding: 10px 14px;
		border-radius: 5px;
	}
</style>
