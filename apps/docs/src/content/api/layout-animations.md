---
title: Layout Animations
description: Enhance your UI transitions with powerful layout animations using Mercury.
section: API
---

<script>
	import { Callout } from '@svecodocs/kit'
	import * as Code from "$lib/components/ui/code";

	let codeBasicUsage = `
<script lang="ts">
	import { layout } from '@omicrxn/mercury';

	let justify = $state('start');
	const layoutGroup = layout(() => justify, { transition: { duration: 0.4 } });
<\/script>

<div {@attach layoutGroup} style="justify-content: {justify};">
	<div
		{...layout.props()}
		class="box h-16 w-16 rounded-md border border-slate-500 bg-blue-200"
	/>
</div>
<button
	onclick={() => (justify = justify === 'start' ? 'end' : 'start')}
	class="bg-slate-200">Flip</button
>
  `
	let codeLayoutId = `
<script lang="ts">
	let showSecond = $state(false);
	const layoutGroup = layout(() => showSecond, { transition: { duration: 0.4 } });
<\/script>

<div {@attach layoutGroup}>
	<button onclick={() => (showSecond = !showSecond)}>Animate</button>
	{#if showSecond}
		<div {...layout.props('rectangle')} class="second-element">
			<div {...layout.props('rectangle-square')} class="size-4 rounded-md bg-blue-200"></div>
		</div>
	{:else}
		<div {...layout.props('rectangle')} class="element">
			<div {...layout.props('rectangle-square')} class="size-4 rounded-md bg-red-500 m-4"></div>
		</div>
	{/if}
</div>
  `
</script>

## Overview

Layout animations enable you to animate properties and scenarios typically not supported by standard CSS animations. While standard animations effectively animate individual properties like opacity or scale, they can’t handle structural changes—such as switching flex-direction, updating grid-template-columns, or smoothly animating between two separate elements. Mercury’s layout animations effortlessly manage these complex cases.

## Basic Usage

Layout animations have two parts:

1. **`layout(trigger, options)`** — creates a layout group. The `trigger` is a getter for the reactive state that causes layout changes; `options.transition` controls the timing. Attach the returned group to the **container** with `{@attach layoutGroup}`.
2. **`layout.props(id?)`** — spread onto each **child** that should animate when the layout changes.

<Code.Root lang="svelte" class="w-full" code={codeBasicUsage}>
<Code.CopyButton />
</Code.Root>

This is Mercury's equivalent of Motion's `layout` prop: when the trigger changes, Mercury measures every marked element before and after the DOM update and FLIP-animates the difference (position and size), including structural changes CSS can't animate — `justify-content`, `flex-direction`, `grid-template-columns`, reordering, and so on.

<Callout type="warning" title="Why the trigger?">
	Svelte has no automatic DOM change detection, and Mercury works directly on HTML elements rather than wrapper components. The trigger getter passed as the first argument to <code>layout()</code> is how Mercury knows when to record and animate layout changes.
</Callout>

## Layout ID (Shared Layout Animations)

To animate between two **different** elements — Motion's `layoutId` — give them the same id via `layout.props('id')`. When state swaps one for the other, Mercury smoothly transitions the old element into the new one:

<Code.Root lang="svelte" class="w-full" code={codeLayoutId}>
<Code.CopyButton />
</Code.Root>

Both elements share the layout id (`rectangle`), so swapping the `{#if}` branches morphs one into the other instead of cutting. Nested shared elements (like `rectangle-square` above) each get their own id.
