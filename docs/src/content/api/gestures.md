---
title: Gestures
description: Learn how to easily implement interactive gesture and scroll-based animations with Mercury.
section: API
---
<script>
	import { Callout } from '@svecodocs/kit'
</script>
## Overview
Mercury provides robust support for interactive gesture and scroll-triggered animations, making it easy to enrich user experiences in your Svelte applications. Below, you’ll find detailed explanations and practical examples focusing on hover, tap, and scroll animations.

All gesture animations described below (`hover`, `tap`, and `scroll`) have their own independent `transition`. Additionally, the `scroll` animation supports extra parameters such as `root`, `margin`, and `amount`. If you don’t provide a specific `transition`, Mercury will use the default `transition` settings.

## Gesture Animations
Gesture animations respond dynamically to user interactions such as hovering or tapping, providing immediate visual feedback that enhances interactivity.

## Hover
Hover animations activate when a user moves their cursor over an element, creating intuitive and visually appealing interactions.

- `onHoverStart`: function that runs when the mouse starts hovering the element.
- `onHoverEnd`: function that runs when the mouse goes outside the element.
- `whileHover`: animation run when the element is hovered.

```svelte
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
```

## Tap
Tap animations trigger on user click or touch interactions, creating engaging feedback that enhances tactile experiences.

- `onTapStart`: function that runs when the mouse clicks the element.
- `onTapEnd`: function that runs when the click is up.
- `whileTap`: animation run when the element is tapped.
```svelte
<div
	{@attach mercury({
		whileTap: {
			scale: 0.5,
			transition: { duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }
		},
		transition: { ease: 'circInOut', duration: 1 }
	})}
/>
```


## Scroll
Scroll-triggered animations activate as elements enter or leave the viewport, enhancing the visual flow and interactivity of content on scroll.
- `enter`: animation that runs when the element goes into view.
- `exit`: animation that runs when the element exists the root.
- `root`: element to be used as scroll viewport.

```svelte
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
```
