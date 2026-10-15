<script lang="ts">
	import { onDestroy } from 'svelte';
	import StatefulButton from './stateful-button/button.svelte';

	let buttonState = $state<'idle' | 'loading' | 'success'>('idle');
	let successTimer: ReturnType<typeof setTimeout> | undefined;
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	function submit() {
		if (buttonState !== 'idle') return;
		buttonState = 'loading';
		successTimer = setTimeout(() => {
			buttonState = 'success';
			resetTimer = setTimeout(() => (buttonState = 'idle'), 1500);
		}, 1000);
	}

	onDestroy(() => {
		clearTimeout(successTimer);
		clearTimeout(resetTimer);
	});
</script>

<StatefulButton
	{buttonState}
	idleLabel="Send Feedback"
	successLabel="Feedback Sent"
	onclick={submit}
/>
