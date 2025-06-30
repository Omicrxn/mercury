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
			easing: 'linear'
		}
	})}
  >
  `
let codeSprings = `
  <div
	class="box h-16 w-16 rounded-md border border-slate-500 bg-blue-200"
	{@attach mercury({
		animate: { rotate: 90 },
		transition: { type: 'spring', repeat: Infinity, repeatDelay: 0.2 }
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

Mercury supports animations from popular engines like GSAP, Motion, and AnimeJS. To explore detailed capabilities, check your chosen engine’s documentation:

- [GSAP Docs](<https://gsap.com/docs/v3/GSAP/gsap.to()/>)
- [Motion Docs](https://motion.dev/docs/animate)
- [Anime Docs](https://animejs.com/documentation/animation/)

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

Easings control animation pacing, enhancing visual appeal. Mercury provides these built-in easings:

- `linear`, `easeIn`, `easeOut`, `easeInOut`
- `circIn`, `circOut`,`circInOut`
- `backIn`, `backOut`, `backInOut`
- `anticipate`
  Additionally, you can use custom easing functions provided by your selected animation library.

## Repetition

Control how animations repeat with these parameters:

- `repeat`: Number of repetitions (`Infinity` supported).
- `repeatType`: `loop`, `reverese` or `mirror`
- `repeatDelay`: Delay in seconds between repetitions.

<Code.Root lang="svelte" class="w-full" code={codeRepetition}>
<Code.CopyButton />
</Code.Root>

## Springs

Spring-based animations mimic physical springs, often providing the most natural animation experience:

<Code.Root lang="svelte" class="w-full" code={codeSprings}>
<Code.CopyButton />
</Code.Root>

Customize springs with

- `bounce`: Controls spring bounce intensity.

- `damping`: Adjusts resistance force.

- `mass`: Sets the mass of the animated object.

- `stiffness`: Defines spring stiffness.

- `velocity`: Sets initial spring velocity.

<Callout type="note" title="Note">
    Parameters might behave differently depending on the chosen animation library. Refer to its documentation for specific behaviors.
</Callout>
