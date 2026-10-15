<script lang="ts">
	import { presence, mercury } from '@omicrxn/mercury';
	import { Loader } from '@lucide/svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type ButtonState = 'idle' | 'loading' | 'success';

	let {
		buttonState = $bindable<ButtonState>('idle'),
		idleLabel = 'Send me a login link',
		successLabel = 'Login link sent',
		...props
	}: {
		buttonState?: ButtonState;
		idleLabel?: string;
		successLabel?: string;
	} & HTMLButtonAttributes = $props();
</script>

{#snippet buttonContent(state: ButtonState)}
	{#if state === 'loading'}
		<Loader
			{@attach mercury({
				animate: { rotate: 360 },
				transition: { repeat: Infinity, duration: 0.85, ease: 'linear' }
			})}
		/>
	{:else if state === 'idle'}
		{idleLabel}
	{:else}
		{successLabel}
	{/if}
{/snippet}

<button
	type="submit"
	class="blue-button"
	disabled={buttonState === 'loading'}
	aria-busy={buttonState === 'loading'}
	aria-live="polite"
	{@attach mercury({
		whileHover: { scale: 1.02, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
		whileTap: { scale: 0.97, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } }
	})}
	{...props}
>
	{#key buttonState}
		<span
			transition:presence={{
				initial: { opacity: 0, y: -8 },
				exit: { opacity: 0, y: 8, transition: { duration: 0.12, ease: 'easeOut' } },
				mode: 'popLayout',
				transition: { type: 'spring', duration: 0.24, bounce: 0 }
			}}
		>
			{@render buttonContent(buttonState)}
		</span>
	{/key}
</button>

<style>
	.blue-button {
		border-radius: 8px;
		font-weight: 500;
		font-size: 13px;
		min-height: 44px;
		width: 148px;
		overflow: hidden;
		background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
		box-shadow:
			0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
			0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
			0px 0px 0px 0.5px #1a94ff;
		position: relative;
	}

	.blue-button:focus-visible {
		outline: 2px solid #90caff;
		outline-offset: 3px;
	}

	.blue-button span {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
		color: white;
		text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16);
	}
</style>
