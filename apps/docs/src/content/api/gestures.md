---
title: Gestures
description: Learn how to easily implement interactive gesture and scroll-based animations with Mercury.
section: API
---

<script>
	import * as Code from "$lib/components/ui/code";

	let codeHover = `
	<div
		{@attach mercury({
			animate: { scale: 0.3 }, //since exit is not defined, this will be the exit
			whileHover: {
				scale: 1.25,
				transition: { duration: 0.5, type: 'spring', stiffness: 150, damping: 20 }
			},
			transition: { ease: 'circInOut', duration: 1 }
		})}
/>
  `
	let codeTap = `
	<div
		{@attach mercury({
			whileTap: {
				scale: 0.5,
				transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }
			},
			transition: { ease: 'circInOut', duration: 1 }
		})}
/>
  `
	let codeDrag = `
<!-- bind the boundary you want to constrain dragging to -->
<div bind:this={container} class="boundary">
	<div
		{@attach mercury({
			drag: true,
			dragOptions: { axis: 'x', bounds: container, rubberband: true },
			onDragStart: () => console.log('drag start'),
			onDragEnd: () => console.log('drag end')
		})}
		class="box"
	/>
</div>
  `
	let codeScroll = `
	<div
		{@attach mercury({
			scroll: {
				enter: { x: 150, rotate: 180 },
				exit: { x: 0, rotate: 0 },
				transition: { duration: 1, type: 'spring', stiffness: 100, damping: 10 }
			},
			transition: { ease: 'circInOut', duration: 1 }
		})}
/>
  `
</script>

## Overview

Mercury provides robust support for interactive gesture and scroll-triggered animations, making it easy to enrich user experiences in your Svelte applications. Below, you’ll find detailed explanations and practical examples for hover, tap, drag, and scroll.

The animation-driven gestures (`hover`, `tap`, and `scroll`) each have their own independent `transition`; if you don’t provide one, Mercury uses the default `transition` settings. The `scroll` gesture supports extra parameters such as `root`, `margin`, and `amount`. `drag` is different — it isn’t a keyframe animation but a pointer-driven interaction, so instead of a `transition` it takes `dragOptions` for its behavior.

## Gesture Animations

Gesture animations respond dynamically to user interactions such as hovering or tapping, providing immediate visual feedback that enhances interactivity.

## Hover

Hover animations activate when a user moves their cursor over an element, creating intuitive and visually appealing interactions.

- `onHoverStart`: function that runs when the mouse starts hovering the element.
- `onHoverEnd`: function that runs when the mouse goes outside the element.
- `whileHover`: animation run when the element is hovered.

<Code.Root lang="svelte" class="w-full" code={codeHover}>
<Code.CopyButton />
</Code.Root>

## Tap

Tap animations trigger on user click or touch interactions, creating engaging feedback that enhances tactile experiences.

- `onTapStart`: function that runs when the mouse clicks the element.
- `onTapEnd`: function that runs when the click is up.
- `whileTap`: animation run when the element is tapped.

<Code.Root lang="svelte" class="w-full" code={codeTap}>
<Code.CopyButton />
</Code.Root>

## Drag

Set `drag: true` to make an element draggable. Mercury tracks the pointer, moves the element with Motion values, and applies inertia when you release it.

- `drag`: set to `true` to make the element draggable.
- `onDragStart`: function that runs when dragging begins.
- `onDragEnd`: function that runs when the pointer is released (before inertia settles).
- `dragOptions`: configures **how** the drag behaves. This is drag _configuration_, not an animation — it does not animate the element while dragging.
  - `axis`: restrict movement to `'x'` or `'y'`, or `'lock'` to lock to the first axis the user moves along.
  - `bounds`: constrain movement — pass an element (e.g. a `bind:this` reference), a `{ current }` ref, or an object of pixel offsets `{ left, right, top, bottom }`.
  - `rubberband`: elastic resistance when dragging past the bounds — `true`, or a number to tune the elasticity.

<Code.Root lang="svelte" class="w-full" code={codeDrag}>
<Code.CopyButton />
</Code.Root>

## Scroll

Scroll-triggered animations activate as elements enter or leave the viewport, enhancing the visual flow and interactivity of content on scroll.

- `enter`: animation that runs when the element goes into view.
- `exit`: animation that runs when the element exists the root.
- `root`: element to be used as scroll viewport.

<Code.Root lang="svelte" class="w-full" code={codeScroll}>
<Code.CopyButton />
</Code.Root>
