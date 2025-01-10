# Mercury

**Mercury**  is a Svelte animation library offering a declarative syntax for popular JavaScript animation tools like AnimeJS, Motion, and (soon) GSAP. Unlike other libraries, Mercury avoids custom components, using Svelte actions for native element animations.  It’s engine-agnostic, allowing developers to choose their preferred animation library without compromising functionality.  Mercury allows for seamless integration with existing Svelte features like transitions, actions, and motion, while eliminating the need for wrapper components. It also introduces layout animations and exit animations inspired by Framer Motion, all while keeping a clean and svelte-friendly syntax.

# Documentation
See in-depth documentation and examples at this [site](https://uialchemy.com/mercury/about-mercury)

# Working Demo / Examples
Check some [examples](https://uialchemy.com/mercury/examples) of how to use **Mercury**

## Features

- Choose your sauce: You can opt in to your preferred animation library such as Motion, AnimeJS or GSAP. Feel free to submit new cores for **Mercury** through issues.
- Supports **layout animations**
- Allows **exit animations**
- Simple, expressive Svelte syntax using `use:mercury`
- No wrapper components, all animations applied directly to DOM elements
- Works with all Svelte features for the DOM like transitions, actions, and motion, which also allows for direct binding to the element
- Event animations like `whileHover`, `whileClick`, etc.

## Installation

```bash
npm install @omicrxn/mercury
```
```bash
pnpm install @omicrxn/mercury
```
```bash
yarn install @omicrxn/mercury
```

## Usage

```svelte
<script lang="ts">
		import { mercury } from '@omicrxn/mercury';
</script>

<div class="h-16 w-16 rounded-md bg-blue-300"
use:mercury={{
	initial: { scale: 0.5 },
	animate: { scale: 1.5 },
	transition: { ease: 'circInOut', duration: 1 }
}}
></div>
```

## Acknowledgments
Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/), [Anime.js](https://github.com/juliangarnier/anime/), [Motion](https://motion.dev/) and [GSAP](https://gsap.com/) and special thanks to [@Char2sGu](https://github.com/Char2sGu) for helping me integrate layout projections into the library.


## License

MIT License
