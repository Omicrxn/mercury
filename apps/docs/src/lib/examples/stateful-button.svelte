<script lang="ts">
	import { presence, mercury } from '@omicrxn/mercury';
	import { Loader } from '@lucide/svelte';
	import { onMount, untrack } from 'svelte';
	let {
		buttonState = $bindable(),
		idleLabel = 'Send me a login link',
		successLabel = 'Login link sent',
		...props
	} = $props();
	const buttonCopy = {
		idle: idleLabel,
		loading: Loader,
		success: successLabel
	};

	let initial = $state(false);
	onMount(() => {
		initial = true;
	});
</script>

{#snippet buttonContent(buttonState)}
	{#if buttonState === 'loading'}
		<Loader
			{@attach mercury({
				animate: { rotate: 360 },
				transition: { repeat: Infinity, duration: 2.5, ease: 'linear' }
			})}
		/>
	{:else}
		{buttonCopy[buttonState]}
	{/if}
{/snippet}

<button type="submit" class="blue-button" disabled={buttonState === 'loading'} {...props}>
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
</style>
