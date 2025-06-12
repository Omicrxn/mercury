---
title: Getting Started
description: Seamlessly integrate your favorite animation libraries (Motion, AnimeJS, GSAP) into your Svelte projects using Mercury.
section: Overview
---

<script>
	import { Callout } from "@svecodocs/kit";
</script>

The following guide will walk you through the process of installing Mercury.

## Installation

You can easily install Mercury with npm or your preferred package manager:


```bash
npm install @omicrxn/mercury
```

## Animating Elements

Mercury leverages Svelte Attachments to provide intuitive animation handling. Here’s a basic example demonstrating its usage:

<!-- Basic Animation here -->

### Explanation

- `{@attach mercury()}`: Attaches Mercury’s animation functionality to your element.
- `animate: { scale: 1 }`:  Defines the target scale of the element, animating it to its full size.
- `transition: { ease: 'circInOut', duration: 1 }`: Configures the animation with a smooth easing function (circInOut) and a duration of 1 second.
