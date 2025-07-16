<script lang="ts">
	import { onMount } from 'svelte';
	import StatefulButton from './stateful-button.svelte';
	import { onClickOutside } from 'runed';
	import { layout, mercury, presence } from '@omicrxn/mercury';
	let open = $state(false);
	let formState = $state('idle');
	let feedback = $state('');
	let popover = $state<HTMLElement | null>(null);
	onClickOutside(
		() => popover,
		() => (open = false)
	);
	function submit() {
		//This is just a simulation of a real submit
		formState = 'loading';
		console.log('submitted');
		setTimeout(() => {
			console.log('success');

			formState = 'success';
		}, 1500);
		setTimeout(() => {
			console.log('close');

			open = false;
		}, 3300);
	}

	const handleKeyDown = (event) => {
		if (event.key === 'Escape') {
			open = false;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && open && formState === 'idle') {
			submit();
		}
	};

	onMount(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<div class="feedback-wrapper">
	{#key 'button'}
		<button
			onclick={() => {
				open = true;
				formState = 'idle';
				feedback = '';
			}}
			class="feedback-button"
			style:border-radius={8}
			{@attach layout({ layoutId: 'wrapper', track: () => open })}
		>
			<span {@attach layout({ layoutId: 'title', track: () => open })}>Feedback</span>
		</button>
	{/key}

	{#if open}
		<div
			{@attach layout({ layoutId: 'wrapper', track: () => open })}
			class="feedback-popover"
			style:border-radius={12}
			bind:this={popover}
		>
			<span
				{@attach layout({ layoutId: 'title', track: () => open })}
				aria-hidden
				class="placeholder"
				data-success={formState === 'success' ? 'true' : 'false'}
				data-feedback={feedback ? 'true' : 'false'}
			>
				Feedback
			</span>
			{#if formState === 'success'}
				{#key 'success'}
					<div
						style="opacity: 0; filter: blur(4px); transform: translateY(-32px);"
						{@attach mercury({
							animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
							transition: { type: 'spring', duration: 0.4, bounce: 0 }
						})}
						class="success-wrapper"
					>
						<svg
							width="32"
							height="32"
							viewBox="0 0 32 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
								fill="#2090FF"
								fill-opacity="0.16"
							/>
							<path
								d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
								stroke="#2090FF"
								stroke-width="2.4"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<h3>Feedback received!</h3>
						<p>Thanks for helping me improve Sonner.</p>
					</div>
				{/key}
			{:else}
				{#key 'form'}
					<form
						out:presence={{
							y: 8,
							opacity: 0,
							filter: 'blur(4px)',
							popLayout: true,
							transition: { type: 'spring', duration: 0.4, bounce: 0 }
						}}
						onsubmit={(e) => {
							e.preventDefault();
							if (!feedback) return;
							submit();
						}}
						class="feedback-form"
					>
						<textarea
							autofocus
							placeholder="Feedback"
							bind:value={feedback}
							class="textarea"
							required
						/>
						<div class="feedback-footer">
							<svg
								class="dotted-line"
								width="352"
								height="2"
								viewBox="0 0 352 2"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M0 1H352" stroke="#E6E7E8" stroke-dasharray="4 4" />
							</svg>
							<div class="half-circle-left">
								<svg
									width="6"
									height="12"
									viewBox="0 0 6 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0_2029_22)">
										<path
											d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
											fill="#F5F6F7"
										/>
										<path
											d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
											stroke="#E6E7E8"
											stroke-width="1"
											stroke-linejoin="round"
										/>
									</g>
									<defs>
										<clipPath id="clip0_2029_22">
											<rect width="6" height="12" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</div>

							<div class="half-circle-right">
								<svg
									width="6"
									height="12"
									viewBox="0 0 6 12"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clip-path="url(#clip0_2029_22)">
										<path
											d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
											fill="#F5F6F7"
										/>
										<path
											d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
											stroke="#E6E7E8"
											stroke-width="1"
											stroke-linejoin="round"
										/>
									</g>
									<defs>
										<clipPath id="clip0_2029_22">
											<rect width="6" height="12" fill="white" />
										</clipPath>
									</defs>
								</svg>
							</div>

							<StatefulButton
								buttonState={formState}
								idleLabel="Send Feedback"
								successLabel="Feedback Sent"
							/>
						</div>
					</form>
				{/key}
			{/if}
		</div>
	{/if}
</div>

<style>
	.feedback-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.feedback-button {
		position: relative;
		display: flex;
		height: 36px;
		align-items: center;
		border-radius: 8px;
		border: 1px solid #e9e9e7;
		background: white;
		padding: 0 12px;
		font-weight: 500;
		outline: none;
	}

	.feedback-button span {
		display: block;
		font-size: 14px;
	}

	.feedback-popover {
		position: absolute;
		height: 192px;
		width: 364px;
		overflow: hidden;
		border-radius: 12px;
		background: #f5f6f7;
		padding: 4px;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.08),
			0px 2px 2px rgba(0, 0, 0, 0.04);
		outline: none;
	}

	.placeholder {
		position: absolute;
		font-size: 14px;
		color: #63635d;
		left: 16px;
		top: 17px;
		z-index: 10;
	}
	.placeholder[data-feedback='true'] {
		opacity: 0 !important;
	}

	.success-wrapper {
		display: flex;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.success-wrapper svg {
		margin-top: -4px;
	}

	.success-wrapper h3 {
		margin-bottom: 4px;
		margin-top: 8px;
		font-size: 14px;
		font-weight: 500;
		color: #21201c;
	}

	.success-wrapper p {
		font-size: 14px;
		color: #63635d;
	}

	.feedback-form {
		border-radius: 8px;
		border: 1px solid #e6e7e8;
		background: white;
	}

	.textarea {
		width: 100%;
		height: 128px;
		resize: none;
		border-radius: 8px 0;
		padding: 12px;
		font-size: 14px;
		outline: none;
	}

	.textarea::placeholder {
		opacity: 0;
	}

	.feedback-footer {
		position: relative;
		display: flex;
		height: 48px;
		align-items: center;
		padding: 0 10px;
	}

	.dotted-line {
		position: absolute;
		left: 0;
		right: 0;
		top: -1px;
	}

	.half-circle-left {
		position: absolute;
		left: 0;
		top: 0;
		transform: translateX(-1.5px) translateY(-50%);
	}

	.half-circle-right {
		position: absolute;
		right: 0;
		top: 0;
		transform: translateX(1.5px) translateY(-50%) rotate(180deg);
	}

	:global(.feedback-footer .blue-button) {
		margin-left: auto !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 6px !important;
		font-weight: 600 !important;
		font-size: 12px !important;
		height: 24px !important;
		width: 104px !important;
		overflow: hidden !important;
		background: linear-gradient(180deg, #1994ff 0%, #157cff 100%) !important;
		box-shadow:
			0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
			0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
			0px 0px 0px 0.5px #1a94ff;
		position: relative !important;
	}

	:global(.feedback-footer .blue-button) span {
		display: flex !important;
		width: 100% !important;
		align-items: center !important;
		justify-content: center !important;
		color: white !important;
		text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16) !important;
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
