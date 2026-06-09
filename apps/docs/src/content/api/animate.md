---
title: Animate
description: Easily animate your Svelte components using Mercury
section: API
---

<script>
	import { Callout } from '@svecodocs/kit'
	import * as Code from "$lib/components/ui/code";
let codeUsage = 	`<div
  {@attach mercury({
    animate: { scale: 2, x: 50 }
  })}
/>`
let codeStagger = 	`{#each { length: 3 }, i}
	<div
		{@attach mercury({
			animate: { opacity: 1, y: [64, 0] },
			transition: { delay: i * 0.05 } //use the index to target the element delayed.
		})}
	/>
{/each}`
let codeKeyframes = 	`<div
	{@attach mercury({
		animate: { y: [64, 0] } // will be animated to y: 64 and then to y:0
	})}
/>`
let codeTransition = `
  <div
	{@attach mercury({
		animate: { scale: 1.5 },
		transition: { ease: 'circInOut', duration: 1, delay: 0.3 }
	})}
  />
  `
let codeRepetition = `
  <div
	{@attach mercury({
		animate: {
			backgroundColor: ['#ff0088', '#0d63f8']
		},
		transition: {
			duration: 2,
			repeat: Infinity,
			repeatType: 'reverse',
			ease: 'linear'
		}
	})}
  >
  `
let codeSprings = `
  <div
	class="box h-16 w-16 rounded-md border border-slate-500 bg-blue-200"
	{@attach mercury({
		animate: { rotate: 90 },
		transition: { type: 'spring', duration: 0.8, bounce: 0.35, repeat: Infinity, repeatDelay: 0.2 }
	})}
  />
  `
</script>

## Overview

The `animate` property lets you control animations applied to your components with Mercury.

### Usage

Include the `animate` property within the `mercury()` attachment like this:

<Code.Root lang="svelte" class="w-full" code={codeUsage}>
<Code.CopyButton />
</Code.Root>

## Supported Features

Mercury is powered by Motion. To explore the full set of animatable values and capabilities, check the Motion documentation:

- [Motion Docs](https://motion.dev/docs/animate)

## Stagger

Instead of using stagger functions from the animation libraries, Mercury simplifies staggering animations by individually delaying elements:

<Code.Root lang="svelte" class="w-full" code={codeStagger}>
<Code.CopyButton />
</Code.Root>

## Keyframes

Mercury supports keyframe animations by providing arrays of values:

<Code.Root lang="svelte" class="w-full" code={codeKeyframes}>
<Code.CopyButton />
</Code.Root>

## Transition

Control the animation’s transition properties (duration, easing, repeat) with the transition parameter:

<Code.Root lang="svelte" class="w-full" code={codeTransition}>
<Code.CopyButton />
</Code.Root>

## Easing

Easings control animation pacing throughout an animation's duration. Mercury uses Motion's easing system — pass any [Motion easing](https://motion.dev/docs/easing-functions) via the `ease` property on `transition`:

- **Named easings:** `linear`, `easeIn`, `easeOut`, `easeInOut`, `circIn`, `circOut`, `circInOut`, `backIn`, `backOut`, `backInOut`, `anticipate`
- **Cubic bezier:** `ease: [0.39, 0.24, 0.3, 1]`
- **Custom functions:** `ease: (progress) => progress * progress`
- **Steps:** import `steps` from `motion` and pass the result as `ease`

```svelte
{@attach mercury({
	animate: { scale: 1.5 },
	transition: { ease: 'circInOut', duration: 1 }
})}
```

## Repetition

Control how animations repeat with these parameters:

- `repeat`: Number of repetitions (`Infinity` supported).
- `repeatType`: `loop`, `reverese` or `mirror`
- `repeatDelay`: Delay in seconds between repetitions.

<Code.Root lang="svelte" class="w-full" code={codeRepetition}>
<Code.CopyButton />
</Code.Root>

## Springs

Spring-based animations mimic physical springs, often providing the most natural animation experience. Set `type: 'spring'` on the `transition`:

<Code.Root lang="svelte" class="w-full" code={codeSprings}>
<Code.CopyButton />
</Code.Root>

Just like Motion, Mercury springs can be configured in **two ways** — and the two sets of options are mutually exclusive.

### Duration-based springs

Set with a `duration` and a `bounce` value. These are the easiest to reason about: you pick how long it takes and how bouncy it feels.

- `duration`: Total duration of the spring, in seconds.
- `bounce`: Bounciness, from `0` (no bounce) to `1` (very bouncy). Defaults to `0.25`.
- `visualDuration`: Optional. Time (in seconds) the animation takes to *visually* reach its target. When set, it overrides `duration` and makes springs easier to coordinate with other time-based animations.

```svelte
{@attach mercury({
	animate: { y: 0 },
	transition: { type: 'spring', duration: 0.6, bounce: 0.2 }
})}
```

### Physics-based springs

Set with `stiffness`, `damping`, and `mass`. These incorporate the velocity of any in-progress gesture or animation for natural, interruptible motion.

- `stiffness`: Spring stiffness. Higher values create more sudden movement.
- `damping`: Opposing force. `0` oscillates forever.
- `mass`: Mass of the moving object. Higher values feel more lethargic.
- `velocity`: Initial velocity of the spring.
- `restSpeed` / `restDelta`: Thresholds that determine when the spring is considered "at rest" and the animation ends.

```svelte
{@attach mercury({
	animate: { rotate: 180 },
	transition: { type: 'spring', stiffness: 150, damping: 20 }
})}
```

<Callout type="warning" title="Don't mix the two">
    `duration` and `bounce` are ignored the moment any of <code>stiffness</code>, <code>damping</code>, or <code>mass</code> is set. Pick one configuration style per spring.
</Callout>

## Callbacks

Pass a `callbacks` object to hook into the animation lifecycle. These mirror [Motion's playback lifecycle](https://motion.dev/docs/animate#controls) one-to-one:

- `onPlay`: Fires when the animation starts playing.
- `onComplete`: Fires when the animation finishes.
- `onUpdate`: Fires with the latest value on each frame (single-value animations).
- `onRepeat`: Fires on each repetition.
- `onStop`: Fires when the animation is stopped.

```svelte
{@attach mercury({
	animate: { x: 100 },
	callbacks: {
		onPlay: () => console.log('started'),
		onComplete: () => console.log('done')
	}
})}
```

## Playback controls

Use the `instance` callback to capture the running animation and drive it imperatively. The instance exposes `play()`, `pause()`, `stop()`, and `cancel()`, plus a `completed` flag and an `onComplete` promise helper:

```svelte
<script lang="ts">
	import { mercury, type AnimationInstance } from '@omicrxn/mercury';
	let animation = $state<AnimationInstance>();
</script>

<div
	{@attach mercury({
		animate: { scale: 1.5 },
		transition: { duration: 1 },
		instance: (i) => (animation = i)
	})}
></div>

<button onclick={() => animation?.play()}>Play</button>
<button onclick={() => animation?.pause()}>Pause</button>
