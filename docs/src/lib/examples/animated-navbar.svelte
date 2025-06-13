<script lang="ts">
	import { mercury, layout } from '@omicrxn/mercury';
	import { ArrowBigDown, ArrowBigRight } from '@lucide/svelte';
	import { spring } from 'motion';
	import { onMount, tick } from 'svelte';
	const tabs = ['Home', 'React', 'Vue', 'Svelte'];
	let selectedTab = $state<number>(0);
	const { duration, ease } = spring.applyToOptions({
		bounce: 0,
		stiffness: 40,
		damping: 80
	});
	let animationConfig = {
		duration: 300,
		easing: ease
	};
	let horizontal = $state(true);

</script>

<nav
	class="container"
	{@attach layout({
		layoutId: 'nav',
		track: () => selectedTab & horizontal,
		animationConfig: { duration: 350 }
	})}
>
	<ul class={horizontal ? 'flex-row' : 'flex-col'}>
		{#each tabs as tab, index (index)}
			{@const isSelected = selectedTab === index}
			<li class={isSelected ? 'selected' : ''} role="tab" aria-selected={isSelected}>
				{#if isSelected}
					<div
						{@attach layout({
							layoutId: 'selected-indicator',
							track: () => selectedTab & horizontal,
							animationConfig
						})}
						class="selected-indicator"
					/>
				{/if}

				<button
					onclick={() => (selectedTab = index)}
					{@attach layout({
						layoutId: `button-${index}`,
						track: () => selectedTab & horizontal,
						animationConfig: { duration: 350 }
					})}
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
