<script lang="ts">
	import { presence, mercury } from '$lib/index.js';
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
				transition: { repeat: Infinity, duration: 2.5, ease: 'linear' }
			})}
		/>
	{:else if state === 'idle'}
		{idleLabel}
	{:else}
		{successLabel}
	{/if}
{/snippet}

<button type="submit" class="blue-button" disabled={buttonState === 'loading'} {...props}>
	{#key buttonState}
		<span
			transition:presence={{
				initial: { opacity: 0, y: -25 },
				exit: { opacity: 0, y: 25, transition: { duration: 0.15 } },
				mode: 'popLayout',
				transition: { type: 'spring', duration: 1, bounce: 0 }
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
		height: 32px;
		width: 148px;
		overflow: hidden;
		background: linear-gradient(180deg, #1994ff 0%, #157cff 100%);
		box-shadow:
			0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
			0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
			0px 0px 0px 0.5px #1a94ff;
		position: relative;
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
