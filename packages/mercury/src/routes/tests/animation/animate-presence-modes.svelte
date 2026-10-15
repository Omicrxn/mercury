<script lang="ts">
	import { mercury, presence, type PresenceMode } from '$lib/index.js';
	import type { Snippet } from 'svelte';

	let state = $state(true);
</script>

{#snippet syncIcon()}
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
		<path d="M3 3v5h5" />
		<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
		<path d="M16 16h5v5" />
	</svg>
{/snippet}

{#snippet waitIcon()}
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M12 2v4" />
		<path d="m16.2 7.8 2.9-2.9" />
		<path d="M18 12h4" />
		<path d="m16.2 16.2 2.9 2.9" />
		<path d="M12 18v4" />
		<path d="m4.9 19.1 2.9-2.9" />
		<path d="M2 12h4" />
		<path d="m4.9 4.9 2.9 2.9" />
	</svg>
{/snippet}

{#snippet popLayoutIcon()}
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
		<path d="m21 3-9 9" />
		<path d="M15 3h6v6" />
	</svg>
{/snippet}

{#snippet presenceCircle(mode: PresenceMode, icon: Snippet)}
	<div
		class={['circle', { active: state }]}
		{@attach mercury({
			animate: { opacity: 1, scale: 1 },
			transition: {
				duration: 0.25,
				ease: [0.19, 1, 0.22, 1]
			}
		})}
		out:presence={{
			opacity: 0,
			scale: 0.95,
			mode,
			transition: {
				duration: 0.18,
				ease: [0.19, 1, 0.22, 1]
			}
		}}
	>
		{@render icon()}
	</div>
{/snippet}

{#snippet modeExample(mode: PresenceMode, icon: Snippet)}
	<div class="mode-section">
		<div class="icon-container">
			{#key state}
				{@render presenceCircle(mode, icon)}
			{/key}
		</div>
		<code class="mode-title">{mode}</code>
	</div>
{/snippet}

<div class="container">
	<div class="modes-container">
		{@render modeExample('sync', syncIcon)}
		{@render modeExample('wait', waitIcon)}
		{@render modeExample('popLayout', popLayoutIcon)}
	</div>

	<button
		type="button"
		class="switch-button"
		onclick={() => (state = !state)}
		{@attach mercury({
			whileHover: { scale: 1.02, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
			whileTap: { scale: 0.97, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } }
		})}
	>
		Switch
	</button>
</div>

<style>
	.container {
		--white: #ffffff;
		--black: #0a0a0a;
		--border: #e4e4e7;

		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 40px;
		padding: 24px;
		color: var(--white);
		background-color: #18181b;
		border-radius: 12px;
	}

	.modes-container {
		display: flex;
		gap: 24px;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.mode-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.icon-container {
		width: 80px;
		height: 80px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mode-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--white);
		opacity: 0.9;
	}

	.switch-button {
		background-color: var(--white);
		color: var(--black);
		border: none;
		border-radius: 8px;
		padding: 12px 32px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
	}

	.switch-button:focus-visible {
		outline: 2px solid var(--white);
		outline-offset: 4px;
	}

	.circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		flex-shrink: 0;
		opacity: 0;
		transform: scale(0.95);
		background-color: transparent;
		color: var(--white);
		border: 2px solid var(--white);
	}

	.circle.active {
		background-color: var(--white);
		color: var(--black);
		border: 2px solid var(--border);
	}
</style>
