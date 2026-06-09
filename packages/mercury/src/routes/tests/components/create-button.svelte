<script lang="ts">
	import { layout, mercury } from '$lib/index.js';

	let {
		menuSpring = { stiffness: 240, damping: 23 },
		clipPathDuration = 0.3,
		contentOffsetY = 40,
		contentScale = 0.9,
		staggerInterval = 0.05
	}: {
		menuSpring?: { stiffness: number; damping: number };
		clipPathDuration?: number;
		contentOffsetY?: number;
		contentScale?: number;
		staggerInterval?: number;
	} = $props();

	let isOpen = $state(false);

	const menuTransition = $derived({ type: 'spring' as const, ...menuSpring });

	const layoutGroup = layout(() => isOpen, () => ({ transition: menuTransition }));

	// Motion clears inline styles when a spring finishes; lock final values so CSS
	// doesn't snap back to hidden.
	const attachGrid = $derived.by(
		() => (node: HTMLElement) =>
			mercury({
				animate: {
					opacity: [0, 1],
					y: [contentOffsetY, 0],
					scale: [contentScale, 1]
				},
				transition: menuTransition,
				callbacks: {
					onComplete: () => {
						node.style.opacity = '1';
						node.style.transform = 'none';
					}
				}
			})(node)
	);

	const attachIcon = $derived.by(
		() => (node: HTMLElement) =>
			mercury({
				animate: { rotate: [45, 0] },
				transition: menuTransition,
				callbacks: {
					onComplete: () => {
						node.style.transform = 'rotate(0deg)';
					}
				}
			})(node)
	);

	const menuItems = [
		{ label: 'Project', icon: 'folder' },
		{ label: 'Notebook', icon: 'notebook' },
		{ label: 'Notes', icon: 'notes' },
		{ label: 'Goal', icon: 'trophy' },
		{ label: 'Milestone', icon: 'flag' },
		{ label: 'Event', icon: 'calendar' }
	] as const;

	const gridItemAttachments = $derived.by(() =>
		menuItems.map(
			(_, index) => (node: HTMLElement) =>
				mercury({
					animate: { opacity: [0, 1] },
					transition: {
						...menuTransition,
						delay: index * staggerInterval + 0.1
					},
					callbacks: {
						onComplete: () => {
							node.style.opacity = '1';
						}
					}
				})(node)
		)
	);
</script>

<div class="container">
	<div class="wrapper" {@attach layoutGroup}>
		{#if !isOpen}
			<button
				type="button"
				class="trigger-button"
				onclick={() => (isOpen = true)}
				{...layout.props('wrapper')}
			>
				<span class="trigger-cap top-left"></span>
				<span class="trigger-cap top-right"></span>
				<span class="trigger-cap bottom-left"></span>
				<span class="trigger-cap bottom-right"></span>
				<span {...layout.props('text')} class="trigger-text">Create new</span>
				<div {...layout.props('icon')} class="icon-center">
					<div class="icon-rotate icon-rotate-closed">
						{@render CloseIcon()}
					</div>
				</div>
			</button>
		{/if}

		{#if isOpen}
			<div {...layout.props('wrapper')} class="expanded-menu">
				<span class="trigger-cap top-left"></span>
				<span class="trigger-cap top-right"></span>
				<span class="trigger-cap bottom-left"></span>
				<span class="trigger-cap bottom-right"></span>

				<div class="menu-header">
					<span {...layout.props('text')} class="menu-title">Create new</span>
					<div
						role="button"
						tabindex="0"
						aria-label="Close"
						class="icon-center icon-close"
						onclick={() => (isOpen = false)}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								isOpen = false;
							}
						}}
						{...layout.props('icon')}
					>
						<div class="icon-rotate" {@attach attachIcon}>
							{@render CloseIcon()}
						</div>
					</div>
				</div>

				<div class="buttons-grid" {@attach attachGrid}>
					{#each menuItems as item, index (item.label)}
						{@const col = index % 3}
						{@const row = Math.floor(index / 3)}
						<button
							type="button"
							class="grid-item"
							class:border-right={col < 2}
							class:border-bottom={row < 1}
							{@attach gridItemAttachments[index]}
						>
							<span class="grid-item-highlight" aria-hidden="true"></span>
							<span class="grid-item-icon">
								{#if item.icon === 'folder'}
									{@render FolderIcon()}
								{:else if item.icon === 'notebook'}
									{@render NotebookIcon()}
								{:else if item.icon === 'notes'}
									{@render NotesIcon()}
								{:else if item.icon === 'trophy'}
									{@render TrophyIcon()}
								{:else if item.icon === 'flag'}
									{@render FlagIcon()}
								{:else}
									{@render CalendarIcon()}
								{/if}
							</span>
							<span class="grid-item-label">{item.label}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet CloseIcon()}
	<svg width="1em" height="1em" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M10.546 1.354L1.354 10.546"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
		<path
			d="M10.546 10.546L1.354 1.354"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
		/>
	</svg>
{/snippet}

{#snippet FolderIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h5.175q.4 0 .763.15t.637.425L12 6h8q.825 0 1.413.588T22 8v10q0 .825-.587 1.413T20 20zm0-2h16V8h-8.825l-2-2H4zm0 0V6z"
		/>
	</svg>
{/snippet}

{#snippet NotebookIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M5 19h9v-4q0-.425.288-.712T15 14h4V5H5zm0 2q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v9.175q0 .4-.15.763t-.425.637l-4.85 4.85q-.275.275-.637.425t-.763.15zm6-7H8q-.425 0-.712-.288T7 13t.288-.712T8 12h3q.425 0 .713.288T12 13t-.288.713T11 14m5-4H8q-.425 0-.712-.288T7 9t.288-.712T8 8h8q.425 0 .713.288T17 9t-.288.713T16 10M5 19V5z"
		/>
	</svg>
{/snippet}

{#snippet NotesIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M9 9v11h7v-3q0-.425.288-.712T17 16h3V9zM7 20V8.975q0-.825.6-1.4T9.025 7H20q.825 0 1.413.587T22 9v7.175q0 .4-.15.763t-.425.637l-3.85 3.85q-.275.275-.638.425t-.762.15H9q-.825 0-1.412-.587T7 20M2.025 6.25q-.15-.825.325-1.487t1.3-.813L14.5 2.025q.8-.15 1.45.338t.85 1.287l.175.775q.125.5-.15.8t-.65.35t-.712-.137T15 4.75L14.825 4L4 5.925l1.5 8.6q.075.425-.15.762t-.65.413t-.75-.162t-.4-.663z"
		/>
	</svg>
{/snippet}

{#snippet TrophyIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M11 19v-3.1q-1.225-.275-2.187-1.037T7.4 12.95q-1.875-.225-3.137-1.637T3 8V7q0-.825.588-1.412T5 5h2q0-.825.588-1.412T9 3h6q.825 0 1.413.588T17 5h2q.825 0 1.413.588T21 7v1q0 1.9-1.263 3.313T16.6 12.95q-.45 1.15-1.412 1.913T13 15.9V19h3q.425 0 .713.288T17 20t-.288.713T16 21H8q-.425 0-.712-.288T7 20t.288-.712T8 19zm-4-8.2V7H5v1q0 .95.55 1.713T7 10.8m5 3.2q1.25 0 2.125-.875T15 11V5H9v6q0 1.25.875 2.125T12 14m5-3.2q.9-.325 1.45-1.088T19 8V7h-2zm-5-1.3"
		/>
	</svg>
{/snippet}

{#snippet FlagIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M7 13v8q0 .425-.288.713T6 22t-.712-.288T5 21V4q0-.425.288-.712T6 3h13.525q.275 0 .488.125t.337.325t.162.438t-.062.487L19 8l1.45 3.625q.1.25.063.488t-.163.437t-.337.325t-.488.125zm0-2h11.05l-.9-2.25Q17 8.4 17 8t.15-.75l.9-2.25H7zm0 0V5z"
		/>
	</svg>
{/snippet}

{#snippet CalendarIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V3q0-.425.288-.712T7 2t.713.288T8 3v1h8V3q0-.425.288-.712T17 2t.713.288T18 3v1h1q.825 0 1.413.588T21 6v14q0 .825-.587 1.413T19 22zm0-2h14V10H5zM5 8h14V6H5zm0 0V6z"
		/>
	</svg>
{/snippet}

<style>
	.container {
		--layer: #f4f4f5;
		--foreground: #18181b;
		--foreground-feint: #71717a;
		--accent: #18181b;
		--accent-light: color-mix(in srgb, var(--foreground) 8%, transparent);
		--border: #e4e4e7;
		--background: #ffffff;
		--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		--kicker-tracking-loose: 0.14em;
		--kicker-tracking-tight: 0.1em;
		--dossier-stripe-angle: 119deg;

		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100dvh;
		font-family: inherit;
	}

	.wrapper {
		position: relative;
		font-size: 1.5rem;
		line-height: 2rem;
	}

	.trigger-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background-color: var(--layer);
		background-image: repeating-linear-gradient(
			var(--dossier-stripe-angle),
			color-mix(in srgb, var(--foreground) 6%, transparent) 0,
			color-mix(in srgb, var(--foreground) 6%, transparent) 1px,
			transparent 1px,
			transparent 5px
		);
		color: var(--foreground);
		padding: 0.7rem 1.1rem;
		cursor: pointer;
		will-change: transform;
		border: none;
		outline: none;
		font-family: inherit;
		font-size: inherit;
		clip-path: inset(0);
	}

	.trigger-cap {
		position: absolute;
		width: 10px;
		height: 10px;
		border: 1.5px solid var(--accent, var(--foreground));
		pointer-events: none;
		z-index: 1;
	}

	.top-left {
		top: -1px;
		left: -1px;
		border-right: none;
		border-bottom: none;
	}

	.top-right {
		top: -1px;
		right: -1px;
		border-left: none;
		border-bottom: none;
	}

	.bottom-left {
		bottom: -1px;
		left: -1px;
		border-right: none;
		border-top: none;
	}

	.bottom-right {
		bottom: -1px;
		right: -1px;
		border-left: none;
		border-top: none;
	}

	.trigger-text {
		position: relative;
		will-change: transform;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: var(--kicker-tracking-loose);
		text-transform: uppercase;
		font-variation-settings: 'wght' 560;
	}

	.icon-center {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		will-change: transform;
		color: var(--accent, var(--foreground));
		font-size: 0.625rem;
	}

	.icon-rotate {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon-rotate-closed {
		transform: rotate(45deg);
	}

	.expanded-menu {
		position: relative;
		background-color: var(--layer);
		border: 1px dotted var(--border);
		width: min(22rem, 90vw);
		color: var(--foreground);
		overflow: hidden;
		will-change: transform;
		box-shadow: 0 16px 48px color-mix(in srgb, var(--background) 70%, transparent);
		clip-path: inset(0);
	}

	.menu-header {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1.1rem;
		border-bottom: 1px dotted var(--border);
		box-sizing: border-box;
	}

	.menu-title {
		will-change: transform;
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: var(--kicker-tracking-loose);
		text-transform: uppercase;
		color: var(--foreground-feint);
		font-variation-settings: 'wght' 560;
	}

	.icon-close {
		cursor: pointer;
		padding: 0.5rem;
		margin: -0.5rem;
		color: var(--foreground);
		background: none;
		border: none;
	}

	.buttons-grid {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		overflow: hidden;
		will-change: transform;
	}

	.grid-item {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		gap: 0.55rem;
		padding: 1.1rem 0.5rem;
		background-color: var(--layer);
		color: var(--foreground-feint);
		border: none;
		font: inherit;
	}

	.grid-item.border-right {
		border-right: 1px dotted var(--border);
	}

	.grid-item.border-bottom {
		border-bottom: 1px dotted var(--border);
	}

	.grid-item-highlight {
		position: absolute;
		inset: 0;
		background-color: var(--accent-light);
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.grid-item:hover .grid-item-highlight {
		opacity: 1;
	}

	.grid-item-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground-feint);
	}

	.grid-item-label {
		position: relative;
		font-family: var(--font-mono);
		font-size: 10px;
		color: var(--foreground);
		line-height: 1;
		letter-spacing: var(--kicker-tracking-tight);
		text-transform: uppercase;
		font-variation-settings: 'wght' 540;
	}
</style>
