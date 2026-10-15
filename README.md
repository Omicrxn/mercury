# Mercury

Mercury is an animation library designed specifically for Svelte 5, created to bring powerful, expressive motion into modern Svelte applications—without adding unnecessary complexity or breaking away from Svelte's core principles.

Many existing animation solutions for Svelte either offer limited functionality, are deprecated, or introduce awkward abstractions. Libraries like Framer Motion set a high bar for motion design in React, but adapting those patterns to Svelte often results in unexpected behavior and bloated code.

Mercury was built to solve this gap.

## Purpose

Mercury aims to bring layout-aware, fine-grained animations to Svelte in a way that feels native. It focuses on:

- **Attachment-based control** – Animations are declared using Svelte attachments, allowing direct manipulation of DOM elements without extra components or wrappers.
- **Shared layout transitions** – Mercury enables elements to animate seamlessly across layouts using `layoutId`s, making complex interactions feel effortless.
- **Presence animations** – Full support for presence animations brings component mount/unmount animations similar to what Framer Motion offers, but in a Svelte-native way.
- **Minimal friction** – The API is designed to be declarative, composable, and minimal. It scales from simple transitions to advanced UI flows without boilerplate.
- **Powered by Motion** – Mercury runs [Motion](https://motion.dev/)'s own engine and takes Motion's props — `initial`, `animate`, `exit`, variants, `while*` gestures, drag, layout — so Motion's documentation applies. You can use Motion's utilities, motion values, and [easing functions](https://motion.dev/docs/easing-functions) seamlessly alongside Mercury.

## Philosophy

The core philosophy behind Mercury is to enable expressive animation without compromising the clarity or structure of Svelte code. It builds upon Svelte's strengths rather than abstracting them away, offering a motion system that is:

- **Predictable** – Built on motion values, transitions, and layout projections that behave consistently.
- **Flexible** – Easily integrated into existing components and layouts.
- **Performant** – Lightweight and optimized for UI responsiveness.
- **Made the Svelte Way** – Mercury is built with Svelte's philosophy at its core. Instead of mimicking patterns from other frameworks, it embraces Svelte's strengths—reactivity, attachments, and transitions—without forcing external abstractions or workarounds that don't apply in the Svelte ecosystem.

Mercury makes advanced animations accessible to Svelte developers—without introducing unnecessary overhead or breaking the mental model of how Svelte works.

## Documentation

- [Docs](https://mercury.uialchemy.com/docs)
- [Coming from Motion](https://mercury.uialchemy.com/docs/api/coming-from-motion)
- [Examples](https://mercury.uialchemy.com/docs/examples)

## Installation

```bash
npm install @omicrxn/mercury motion
# or
pnpm add @omicrxn/mercury motion
# or
yarn add @omicrxn/mercury motion
```

## Usage

```svelte
<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div
	class="h-16 w-16 rounded-md bg-blue-300"
	{@attach mercury({
		initial: { opacity: 0 },
		animate: { opacity: 1, scale: 1.5 },
		whileHover: { scale: 1.6 },
		transition: { ease: 'circInOut', duration: 1 }
	})}
></div>
```

## Acknowledgments

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/) and [Motion](https://motion.dev/), and to [@Char2sGu](https://github.com/Char2sGu) for helping integrate layout projections into the library.

## License

MIT
