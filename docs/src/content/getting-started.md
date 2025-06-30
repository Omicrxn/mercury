---
title: Getting Started
description: Seamlessly integrate your favorite animation libraries (Motion, AnimeJS, GSAP) into your Svelte projects using Mercury.
section: Overview
---

<script>
	import { Callout } from "@svecodocs/kit";
	import { PMCommand } from '$lib/components/ui/pm-command';
</script>

The following guide will walk you through the process of installing Mercury.

## Installation

You can easily install Mercury with npm or your preferred package manager:

<PMCommand command="install" args={['@omicrxn/mercury']} />

## Animating Elements

Mercury leverages Svelte Attachments to provide intuitive animation handling. Here’s a basic example demonstrating its usage:

<!-- Basic Animation here -->
<iframe id="basic-animation" title="Basic Animation" loading="lazy" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking; clipboard-write;" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation" style="width:100%; height:450px; flex:1;" src="https://mercury.uialchemy.com/examples/basic-animation?utm_source=embed"></iframe>

### Explanation

- `{@attach mercury()}`: Attaches Mercury’s animation functionality to your element.
- `animate: { scale: 1 }`: Defines the target scale of the element, animating it to its full size.
- `transition: { ease: 'circInOut', duration: 1 }`: Configures the animation with a smooth easing function (circInOut) and a duration of 1 second.
