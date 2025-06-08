<script lang="ts">
	import { mercury, layout } from '$lib/index.js';
	import type { AnimationConfig } from '@layout-projection/animation';
	import { spring } from 'motion';
	const tabs = ['Home', 'React', 'Vue', 'Svelte'];
	let selectedTab = $state<number>(0);
	const { duration, ease } = spring.applyToOptions({
		bounce: 0,
		stiffness: 40,
		damping: 80
	});
	let animationConfig: AnimationConfig = {
		duration: 300,
		easing: ease
	};
</script>

<nav class="container">
	<ul>
		{#each tabs as tab, index (index)}
			{@const isSelected = selectedTab === index}
			<li class={isSelected ? 'selected' : ''} role="tab" aria-selected={isSelected}>
				{#if isSelected}
					<div
						{@attach layout({
							layoutId: 'selected-indicator',
							track: () => selectedTab,
							animationConfig
						})}
						class="selected-indicator"
					/>
				{/if}

				<button
					{@attach mercury({
						onTapStart: () => (selectedTab = index),
						whileTap: { scale: 0.9 }
					})}
				>
					{tab}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.container {
		background-color: #0b1011;
		border-radius: 10px;
		border: 1px solid #1d2628;
		padding: 5px;
	}

	.container ul {
		display: flex;
		gap: 5px;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}

	.container li {
		color: #f5f5f5;
		position: relative;
	}

	.container .selected-indicator {
		background-color: #ff0088;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 1;
		border-radius: 5px;
	}

	.container button {
		z-index: 2;
		position: relative;
		cursor: pointer;
		padding: 10px 14px;
		border-radius: 5px;
	}
</style>
