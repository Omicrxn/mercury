<script lang="ts">
	import { layout } from '$lib/index.js';
	import { ArrowBigDown, ArrowBigRight } from '@lucide/svelte';

	const tabs = ['Home', 'React', 'Vue', 'Svelte'];

	let selectedTab = $state<number>(0);

	let horizontal = $state(true);
	const id = $props.id();

	let keyboardSelection = false;

	const layoutGroup = layout(
		() => [selectedTab, horizontal],
		() => ({
			transition: { type: 'spring', duration: keyboardSelection ? 0 : 0.24, bounce: 0 }
		})
	);

	function selectTab(event: MouseEvent, index: number) {
		keyboardSelection = event.detail === 0;
		selectedTab = index;
	}

	function handleTabKeyDown(event: KeyboardEvent, index: number) {
		const previous = horizontal ? 'ArrowLeft' : 'ArrowUp';
		const next = horizontal ? 'ArrowRight' : 'ArrowDown';
		let target: number;
		if (event.key === previous) target = (index - 1 + tabs.length) % tabs.length;
		else if (event.key === next) target = (index + 1) % tabs.length;
		else if (event.key === 'Home') target = 0;
		else if (event.key === 'End') target = tabs.length - 1;
		else return;
		event.preventDefault();
		keyboardSelection = true;
		selectedTab = target;
		if (event.currentTarget instanceof HTMLElement) {
			event.currentTarget
				.closest('[role="tablist"]')
				?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
				[target]?.focus();
		}
	}
</script>

<div class="navbar-demo flex w-full flex-col items-center justify-center gap-4">
	<div class="flex h-56 w-full items-center justify-center">
		<nav
			{@attach layoutGroup}
			{...layout.props()}
			class={[
				'overflow-hidden border border-white/8 p-1.5',
				'bg-[linear-gradient(145deg,#0f1419_0%,#0a0d10_100%)]'
			]}
			style={horizontal ? 'border-radius: 100px;' : 'border-radius: 24px;'}
			aria-label="Framework navigation"
		>
			<ul
				class={[
					'navbar-tabs m-0 flex list-none items-center justify-center gap-1 p-0',
					horizontal ? 'flex-row' : 'flex-col'
				]}
				role="tablist"
				aria-orientation={horizontal ? 'horizontal' : 'vertical'}
			>
				{#each tabs as tab, index (index)}
					{@const isSelected = selectedTab === index}
					<li class="relative" role="presentation" {...layout.props({ type: 'position' })}>
						{#if isSelected}
							<div
								{...layout.props(`${id}-selected-indicator`)}
								class={[
									'absolute inset-0 z-0 rounded-full',
									'bg-[linear-gradient(135deg,#ff0088_0%,#e6007a_100%)]'
								]}
								aria-hidden="true"
							></div>
						{/if}

						<button
							type="button"
							role="tab"
							aria-selected={isSelected}
							tabindex={isSelected ? 0 : -1}
							class={[
								'relative z-2 cursor-pointer rounded-full border-0 bg-transparent px-3 py-2.5 min-h-11',
								'text-sm leading-none font-medium whitespace-nowrap transition-colors duration-150',
								'focus-visible:outline-2 focus-visible:outline-white focus-visible:-outline-offset-4',
								isSelected ? 'text-white hover:text-white' : 'text-[#8b949e] hover:text-[#c9d1d9]'
							]}
							onclick={(event) => selectTab(event, index)}
							onkeydown={(event) => handleTabKeyDown(event, index)}
						>
							{tab}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<button
		type="button"
		class="orientation-toggle inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-[0.8125rem] font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-pink-500 focus-visible:outline-offset-2"
		onclick={() => {
			keyboardSelection = false;
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

<style>
	.navbar-demo {
		font-family:
			ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
		font-size: 16px;
		line-height: 1.5;
	}

	.navbar-tabs {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.orientation-toggle {
		line-height: 1.5;
	}
</style>
