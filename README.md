# Mercury

Mercury is an animation library designed specifically for Svelte, created to bring powerful, expressive motion into modern Svelte applications—without adding unnecessary complexity or breaking away from Svelte’s core principles.

Many existing animation solutions for Svelte either offer limited functionality, are deprecated or introduce awkward abstractions. Libraries like Framer Motion set a high bar for motion design in React, but adapting those patterns to Svelte often results in unexpected results and bloated code.

Mercury was built to solve this gap.

## Purpose

Mercury aims to bring layout-aware, fine-grained animations to Svelte in a way that feels native. It focuses on:

- **Attachment-based control** – Animations are declared using Svelte attachments, allowing direct manipulation of DOM elements without extra components or wrappers.
- **Shared layout transitions** – Mercury enables elements to animate seamlessly across layouts using `layoutId`s, making complex interactions feel effortless.
- **Presence animations** – Full support for presence animations brings component mount/unmount animations similar to what Framer Motion offers, but in a Svelte-native way.
- **Minimal friction** – The API is designed to be declarative, composable, and minimal. It scales from simple transitions to advanced UI flows without boilerplate.
- **Compatibility** - Mercury is engine-agnostic. Whether you prefer AnimeJS, Motion, or GSAP, Mercury lets you plug in your preferred animation engine while handling the coordination logic. This means you can continue using utilities, motion values, and other features from those libraries seamlessly alongside Mercury.

## Philosophy

The core philosophy behind Mercury is to enable expressive animation without compromising the clarity or structure of Svelte code. It builds upon Svelte’s strengths rather than abstracting them away, offering a motion system that is:

- **Predictable** – Built on motion values, transitions, and layout projections that behave consistently.
- **Flexible** – Easily integrated into existing components and layouts.
- **Performant** – Lightweight and optimized for UI responsiveness.
- **Made the Svelte Way** - Mercury is built with Svelte’s philosophy at its core. Instead of mimicking patterns from other frameworks, it embraces Svelte’s strengths—reactivity, attachments, and transitions—without forcing external abstractions or workarounds that don't apply in the Svelte ecosystem.

Mercury makes advanced animations accessible to Svelte developers—without introducing unnecessary overhead or breaking the mental model of how Svelte works.


# Documentation

See in-depth documentation and examples at this [site](https://mercury.uialchemy.com/docs)

# Working Demo / Examples

Check some [examples](https://mercury.uialchemy.com/examples) of how to use **Mercury**


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


## Acknowledgments

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/), [Anime.js](https://github.com/juliangarnier/anime/), [Motion](https://motion.dev/) and [GSAP](https://gsap.com/) and special thanks to [@Char2sGu](https://github.com/Char2sGu) for helping me integrate layout projections into the library.

## License

MIT License
