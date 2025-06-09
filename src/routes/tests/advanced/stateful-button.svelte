<script lang="ts">
	import { presence, mercury } from '$lib/index.js';
	import { Loader } from '@lucide/svelte';
	import { onMount, tick, untrack } from 'svelte';
	const buttonCopy = {
		idle: 'Send me a login link',
		loading: Loader,
		success: 'Login link sent!'
	};

	let buttonState = $state('idle');
	let initial = $state(false);
	onMount(() => {
		initial = true;
	});
</script>

{#snippet buttonContent(state)}
	{#if state === 'loading'}
		<Loader
			{@attach mercury({
				animate: { rotate: 360 },
				transition: { repeat: Infinity, duration: 2.5, ease: 'linear' }
			})}
		/>
	{:else}
		{buttonCopy[state]}
	{/if}
{/snippet}

<div class="outer-wrapper">
	<button
		class="blue-button"
		disabled={buttonState === 'loading'}
		onclick={() => {
			if (buttonState === 'success') return;

			buttonState = 'loading';

			setTimeout(() => {
				buttonState = 'success';
			}, 1750);

			setTimeout(() => {
				buttonState = 'idle';
			}, 3500);
		}}
	>
		{#key buttonState}
			<span
				class="opacity-0"
				style={untrack(() => initial) ? 'transform:translateY(-25px)' : ''}
				{@attach mercury({
					animate: { opacity: 1, y: 0 },
					transition: { type: 'spring', duration: 1, bounce: 0 }
				})}
				out:presence={{ opacity: 0, y: 25, mode: 'popLayout', transition: { duration: 0.15 } }}
			>
				{@render buttonContent(buttonState)}
			</span>
		{/key}
	</button>
</div>

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

	.outer-wrapper {
		display: flex;
		padding: 120px 40px;
		justify-content: center;
	}

	.wrapper {
		height: var(--spinner-size, 20px);
		width: var(--spinner-size, 20px);
	}

	.spinner {
		position: relative;
		top: 50%;
		left: 50%;
		height: var(--spinner-size, 20px);
		width: var(--spinner-size, 20px);
	}

	.bar {
		animation: spin 1.2s linear infinite;
		background: var(--spinner-color);
		border-radius: 6px;
		height: 8%;
		left: -10%;
		position: absolute;
		top: -3.9%;
		width: 24%;
	}

	.bar:nth-child(1) {
		animation-delay: -1.2s;
		transform: rotate(0.0001deg) translate(146%);
	}

	.bar:nth-child(2) {
		animation-delay: -1.1s;
		transform: rotate(30deg) translate(146%);
	}

	.bar:nth-child(3) {
		animation-delay: -1s;
		transform: rotate(60deg) translate(146%);
	}

	.bar:nth-child(4) {
		animation-delay: -0.9s;
		transform: rotate(90deg) translate(146%);
	}

	.bar:nth-child(5) {
		animation-delay: -0.8s;
		transform: rotate(120deg) translate(146%);
	}

	.bar:nth-child(6) {
		animation-delay: -0.7s;
		transform: rotate(150deg) translate(146%);
	}

	.bar:nth-child(7) {
		animation-delay: -0.6s;
		transform: rotate(180deg) translate(146%);
	}

	.bar:nth-child(8) {
		animation-delay: -0.5s;
		transform: rotate(210deg) translate(146%);
	}

	.bar:nth-child(9) {
		animation-delay: -0.4s;
		transform: rotate(240deg) translate(146%);
	}

	.bar:nth-child(10) {
		animation-delay: -0.3s;
		transform: rotate(270deg) translate(146%);
	}

	.bar:nth-child(11) {
		animation-delay: -0.2s;
		transform: rotate(300deg) translate(146%);
	}

	.bar:nth-child(12) {
		animation-delay: -0.1s;
		transform: rotate(330deg) translate(146%);
	}

	@keyframes spin {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0.15;
		}
	}
</style>
