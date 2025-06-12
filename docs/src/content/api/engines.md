---
title: Engines
description: Learn how to select, configure, and use animation engines with Mercury, and discover the enhanced capabilities Mercury provides.
section: API
---
<script>
	import { Callout } from '@svecodocs/kit'
</script>
## Overview
Mercury supports multiple animation engines, allowing you to select your preferred library—*Motion* (default), *GSAP*, or *AnimeJS*—and enrich their capabilities with additional features like gestures, layout animations, and presence animations.

## Extended Functionality


In addition to the core functionalities provided by these libraries, Mercury offers unified, engine-agnostic features, including:

- *Gestures*

- *Layout Animations*

- *Presence (Enter/Exit Animations)*
These features ensure consistency across different animation libraries.

<Callout type="note" title="Community Contributions">
    Additional engine adapters are welcome! Feel free to contribute support for other animation libraries.
</Callout>

## Selecting an Engine
By default, Mercury utilizes GSAP. To explicitly choose a different engine, use the engine parameter:

```svelte
import {mercury, AnimeEngine} from '@omicrxn/mercury';

<div
	{@attach mercury({
		engine: AnimeEngine
	})}
/>
```
Available engine indentifiers:

- `GSAPEngine`
- `MotionEngine` (default)
- `AnimeEngine`

## Unified API
Mercury simplifies the animation workflow by providing a consistent API across all supported engines. This means uniform naming conventions and parameters, reducing complexity and making it easy to switch between engines without needing to learn multiple APIs.

For instance, some libraries use `loop` while others use `repeat`; Mercury standardizes these differences to ensure a smoother development experience.
