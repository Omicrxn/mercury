<script lang="ts">
	import { tick } from 'svelte';
	import { layout, mercury, presence } from '@omicrxn/mercury';
	import orbit from './assets/orbit.svg?url';
	import rabbit from './assets/rabbit.svg?url';
	import ghost from './assets/ghost.svg?url';
	import island from './assets/island.svg?url';
	import summit from './assets/summit.svg?url';

	const id = $props.id();
	const games = [
		{
			id: 'orbit',
			title: 'The Odyssey',
			description: 'Explore unknown galaxies.',
			image: orbit,
			story:
				'Chart a course through distant star systems. Meet curious travelers, discover forgotten planets, and find your way back to Earth.'
		},
		{
			id: 'rabbit',
			title: 'Angry Rabbits',
			description: 'A garden worth defending.',
			image: rabbit,
			story:
				'Keep a crew of hungry rabbits out of your garden. Build clever defenses, collect carrots, and make it through the harvest.'
		},
		{
			id: 'ghost',
			title: 'Ghost Town',
			description: 'Follow the lanterns.',
			image: ghost,
			story:
				'Explore quiet streets after sunset. Solve the puzzles left by the town’s residents and help a few friendly ghosts get home.'
		},
		{
			id: 'island',
			title: 'Hidden Island',
			description: 'Find the lost treasure.',
			image: island,
			story:
				'Sail to a tiny island with a very big secret. Follow an old map through palm groves, hidden coves, and forgotten ruins.'
		},
		{
			id: 'summit',
			title: 'The Long Way Home',
			description: 'One trail at a time.',
			image: summit,
			story:
				'Pack your bag and head into the mountains. Discover quiet trails, shelter from passing storms, and find your way across the summit.'
		}
	];
	let activeGame = $state<(typeof games)[number] | null>(null);
	let closeButton = $state<HTMLButtonElement>();
	let list = $state<HTMLUListElement>();

	const sharedId = (part: string, gameId: string) => `${id}-${part}-${gameId}`;
	const layoutGroup = layout(() => activeGame, {
		transition: { type: 'spring', duration: 0.32, bounce: 0 }
	});

	async function openGame(game: (typeof games)[number]) {
		activeGame = game;
		await tick();
		if (activeGame?.id === game.id) closeButton?.focus({ preventScroll: true });
	}

	async function closeGame() {
		const previous = activeGame;
		activeGame = null;
		await tick();
		if (previous && !activeGame) {
			list
				?.querySelector<HTMLButtonElement>(`[data-game="${previous.id}"]`)
				?.focus({ preventScroll: true });
		}
	}

	function onKeyDown(event: KeyboardEvent) {
		if (!activeGame) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			void closeGame();
		}
		if (event.key === 'Tab') {
			event.preventDefault();
			closeButton?.focus();
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<div {@attach layoutGroup} class="cards-demo">
	<ul class="game-list" bind:this={list} inert={activeGame !== null}>
		{#each games as game (game.id)}
			<li>
				{#if activeGame?.id !== game.id}
					<button
						type="button"
						class="game-card"
						data-game={game.id}
						aria-label={`View ${game.title}`}
						aria-haspopup="dialog"
						onclick={() => openGame(game)}
						{...layout.props(sharedId('card', game.id))}
					>
						<img
							{...layout.props(sharedId('image', game.id))}
							src={game.image}
							width="56"
							height="56"
							alt=""
						/>
						<span class="game-copy">
							<span
								{...layout.props(sharedId('title', game.id), { type: 'position' })}
								class="game-title">{game.title}</span
							>
							<span
								{...layout.props(sharedId('description', game.id), { type: 'position' })}
								class="game-description">{game.description}</span
							>
						</span>
						<span class="view-label" aria-hidden="true">View</span>
					</button>
				{/if}
			</li>
		{/each}
	</ul>

	{#if activeGame}
		<button
			type="button"
			class="backdrop"
			aria-label="Close game details"
			tabindex="-1"
			onclick={closeGame}
			transition:presence={{
				initial: { opacity: 0, transition: { duration: 0.18 } },
				exit: { opacity: 0, transition: { duration: 0.14 } }
			}}
		></button>
		<div class="detail-position">
			<div
				{...layout.props(sharedId('card', activeGame.id))}
				class="game-detail"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${id}-title`}
				aria-describedby={`${id}-story`}
				tabindex="-1"
			>
				<div class="detail-header">
					<img
						{...layout.props(sharedId('image', activeGame.id))}
						src={activeGame.image}
						width="80"
						height="80"
						alt=""
					/>
					<div class="game-copy">
						<h2
							id={`${id}-title`}
							{...layout.props(sharedId('title', activeGame.id), { type: 'position' })}
							class="game-title"
						>
							{activeGame.title}
						</h2>
						<p
							{...layout.props(sharedId('description', activeGame.id), { type: 'position' })}
							class="game-description"
						>
							{activeGame.description}
						</p>
					</div>
				</div>
				<div {...layout.props({ type: 'position' })}>
					<div
						class="detail-body"
						style="opacity: 0"
						{@attach mercury({
							animate: { opacity: 1 },
							transition: { duration: 0.18, delay: 0.12, ease: 'easeOut' }
						})}
						out:presence|global={{ opacity: 0, transition: { duration: 0.1 } }}
					>
						<p id={`${id}-story`} class="story">
							{activeGame.story}
						</p>
						<button bind:this={closeButton} type="button" class="close-button" onclick={closeGame}
							>Back to games</button
						>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Theme tokens for the cards; the dark set mirrors the light one. */
	.cards-demo {
		--cards-text: #1e293b;
		--cards-muted: #64748b;
		--cards-story: #475569;
		--cards-surface: #f8fafc;
		--cards-surface-hover: #eef2ff;
		--cards-border: #e2e8f0;
		--cards-backdrop: rgb(15 23 42 / 24%);
		--cards-accent: #4f46e5;
		--cards-accent-hover: #4338ca;
		--cards-link: #4f46e5;
		--cards-focus: #6366f1;
	}

	:global([data-theme='dark']) .cards-demo {
		--cards-text: #f1f5f9;
		--cards-muted: #94a3b8;
		--cards-story: #cbd5e1;
		--cards-surface: #171717;
		--cards-surface-hover: #1e1b4b;
		--cards-border: #2a2a2a;
		--cards-backdrop: rgb(0 0 0 / 55%);
		--cards-accent: #6366f1;
		--cards-accent-hover: #818cf8;
		--cards-link: #a5b4fc;
		--cards-focus: #818cf8;
	}

	.cards-demo {
		position: relative;
		isolation: isolate;
		width: 100%;
		max-width: 520px;
		margin: auto;
		color: var(--cards-text);
	}
	.game-list {
		display: grid;
		gap: 4px;
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.game-list li {
		height: 80px;
	}
	.game-card {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		height: 80px;
		padding: 12px;
		border: 1px solid var(--cards-border);
		border-radius: 14px;
		background: var(--cards-surface);
		text-align: left;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	img {
		display: block;
		flex-shrink: 0;
		border-radius: 12px;
		object-fit: cover;
	}
	.game-copy {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 4px;
	}
	.game-title {
		display: block;
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
	}
	.game-description {
		display: block;
		margin: 0;
		font-size: 12px;
		color: var(--cards-muted);
		line-height: 1.4;
	}
	.game-card .game-title,
	.game-card .game-description {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.view-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--cards-link);
	}
	.backdrop {
		position: absolute;
		inset: -12px;
		z-index: 1;
		border: 0;
		border-radius: 20px;
		background: var(--cards-backdrop);
		cursor: pointer;
	}
	.detail-position {
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		transform: translateY(-50%);
		z-index: 2;
		pointer-events: none;
	}
	.game-detail {
		overflow: hidden;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid var(--cards-border);
		border-radius: 20px;
		padding: 20px;
		background: var(--cards-surface);
		pointer-events: auto;
	}
	.detail-header {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.story {
		margin: 20px 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--cards-story);
	}
	.close-button {
		min-height: 44px;
		padding: 0 16px;
		border: 0;
		border-radius: 10px;
		color: #fff;
		background: var(--cards-accent);
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	button:focus-visible {
		outline: 2px solid var(--cards-focus);
		outline-offset: 3px;
	}
	@media (hover: hover) and (pointer: fine) {
		.game-card:hover {
			background: var(--cards-surface-hover);
		}
		.close-button:hover {
			background: var(--cards-accent-hover);
		}
	}
	@media (max-width: 420px) {
		.view-label {
			display: none;
		}
		.game-card {
			gap: 8px;
			padding: 10px;
		}
		.game-detail {
			padding: 16px;
		}
		.detail-header {
			gap: 10px;
		}
		.detail-header img {
			width: 56px;
			height: 56px;
		}
	}
</style>
