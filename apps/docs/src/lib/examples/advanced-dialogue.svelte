<script lang="ts">
	import { mercury, layout } from '@omicrxn/mercury';
	import { spring } from 'motion';
	import { onClickOutside } from 'runed';

	const { ease } = spring.applyToOptions({ bounce: 0 });

	let modal = $state<HTMLDivElement | null>(null);
	let isModalOpened = $state(false);

	const layoutGroup = layout(() => isModalOpened, {
		transition: { duration: 0.3, ease }
	});

	function openModal() {
		isModalOpened = true;
	}

	function closeModal() {
		isModalOpened = false;
	}

	onClickOutside(
		() => modal,
		() => closeModal()
	);

	$effect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') closeModal();
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div id="example-container" {@attach layoutGroup}>
	{#if !isModalOpened}
		<button
			{@attach mercury({ whileTap: { scale: 0.9 }, onTapEnd: openModal })}
			{...layout.props('openButton')}
			class="openButton bg-indigo-200 dark:bg-indigo-400"
		>
			<span>Receive</span>
		</button>
	{:else}
		<div class="backdrop" {@attach mercury({ animate: { opacity: 1 } })}></div>
		<div
			bind:this={modal}
			class="modal text-white opacity-0"
			{@attach mercury({ animate: { opacity: 1 } })}
		>
			<div>
				<h2 class="title text-2xl">
					<svg
						class="stroke-indigo-200 dark:stroke-indigo-400"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
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
						class="save bg-indigo-200 dark:bg-indigo-400"
						style="border-radius: 50px"
						{...layout.props('openButton')}
					>
						<span>Receive</span>
					</button>
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
	{/if}
</div>

<style>
	#example-container {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		flex: 1;
		width: 100%;
		padding: 20px;
		position: relative;
		overflow: hidden;
	}

	#example-container button {
		-webkit-touch-callout: transparent;
		-webkit-user-select: none;
		user-select: none;
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

	.backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(3px);
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
		position: relative;
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
		top: 20px;
		right: 20px;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: #f5f5f5;
	}
</style>
