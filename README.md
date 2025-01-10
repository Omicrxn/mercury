# Mercury

**Mercury** is a powerful Svelte animation library built on top of AnimeJS, offering an intuitive, streamlined way to animate DOM elements directly using Svelte actions. Mercury allows for seamless integration with existing Svelte features like transitions, actions, and motion, while eliminating the need for wrapper components. It also introduces layout animations and exit animations inspired by Framer Motion, all while keeping a clean and svelte-friendly syntax.

# Documentation
See in-depth documentation and examples at this [site](https://uialchemy.com/mercury/about-mercury)

## Features

- Leverages **AnimeJS** for powerful animations
- Supports **layout animations**
- Provides **exit animations**
- Simple, expressive Svelte syntax using `use:mercury`
- No wrapper components, all animations applied directly to DOM elements
- Works with all Svelte features for the DOM like transitions, actions, and motion, which also allows for direct binding to the element

## Installation

```bash
npm install @omicrxn/mercury
```

## Usage

```svelte
<script>
	import { mercury,useExit } from '@omicrxn/mercury';
	let show = true;
</script>

<button on:click={() => (show = !show)}>Toggle Show</button>

{#if show}
	<div
		class="w-24 h-24 rounded-lg bg-blue-400 border border-blue-600"
		use:mercury={{
			opacity: 1,
			scale: [1, 2, 2, 1, 1],
			rotate: [0, 0, 180, 180, 0],
			borderRadius: ['8%', '8%', '50%', '50%', '8%'],
			duration: 3,
			ease: 'inOutSine',
			delay: 0.5,
			loop: true
		}}
		out:useExit={{
			opacity: 0,
			scale: 0,
			duration: 1
		}}
	></div>
{/if}
```

## API

### `use:mercury`

The primary action for applying animations to DOM elements. It accepts an object with animation parameters, similar to **AnimeJS**.

Example Parameters:

- `opacity`: The opacity of the element
- `scale`: A series of values to scale the element
- `rotate`: Rotate the element around the Z-axis
- `borderRadius`: A series of values to animate the border-radius
- `duration`: The length of the animation in seconds
- `ease`: The easing function for the animation
- `delay`: The delay before the animation starts
- `loop`: Specifies if the animation should loop

### `out:useExit`

Action for defining exit animations when the element is removed from the DOM.

Example Parameters:

- `opacity`: The opacity change during exit
- `scale`: The scale during exit
- `duration`: The duration of the exit animation

## Acknowledgments
Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/), [Anime.js](https://github.com/juliangarnier/anime/), and special thanks to [@Char2sGu](https://github.com/Char2sGu) for helping me integrate layout projections into the library.


## License

MIT License
