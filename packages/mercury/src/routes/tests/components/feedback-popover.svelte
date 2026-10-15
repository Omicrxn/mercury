<script lang="ts">
	import { onMount } from 'svelte';
	import StatefulButton from './stateful-button/button.svelte';
	import { layout, presence } from '$lib/index.js';

	let open = $state(false);
	let formState = $state<'idle' | 'loading' | 'success'>('idle');
	let feedback = $state('');
	let popover = $state<HTMLElement | null>(null);
	let successTimer: ReturnType<typeof setTimeout> | undefined;
	let closeTimer: ReturnType<typeof setTimeout> | undefined;

	const layoutGroup = layout(() => open, {
		transition: { type: 'spring', duration: 0.28, bounce: 0 }
	});

	function clearSubmission() {
		clearTimeout(successTimer);
		clearTimeout(closeTimer);
	}

	function openPopover() {
		clearSubmission();
		formState = 'idle';
		feedback = '';
		open = true;
	}

	function closePopover() {
		clearSubmission();
		open = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (open && popover && !event.composedPath().includes(popover)) closePopover();
	}

	function submit() {
		if (!open || formState !== 'idle' || !feedback.trim()) return;
		formState = 'loading';
		successTimer = setTimeout(() => (formState = 'success'), 1000);
		closeTimer = setTimeout(closePopover, 2600);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && open) closePopover();
		if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && open) {
			event.preventDefault();
			submit();
		}
	}

	onMount(() => {
		window.addEventListener('click', handleClickOutside, true);
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('click', handleClickOutside, true);
			window.removeEventListener('keydown', handleKeyDown);
			clearSubmission();
		};
	});
</script>

<div class="feedback-wrapper">
	<div {@attach layoutGroup} class="feedback-stage">
		{#if !open}
			<button
				type="button"
				onclick={openPopover}
				class="feedback-button"
				style:border-radius="8px"
				{...layout.props('feedback-shell')}
			>
				<span {...layout.props('feedback-title', { type: 'position' })}>Feedback</span>
			</button>
		{:else}
			<div
				{...layout.props('feedback-shell')}
				class="feedback-popover"
				style:border-radius="12px"
				bind:this={popover}
			>
				<span
					{...layout.props('feedback-title', { type: 'position' })}
					aria-hidden="true"
					class="placeholder"
					data-success={formState === 'success' ? 'true' : 'false'}
					data-feedback={feedback ? 'true' : 'false'}
				>
					Feedback
				</span>
				{#if formState === 'success'}
					<div
						transition:presence={{
							initial: { y: -8, opacity: 0 },
							exit: { opacity: 0, transition: { duration: 0.12 } },
							transition: { type: 'spring', duration: 0.24, bounce: 0 }
						}}
						class="success-wrapper"
						role="status"
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
						<p>Thanks for helping us improve Mercury.</p>
					</div>
				{:else}
					<form
						out:presence={{
							y: 8,
							opacity: 0,
							mode: 'popLayout',
							transition: { duration: 0.16, ease: 'easeOut' }
						}}
						onsubmit={(e) => {
							e.preventDefault();
							submit();
						}}
						class="feedback-form"
					>
						<textarea
							autofocus
							placeholder="Feedback"
							aria-label="Feedback"
							disabled={formState !== 'idle'}
							bind:value={feedback}
							class="textarea"
							required
						></textarea>
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
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.feedback-wrapper {
		position: relative;
		min-height: 216px;
		height: 280px;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.feedback-stage {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.feedback-button,
	.feedback-popover {
		position: relative;
		border: none;
		background-color: #f5f6f7;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.08),
			0px 2px 2px rgba(0, 0, 0, 0.04);
		outline: none;
	}

	.feedback-button {
		position: relative;
		display: flex;
		min-height: 44px;
		align-items: center;
		border-radius: 8px;
		padding: 0 12px;
		font-weight: 500;
	}

	.feedback-button span {
		display: block;
		font-size: 14px;
		color: #63635d;
	}

	.feedback-popover {
		height: 192px;
		width: min(364px, 100%);
		overflow: hidden;
		border-radius: 12px;
		padding: 4px;
	}

	.placeholder {
		position: absolute;
		font-size: 14px;
		color: #63635d;
		left: 16px;
		top: 17px;
		z-index: 10;
	}
	.placeholder[data-feedback='true'],
	.placeholder[data-success='true'] {
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
		background: white;
		outline: none;
	}

	.textarea {
		width: 100%;
		height: 128px;
		resize: none;
		border: none;
		border-radius: 8px 0;
		padding: 12px;
		font-size: 14px;
		outline: none;
	}

	.textarea:focus,
	.textarea:focus-visible {
		outline: none;
		box-shadow: none;
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

	.feedback-footer :global(.blue-button) {
		margin-left: auto !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		border-radius: 6px !important;
		font-weight: 600 !important;
		font-size: 12px !important;
		min-height: 40px !important;
		width: 104px !important;
		overflow: hidden !important;
		background: linear-gradient(180deg, #1994ff 0%, #157cff 100%) !important;
		box-shadow:
			0px 0px 1px 1px rgba(255, 255, 255, 0.08) inset,
			0px 1px 1.5px 0px rgba(0, 0, 0, 0.32),
			0px 0px 0px 0.5px #1a94ff;
		position: relative !important;
	}

	.feedback-footer :global(.blue-button span) {
		display: flex !important;
		width: 100% !important;
		align-items: center !important;
		justify-content: center !important;
		color: white !important;
		text-shadow: 0px 1px 1.5px rgba(0, 0, 0, 0.16) !important;
	}

	.feedback-button:focus-visible {
		outline: 2px solid #2090ff;
		outline-offset: 3px;
	}
</style>
