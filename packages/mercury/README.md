# Mercury

**Mercury** is a Svelte 5 animation library powered by [Motion](https://motion.dev/). It brings Framer Motion–style ergonomics to Svelte using **attachments** and **transitions** — no wrapper components required.

Animate elements directly, coordinate enter/exit with `presence`, and handle layout changes with shared-element transitions.

## Documentation

- [Docs](https://mercury.uialchemy.com/docs)
- [Examples](https://mercury.uialchemy.com/examples)

## Features

- Powered by **Motion**, including its full [easing function](https://motion.dev/docs/easing-functions) set
- **Layout animations** with shared `layoutId` transitions (via Anime.js)
- **Presence animations** for mount/unmount with `in:presence` / `out:presence`
- **Gestures** — `whileHover`, `whileTap`, drag, and scroll-triggered animations
- **Attachment-based API** — `{@attach mercury(...)}` applies animations directly to DOM elements
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

### Exit animations

```svelte
<script lang="ts">
	import { mercury, presence } from '@omicrxn/mercury';

	let show = $state(true);
</script>

{#if show}
	<div
		class="opacity-0"
		{@attach mercury({ animate: { opacity: 1 } })}
		out:presence={{ opacity: 0, y: 25, transition: { duration: 0.3 } }}
	>
		Hello
	</div>
{/if}
```

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

## API

| Export     | Description                                     |
| ---------- | ----------------------------------------------- |
| `mercury`  | Attachment for animate + gesture interactions   |
| `layout`   | Attachment for layout groups + `layout.props()` |
| `presence` | Svelte transition for enter/exit animations     |

See the [API docs](https://mercury.uialchemy.com/docs) for full details.

## Acknowledgments

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/), [Motion](https://motion.dev/), and [Anime.js](https://github.com/juliangarnier/anime/), and to [@Char2sGu](https://github.com/Char2sGu) for helping integrate layout projections into the library.

## License

MIT
