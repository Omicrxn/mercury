<script lang="ts">
	import { mercury, layout, presence } from '@omicrxn/mercury';

	let modal = $state<HTMLDivElement | null>(null);
	let isModalOpened = $state(false);

	const layoutGroup = layout(() => isModalOpened, {
		transition: { type: 'spring', duration: 0.3, bounce: 0 }
	});

	function openModal() {
		isModalOpened = true;
	}

	function closeModal() {
		isModalOpened = false;
	}

	function handleWindowClick(event: MouseEvent) {
		if (
			modal &&
			event.target instanceof Node &&
			event.target.isConnected &&
			!modal.contains(event.target)
		) {
			closeModal();
		}
	}
</script>

<svelte:window
	onclick={handleWindowClick}
	onkeydown={(event) => {
		if (event.key === 'Escape') closeModal();
	}}
/>

<div id="sandbox">
	<div id="example-container" {@attach layoutGroup}>
		{#if !isModalOpened}
			<button
				{...layout.props('drawer-receive')}
				{@attach mercury({
					whileHover: {
						scale: 1.02,
						transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
					},
					whileTap: { scale: 0.97, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } }
				})}
				onclick={openModal}
				class="openButton"
				data-primary-action
				><span {...layout.props('drawer-label', { type: 'position' })}>Receive</span></button
			>
		{:else}
			<div
				class="backdrop"
				transition:presence={{
					initial: { opacity: 0 },
					exit: { opacity: 0, transition: { duration: 0.14 } },
					transition: { duration: 0.18, ease: 'easeOut' }
				}}
			></div>
			<div
				bind:this={modal}
				class="modal text-white"
				role="dialog"
				aria-label="Confirm receipt"
				tabindex="-1"
				transition:presence={{
					initial: { opacity: 0, y: 8 },
					exit: { opacity: 0, y: 8, transition: { duration: 0.16, ease: 'easeOut' } },
					transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] }
				}}
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
						<button class="cancel" style="border-radius: 50px" onclick={closeModal}>
							Cancel
						</button>
						<button
							onclick={closeModal}
							class="save"
							style="border-radius: 50px"
							{...layout.props('drawer-receive')}
						>
							<span {...layout.props('drawer-label', { type: 'position' })}>Receive</span>
						</button>
					</div>
					<button
						{@attach mercury({
							whileHover: {
								scale: 1.02,
								transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
							},
							whileTap: {
								scale: 0.97,
								transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
							}
						})}
						onclick={closeModal}
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
		{/if}
	</div>
</div>

<style>
	#sandbox {
		width: 100%;
		max-width: 640px;
	}
	#example-container {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		padding: 20px;
		overflow: hidden;
		position: relative;
		min-height: 340px;
		width: 100%;
		isolation: isolate;
	}

	#sandbox button {
		-webkit-touch-callout: transparent;
		-webkit-user-select: none;
		user-select: none;
	}

	#sandbox button:focus-visible {
		outline-offset: 2px;
		outline: 2px solid #8df0cc;
	}

	#sandbox button span {
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

	.controls button {
		padding: 10px 12px;
		white-space: nowrap;
	}

	.controls button.cancel {
		background-color: var(--divider);
		color: #f5f5f5;
	}

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(3px);
	}

	.modal {
		position: absolute;
		bottom: 20px;
		border: 1px solid #1d2628;
		background-color: #0b1011;
		width: 100%;
		max-width: min(400px, calc(100% - 40px));
		overflow: clip;
		display: flex;
		align-items: flex-start;
		border-radius: 30px;
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

	.title {
		margin: 0 0 20px;
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.closeButton {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: #f5f5f5;
	}
</style>
