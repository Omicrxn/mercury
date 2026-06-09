<script lang="ts">
	import { layout } from '$lib/index.js';
	import { ArrowBigDown, ArrowBigRight } from '@lucide/svelte';
	import { spring } from 'motion';
	const tabs = ['Home', 'React', 'Vue', 'Svelte'];
	let selectedTab = $state<number>(0);
	const { ease } = spring.applyToOptions({
		bounce: 0,
		stiffness: 40,
		damping: 80
	});
	let horizontal = $state(true);

	const layoutGroup = layout(
		() => [selectedTab, horizontal],
		{ transition: { duration: 0.35, ease } }
	);
</script>

<nav {@attach layoutGroup} class="container">
	<ul class={horizontal ? 'flex-row' : 'flex-col'}>
		{#each tabs as tab, index (index)}
			{@const isSelected = selectedTab === index}
			<li class={isSelected ? 'selected' : ''} role="tab" aria-selected={isSelected}>
				{#if isSelected}
					<div {...layout.props('selected-indicator')} class="selected-indicator" />
				{/if}

				<button onclick={() => (selectedTab = index)} {...layout.props(`button-${index}`)}>
					{tab}
				</button>
			</li>
		{/each}
	</ul>
</nav>
<button
	onclick={() => {
		horizontal = !horizontal;
	}}
>
	{#if horizontal}
		<ArrowBigRight />
	{:else}<ArrowBigDown />
	{/if}
</button>

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
