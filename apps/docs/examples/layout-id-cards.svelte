<script lang="ts">
	import { onMount } from 'svelte';
	import { layout, mercury } from '@omicrxn/mercury';
    import { onClickOutside } from 'runed';
	let activeGame = $state<{
		title: string;
		description: string;
		longDescription: string;
		image: string;
	} | null>();
	let GAMES = [
		{
			title: 'The Oddysey',
			description: 'Explore unknown galaxies.',
			longDescription:
				'Throughout their journey, players will encounter diverse alien races, each with their own unique cultures and technologies. Engage in thrilling space combat, negotiate complex diplomatic relations, and make critical decisions that affect the balance of power in the galaxy.',
			image:
				'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/how-i-code-animations/space.png',
			selected: false
		},
		{
			title: 'Angry Rabbits',
			description: 'They are coming for you.',
			longDescription:
				'The rabbits are angry and they are coming for you. You have to defend yourself with your carrot gun. The game is not simple, you have to be fast and accurate to survive.',
			image:
				'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/how-i-code-animations/rabbit.png',
			selected: false
		},
		{
			title: 'Ghost town',
			description: 'Find the ghosts.',
			longDescription:
				'You are in a ghost town and you have to find the ghosts. But be careful, they are dangerous.',
			image:
				'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/how-i-code-animations/ghost.webp',
			selected: false
		},
		{
			title: 'Pirates in the jungle',
			description: 'Find the treasure.',
			longDescription:
				'You are a pirate and you have to find the treasure in the jungle. But be careful, there are traps and wild animals.',
			image:
				'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/how-i-code-animations/pirate.png',
			selected: false
		},

		{
			title: 'Lost in the mountains',
			description: 'Find your way home.',
			longDescription:
				'You are lost in the mountains and you have to find your way home. But be careful, there are dangerous animals and you can get lost.',
			image:
				'https://animations-on-the-web-git-how-i-use-3066e1-emilkowalski-s-team.vercel.app/how-i-use-framer-motion/how-i-code-animations/boy.webp',
			selected: false
		}
	];
	function onKeyDown(event) {
		if (event.key === 'Escape') {
			activeGame = null;
		}
	}
	let modal = $state<HTMLElement>()!
	onClickOutside(()=>modal, ()=>activeGame = null)
	onMount(() => {
		window.addEventListener('keydown', onKeyDown);

		return () => window.removeEventListener('keydown', onKeyDown);
	});
	const layoutGroup = layout(() => activeGame, { transition: { duration: 0.4 } });
</script>

<div {@attach layoutGroup} class="flex-1 flex flex-col w-full overflow-hidden">
{#if activeGame}
	<div  class="overlay" />
	<div  class="active-game">
		<div
		bind:this={modal}
			{...layout.props(`card-${activeGame.title}`)}
			class="inner"
			style="border-radius: 12px"
		>
			<div class="header">
				<img
					{...layout.props(`image-${activeGame.title}`)}
					height={56}
					width={56}
					alt="Game"
					src={activeGame.image}
					style="border-radius: 12px"
				/>
				<div class="header-inner">
					<div class="content-wrapper">
						<h2
							{...layout.props(`title-${activeGame.title}`)}
							class="game-title"
						>
							{activeGame.title}
						</h2>
						<p
							{...layout.props(`description-${activeGame.title}`)}
							class="game-description"
						>
							{activeGame.description}
						</p>
					</div>
					<button
						{...layout.props(`button-${activeGame.title}`)}
						class="button">Get</button
					>
				</div>
			</div>
			<p
				{@attach mercury({
					animate: {
						opacity: 1
					},
					transition: {
						duration: 0.1,
						delay: 0.3
					}
				})}
				{...layout.props()}
				class="long-description"
			>
				{activeGame.longDescription}
			</p>
		</div>
	</div>
{/if}

<ul class="list @container">
	{#each GAMES as game (game.title)}
		{#if activeGame?.title !== game.title}
			{#key game.title}
				<li
					{...layout.props(`card-${game.title}`)}
					onclick={() => (activeGame = game)}
					style="border-radius: 8px;"
				>
					<img
						{...layout.props(`image-${game.title}`)}
						height={56}
						width={56}
						alt="Game"
						src={game.image}
						style="border-radius: 12px;"
					/>
					<div class="game-wrapper">
						<div class="content-wrapper">
							<h2
								{...layout.props(`title-${game.title}`)}
								class="game-title"
							>
								{game.title}
							</h2>
							<p
								{...layout.props(`description-${game.title}`)}
								class="game-description truncate"
							>
								{game.description}
							</p>
						</div>
						<button
							{...layout.props(`button-${game.title}`)}
							class="button">Get</button
						>
					</div>
				</li>
			{/key}
		{/if}
	{/each}
</ul>
</div>

<style>
	.list {
		position: relative;
		display: flex;
		width: 100%;
		flex-direction: column;
		align-items: center;
		padding: 0;
	}

	.list li {
		display: flex;
		max-width: 386px;
		width: 100%;
		cursor: pointer;
		align-items: center;
		gap: 16px;
		padding: 0;
	}

	.game-wrapper {
		display: flex;
		flex-grow: 1;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid #d4d6d861;
	}

	.list li:last-of-type .game-wrapper {
		border: none;
	}

	.content-wrapper {
		display: flex;
		flex-direction: column;
		padding: 16px 0;
	}

	.active-game .content-wrapper {
		padding: 0;
	}

	.game-title {
		font-size: 14px;
		font-weight: 500;
	}

	.game-description {
		font-size: 14px;
		color: #63635d;
	}

	.button {
		border-radius: 9999px;
		background: #f1f0ef;
		padding: 4px 12px;
		font-size: 12px;
		font-weight: 600;
		color: #007aff;
	}

	.active-game {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: 10;
	}

	.active-game .inner {
		display: flex;
		height: fit-content;
		width: 500px;
		cursor: pointer;
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
		overflow: hidden;
		background: var(--theme-color-background);
		padding: 16px;
	}

	.header {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 16px;
	}

	.header-inner {
		display: flex;
		flex-grow: 1;
		align-items: center;
		justify-content: space-between;
	}

	.long-description {
		font-size: 14px;
		color: #63635d;
		opacity: 0;
	}

	.overlay {
		pointer-events: none;
		position: absolute;
		inset: 0;
		z-index: 10;
		background: rgba(0, 0, 0, 0.2);
	}

	body {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
</style>
