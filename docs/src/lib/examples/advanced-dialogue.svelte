<script lang="ts">
	import { mercury, layout } from '@omicrxn/mercury';
	import { springValue, spring } from 'motion';
	import { onMount } from 'svelte';
	const { duration, ease } = spring.applyToOptions({
		bounce: 0
	});
	let dialog = $state<HTMLDivElement | null>(null);
	let modal = $state<HTMLDivElement | null>(null);
	let isModalOpened = $state(false);
	let animationConfig = {
		duration: 300,
		easing: ease
	};
	async function openModal() {
		dialog?.showModal();
		isModalOpened = true;
	}
	async function closeModal() {
		isModalOpened = false;
	}
	$effect(() => {
		// Handle click outside
		function checkClickOutside(event, element) {
			const { top, left, width, height } = element.getBoundingClientRect();

			if (
				event.clientX < left ||
				event.clientX > left + width ||
				event.clientY < top ||
				event.clientY > top + height
			) {
				return true;
			}
			return false;
		}

		// Handle escape key
		dialog?.addEventListener('cancel', (event) => {
			event.preventDefault();
			closeModal();
		});
	});
</script>

	<div id="example-container">
		{#if !isModalOpened}
			<button
				{@attach mercury({ whileTap: { scale: 0.9 }, onTapEnd: openModal })}
				{@attach layout({
					layoutId: 'openButton',
					track: () => isModalOpened,
					animation: animationConfig
				})}
				class="openButton"
				data-primary-action><span>Receive</span></button
			>
		{/if}
		{#if isModalOpened}
			<div bind:this={dialog}>
				<div
					bind:this={modal}
					class="modal text-white opacity-0"
					{@attach mercury({ animate: { opacity: 1 } })}
				>
					<div>
						<h2 class="title text-2xl">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#8df0cc"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
								<path d="M12 17h.01" />
							</svg>
							Confirm
						</h2>
						<p>Are you sure you want to receive a load of money?</p>
						<div class="controls">
							<button class="cancel" style="border-radius: 50px"> Cancel </button>
							{#if isModalOpened}
								<button
									class="save"
									style="border-radius: 50px"
									{@attach layout({
										layoutId: 'openButton',
										track: () => isModalOpened,
										animation: animationConfig
									})}
								>
									<span>Receive</span>
								</button>
							{/if}
						</div>
						<button
							{@attach mercury({ whileTap: { scale: 0.9 }, onTapEnd: closeModal })}
							class="closeButton"
							aria-label="Close"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M18 6L6 18"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M6 6L18 18"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>

<style>
	#example-container {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		flex:1;
		width: 100%;
        padding: 20px;
        position: relative;
	}

	#example-container button {
		-webkit-touch-callout: transparent;
		-webkit-user-select: none;
	}

	#example-container button:focus-visible {
		outline-offset: 2px;
		outline: 2px solid #8df0cc;
	}

	#example-container button span {
		display: inline-block;
	}

	.openButton,
	.controls button {
		width: 100%;
		max-width: 300px;
		background-color: #8df0cc;
		color: #0f1115;
		font-size: 16px;
		padding: 10px 20px;
		border-radius: 50px;
		border: none;
		cursor: pointer;
	}

	.controls {
		padding-top: 20px;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
	}

	.controls button.cancel {
		background-color: var(--divider);
		color: #f5f5f5;
	}

	dialog {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		justify-content: center;
		align-items: flex-end;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		overflow: hidden;
	}

	.modal {
		border: 1px solid #1d2628;
		background-color: #0b1011;
		width: 100%;
		max-width: 400px;
		overflow: clip;
		display: flex;
		align-items: flex-start;
		border-radius: 30px;
		position: absolute;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		view-transition-name: modal;
	}

	.modal > div {
		padding: 20px;
		position: relative;
		height: fit-content;
		flex: 1;
	}

	.modal p {
		margin: 0;
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
		position: fixed;
		inset: 0;
		backdrop-filter: blur(3px);
	}

	.title {
		margin: 0 0 20px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.closeButton {
		position: absolute;
		top: 20px;
		right: 20px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: #f5f5f5;
	}

	@keyframes modal-in {
		from {
			transform: translateY(60px);
		}
		to {
			transform: translateY(0px);
		}
	}

	@keyframes modal-out {
		from {
			transform: translateY(0px);
		}
		to {
			transform: translateY(60px);
		}
	}

	::view-transition-group(modal) {
		overflow: clip;
	}

	::view-transition-image-pair(modal) {
		animation: modal-in 300ms cubic-bezier(0, 0.42, 0.34, 0.98);
		animation-fill-mode: both;
	}

	.out::view-transition-image-pair(modal) {
		animation: modal-out 300ms cubic-bezier(0, 0.42, 0.34, 0.98);
	}

	::view-transition-group(button) {
		overflow: clip;
		border-radius: 50px;
		z-index: 2;
	}

	::view-transition-old(button),
	::view-transition-new(button) {
		animation: none;
		mix-blend-mode: normal;
	}

	::view-transition-group(label) {
		z-index: 3;
	}
</style>
