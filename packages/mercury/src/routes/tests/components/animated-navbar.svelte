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

	// Only re-run layout animation on tab change — not orientation.
	// Orientation updates flex instantly; animating the indicator in parallel
	// makes tab labels look like they're drifting.
	const layoutGroup = layout(
		() => [selectedTab, horizontal],
		{
			transition: { duration: 0.35, ease },
			children: '[data-layout-id="selected-indicator"]',
			states: { swapAt: { opacity: 1 } }
		}
	);
</script>

<div
	class="flex min-h-full flex-col items-center justify-center gap-8 p-12 font-sans text-[#e8eaed]"
>
	<header class="flex max-w-md flex-col items-center gap-2 text-center">
		<h1 class="m-0 text-[1.75rem] font-semibold tracking-tight text-[#f5f7fa]">Animated Navbar</h1>
		<p class="m-0 text-[0.9375rem] leading-normal text-[#8b949e]">
			Layout-driven indicator that springs between tabs
		</p>
	</header>

	<div class="flex flex-col items-center gap-4">
		<nav
			{@attach layoutGroup}
			class={[
				'border border-white/8 p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]',
				'bg-[linear-gradient(145deg,#0f1419_0%,#0a0d10_100%)]'
			]}
			style={horizontal ? 'border-radius: 100px;' : 'border-radius: 24px;'}
			aria-label="Framework navigation"
		>
			<ul
				class={[
					'm-0 flex list-none items-center justify-center gap-1 p-0',
					horizontal ? 'flex-row' : 'flex-col'
				]}
				role="tablist"
			>
				{#each tabs as tab, index (index)}
					{@const isSelected = selectedTab === index}
					<li class="relative" role="presentation">
						<div
							{...layout.props('selected-indicator')}
							class={[
								'absolute inset-0 z-0 rounded-full',
								'bg-[linear-gradient(135deg,#ff0088_0%,#e6007a_100%)]',
								'shadow-[0_0_20px_rgba(255,0,136,0.45),0_0_40px_rgba(255,0,136,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]',
								!isSelected && 'hidden'
							]}
							aria-hidden={!isSelected}
						></div>

						<button
							type="button"
							role="tab"
							id="tab-{index}"
							aria-selected={isSelected}
							aria-controls="tabpanel-{index}"
							tabindex={isSelected ? 0 : -1}
							class={[
								'relative z-2 cursor-pointer rounded-full border-0 bg-transparent px-4.5 py-2.5',
								'text-sm leading-none font-medium whitespace-nowrap transition-colors',
								'focus-visible:outline-2 focus-visible:outline-[rgba(255,0,136,0.6)] focus-visible:outline-offset-2',
								isSelected
									? 'text-white hover:text-white'
									: 'text-[#8b949e] hover:text-[#c9d1d9]'
							]}
							onclick={() => (selectedTab = index)}
						>
							{tab}
						</button>
					</li>
				{/each}
			</ul>
		</nav>

		<button
			type="button"
			class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-white/4 px-4 py-2 text-[0.8125rem] font-medium text-[#c9d1d9] transition-colors hover:border-white/16 hover:bg-white/8 hover:text-[#f0f3f6] focus-visible:outline-2 focus-visible:outline-[rgba(255,0,136,0.6)] focus-visible:outline-offset-2"
			onclick={() => {
				horizontal = !horizontal;
			}}
			aria-label={horizontal ? 'Switch to vertical layout' : 'Switch to horizontal layout'}
		>
			{#if horizontal}
				<ArrowBigDown size={16} strokeWidth={2} aria-hidden="true" />
				<span>Vertical</span>
			{:else}
				<ArrowBigRight size={16} strokeWidth={2} aria-hidden="true" />
				<span>Horizontal</span>
			{/if}
		</button>
	</div>
</div>
