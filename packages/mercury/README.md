# Mercury

**Mercury** is a Svelte 5 animation library powered by [Motion](https://motion.dev/). It brings Framer Motion–style ergonomics to Svelte using **attachments** and **transitions** — no wrapper components required.

Animate elements directly, coordinate enter/exit with `presence`, handle layout changes with shared-element transitions, and add gesture-driven interactions.

## Documentation

- [Introduction](https://mercury.uialchemy.com/docs)
- [Getting Started](https://mercury.uialchemy.com/docs/getting-started)
- [Examples](https://mercury.uialchemy.com/examples)

## Mental model

**Your CSS is the resting state, `animate` is state-driven animation, and `presence` handles mounting and unmounting.**

| motion/react | Mercury |
| --- | --- |
| `animate={{ ... }}` (state-driven) | `{@attach mercury({ animate })}` |
| `animate={{ ... }}` (static) | the element's CSS |
| `initial` / `exit` | `initial` / `exit` on `transition:presence` |
| `<AnimatePresence>` | not needed — Svelte transitions track unmounts natively |
| `layout` / `layoutId` | `layout()` + `layout.props(id?)` |

## Features

- **Attachment-based API** — `{@attach mercury(...)}` applies animations directly to DOM elements
- **Presence animations** — enter/exit with `transition:presence` (`initial`, `exit`, `mode`)
- **Layout animations** — FLIP transitions and shared `layoutId`-style morphs via `layout()` + `layout.props()`
- **Gestures** — `whileHover`, `whileTap`, drag, and scroll-triggered animations
- **Powered by Motion** — full [easing](https://motion.dev/docs/easing-functions), springs, keyframes, callbacks, and playback controls
- Works alongside Svelte transitions, actions, and other DOM features

## Requirements

- Svelte 5+

## Installation

```bash
npm install @omicrxn/mercury
# or
pnpm add @omicrxn/mercury
# or
yarn add @omicrxn/mercury
```

## Usage

### Basic animation

```svelte
<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div
	class="h-16 w-16 rounded-md bg-blue-300"
	{@attach mercury({
		animate: { scale: 1.5 },
		transition: { ease: 'circInOut', duration: 1 }
	})}
></div>
```

Because attachments re-run when their reactive dependencies change, derive `animate` from `$state` and Mercury animates on every change.

### Enter / exit animations

```svelte
<script lang="ts">
	let show = $state(true);
</script>

{#if show}
	<div
		class="card"
		transition:presence={{
			initial: { opacity: 0, y: 25 },
			exit: { opacity: 0, y: 25 },
			transition: { duration: 0.3 }
		}}
	>
		Hello
	</div>
{/if}
```

For simple cases, use the flat form: `transition:presence={{ opacity: 0, y: 25 }}`.

### Layout animations

```svelte
<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let justify = $state('start');
	const layoutGroup = layout(() => justify, { transition: { duration: 0.4 } });
</script>

<div {@attach layoutGroup} style="justify-content: {justify};">
	<div {...layout.props()} class="h-16 w-16 rounded-md bg-blue-300" />
</div>
```

Pass an id to `layout.props('id')` on two different elements to morph between them (Motion's `layoutId`).

### Gestures

```svelte
<div
	{@attach mercury({
		whileHover: { scale: 1.1, transition: { type: 'spring', stiffness: 150 } },
		whileTap: { scale: 0.95 }
	})}
></div>
```

Also supports `drag`, `dragOptions`, and scroll-triggered `scroll.enter` / `scroll.exit`. See the [gestures docs](https://mercury.uialchemy.com/docs/api/gestures).

## API

| Export | Description |
| --- | --- |
| `mercury` | Attachment for `animate`, gestures, callbacks, and playback controls |
| `layout` | Attachment for layout groups; use `layout.props(id?)` on children |
| `presence` | Svelte transition for enter/exit animations |
| `AnimationInstance` | Imperative playback handle from the `instance` callback |

| Docs | Topics |
| --- | --- |
| [Animate](https://mercury.uialchemy.com/docs/api/animate) | `animate`, `animateOnMount`, transitions, springs, keyframes, callbacks |
| [Presence](https://mercury.uialchemy.com/docs/api/presence) | `initial`, `exit`, `mode`, `\|global` modifier |
| [Layout](https://mercury.uialchemy.com/docs/api/layout-animations) | FLIP layout, shared layout ids |
| [Gestures](https://mercury.uialchemy.com/docs/api/gestures) | hover, tap, drag, scroll |

## Acknowledgments

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/), [Motion](https://motion.dev/), and [Anime.js](https://github.com/juliangarnier/anime/), and to [@Char2sGu](https://github.com/Char2sGu) for helping integrate layout projections into the library.

## License

MIT
