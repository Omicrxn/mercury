<script lang="ts">
	import StatefulButton from './stateful-button/button.svelte';

	let buttonState = $state('idle'),
		idleLabel = 'Send me a login link',
		successLabel = 'Login link sent';
</script>

<StatefulButton
	{buttonState}
	idleLabel="Send Feedback"
	successLabel="Feedback Sent"
	onclick={() => {
		buttonState = 'loading';
		setTimeout(() => {
			console.log('success');

			buttonState = 'success';
			setTimeout(() => {
			console.log('success');

			buttonState = 'idle';
		}, 1500);
		}, 1500);
	}}
/>
