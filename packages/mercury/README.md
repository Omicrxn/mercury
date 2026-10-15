# Mercury

**Mercury** is [Motion](https://motion.dev/) for Svelte 5. It runs Motion's own engine — its animation state, variants, gestures, drag and layout projection — behind Svelte **attachments** and **transitions**, so Motion's props work in Svelte with no wrapper components.

## Documentation

- [Introduction](https://mercury.uialchemy.com/docs)
- [Getting Started](https://mercury.uialchemy.com/docs/getting-started)
- [Coming from Motion](https://mercury.uialchemy.com/docs/api/coming-from-motion)
- [Examples](https://mercury.uialchemy.com/docs/examples)

## Mental model

| motion/react | Mercury |
| --- | --- |
| `<motion.div initial animate exit whileHover drag …>` | `<div {@attach mercury({ initial, animate, exit, whileHover, drag, … })}>` |
| `<AnimatePresence>` | `transition:presence` on the element |
| `layout` / `layoutId` | `mercury({ layout, layoutId })` or `layout.props(id?)`, in a `layout(trigger)` group |
| `<MotionConfig>` | `{@attach motionConfig({ … })}` |
| `useScroll()` | `scrollValues()` |
| `useDragControls()` | `createDragControls()` |

## Features

- **Motion's props** — `initial`, `animate`, `exit`, `transition` (springs, keyframes, per-value transitions), `transitionEnd`
- **Variants** — named states that propagate to children, with `staggerChildren`, `delayChildren` and `when`
- **Gestures** — `whileHover`, `whileTap`, `whileFocus`, `whileInView` / `viewport`, pan, and Motion's full drag gesture (constraints, elasticity, momentum, snap to origin, drag controls)
- **Presence animations** — enter/exit with `transition:presence` (`mode`, `custom`, `onExitComplete`)
- **Layout animations** — Motion's layout engine: size/position transitions and shared `layoutId` morphs
- **Motion values** — render motion values with `style`, scroll-linked values with `scrollValues()`
- **Reduced motion** — respected everywhere, configurable with `motionConfig`

## Requirements

- Svelte 5
- Motion 14 (peer dependency)

## Installation

```bash
npm install @omicrxn/mercury motion
# or
pnpm add @omicrxn/mercury motion
```

## Usage

### Animate

```svelte
<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	let open = $state(false);
</script>

<div
	{@attach mercury({
		initial: { opacity: 0 },
		animate: { opacity: 1, scale: open ? 1.5 : 1 },
		whileHover: { scale: 1.1 },
		whileTap: { scale: 0.95 },
		transition: { type: 'spring', bounce: 0.25 }
	})}
></div>
```

Attachments re-run when the state they read changes. Each run updates the element's Motion node — like a React re-render — so only what changed animates and gestures in progress carry on.

### Variants

```svelte
<ul {@attach mercury({ initial: 'closed', animate: open ? 'open' : 'closed', variants: list })}>
	{#each items as item (item.id)}
		<li {@attach mercury({ variants: listItem })}>{item.label}</li>
	{/each}
</ul>
```

### Enter / exit

```svelte
<script lang="ts">
	import { mercury, presence } from '@omicrxn/mercury';
	let show = $state(true);
</script>

{#if show}
	<div
		transition:presence
		{@attach mercury({
			initial: { opacity: 0, y: 25 },
			animate: { opacity: 1, y: 0 },
			exit: { opacity: 0, y: 25 }
		})}
	>
		Hello
	</div>
{/if}
```

Or without an attachment, animating to and from the element's CSS: `transition:presence={{ initial: { opacity: 0 }, exit: { opacity: 0 } }}`.

### Layout animations

```svelte
<script lang="ts">
	import { layout, mercury } from '@omicrxn/mercury';

	let justify = $state('start');
	layout(() => justify, { transition: { duration: 0.4 } });
</script>

<div class="flex" style="justify-content: {justify};">
	<div {@attach mercury({ layout: true })} class="h-16 w-16 rounded-md bg-blue-300"></div>
</div>
```

`layout(trigger)` declares which state changes the layout (Motion's `layoutDependency`). Elements marked with `layout` / `layoutId` (or `layout.props()`) animate to their new size and position; two elements with the same `layoutId` morph into each other. Attach the group with `{@attach}` to scope it to a container, or wrap a one-off change in `layout.animate(() => { ... })`.

### Drag

```svelte
<div bind:this={container}>
	<div {@attach mercury({ drag: true, dragConstraints: container, whileDrag: { scale: 1.1 } })}></div>
</div>
```

## API

| Export | Description |
| --- | --- |
| `mercury` | Attachment taking Motion's component props |
| `presence` | Svelte transition: Motion's `AnimatePresence` for one element |
| `layout` | Layout animations: `layout(trigger, options)`, `layout.props(id?, options?)`, `layout.animate(update, options)` |
| `motionConfig` | Attachment: Motion's `MotionConfig` for the elements inside |
| `scrollValues` | Motion's `useScroll()`: scroll position and progress as motion values |
| `createDragControls` | Motion's `useDragControls()` |
| `GooeyEffect` | SVG "gooey" filter component |

Motion's own utilities — `motionValue`, `transformValue`, `springValue`, `stagger`, easing functions, `animate()` — are imported from `motion`.

## Acknowledgments

Mercury is built on the shoulders of giants. Special thanks to the creators and maintainers of [Svelte](https://svelte.dev/) and [Motion](https://motion.dev/) — Mercury's drag and pan gestures are ported from Motion's (MIT) — and to [@Char2sGu](https://github.com/Char2sGu) for helping integrate layout projections into the library.

## License

MIT
