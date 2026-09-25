<script lang="ts">
	import { layout } from '@omicrxn/mercury';
	import { ArrowBigDown, ArrowBigRight } from '@lucide/svelte';
	import { spring } from 'motion';
	const tabs = ['Home', 'React', 'Svelte'];
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

<nav
	{@attach layoutGroup}
	class="container dark:bg-slate-400 border dark:border-slate-50 border-slate-500 bg-slate-200"
>
	<ul class={horizontal ? 'flex-row' : 'flex-col'}>
		{#each tabs as tab, index (index)}
			{@const isSelected = selectedTab === index}
			<li class={isSelected ? 'selected' : ''} role="tab" aria-selected={isSelected}>
				<div
					{...layout.props('selected-indicator')}
					class="selected-indicator bg-indigo-200 dark:bg-indigo-400 border dark:border-slate-50 border-slate-500"
					class:is-hidden={!isSelected}
					aria-hidden={!isSelected}
				></div>

				<button
					onclick={() => (selectedTab = index)}
					class="dark:text-white text-black"
					{...layout.props(`button-${index}`)}
				>
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
		border-radius: 10px;
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
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 0;
		border-radius: 5px;
	}

	.container .selected-indicator.is-hidden {
		display: none;
	}

	.container button {
		z-index: 2;
		position: relative;
		cursor: pointer;
		padding: 6px 8px;
		border-radius: 5px;
	}
</style>
