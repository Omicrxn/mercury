<script lang="ts">
	import { animateExit, ExitMode, mercury } from '$lib/index.js';
	import Loader from 'lucide-svelte/icons/loader';
	import { type ComponentType } from 'svelte';
	let buttonState = $state('idle');
	interface ButtonCopy {
		idle: string;
		loading: ComponentType;
		success: string;
	}
	const buttonCopy: ButtonCopy = {
		idle: 'Send me a login link',
		loading: Loader,
		success: 'Login link sent!'
	};

	const handleClick = () => {
		buttonState = 'loading';
		setTimeout(() => {
			buttonState = 'success';
		}, 1750);

		setTimeout(() => {
			buttonState = 'idle';
		}, 3500);
	};
</script>

{#snippet spanContent(buttonState: string)}
	{#if buttonState === 'loading'}
		<Loader class="animate-spin" />
	{:else}
		{buttonCopy[buttonState]}
	{/if}
{/snippet}

<button
	class=" bg-white px-1 py-4 w-[200px] rounded-md flex justify-center"
	disabled={buttonState !== 'idle'}
	onclick={handleClick}
>
	{#key buttonState}
		<span
			use:mercury={{ animate: { opacity: [0, 1], y: [-25, 0] }, transition: { duration: 0.3 } }}
			out:animateExit={{
				animate: { opacity: 0, y: 25 },
				transition: {
					duration: 0.3
				},
				mode: ExitMode.POP_LAYOUT
			}}
		>
			{@render spanContent(buttonState)}
		</span>
	{/key}
</button>
