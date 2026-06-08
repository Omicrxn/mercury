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
	onclick={() => {
		flip(); //this toggles the parent element between justify-start and justify-end
	}}
	class="bg-slate-200">Flip</button
>
  `
	let codeLayoutId = `
<script lang="ts">
	let toggle = $state(false);
	const layoutGroup = layout(() => toggle, { transition: { duration: 0.4 } });
<\/script>

<div {@attach layoutGroup}>
	{#if toggle}
		<div
			{...layout.props('test')}
			class="box h-16 w-16 rounded-md border border-slate-500 bg-blue-200"
		></div>
	{:else}
		<div
			{...layout.props('test')}
			class="box h-24 w-24 rounded-md border border-slate-500 bg-blue-200"
		></div>
	{/if}
</div>
  `
</script>

## Overview

Layout animations enable you to animate properties and scenarios typically not supported by standard CSS animations. While standard animations effectively animate individual properties like opacity or scale, they can’t handle structural changes—such as switching flex-direction, updating grid-template-columns, or smoothly animating between two separate elements. Mercury’s layout animations effortlessly manage these complex cases.

## Basic Usage

Attach a layout group to a container, then mark animated children with `layout.props()`:

<Code.Root lang="svelte" class="w-full" code={codeBasicUsage}>
<Code.CopyButton />
</Code.Root>

<Callout type="warning" title="Important Notes">
	Svelte lacks automatic DOM change detection. Mercury is built on Svelte core features and works directly on HTML elements rather than wrapper components. Pass a reactive trigger getter as the first argument to `layout()` so Mercury knows when to record and animate layout changes.
</Callout>

## Layout ID (Shared Layout Animations)

To animate between two different elements, give them the same id via `layout.props('id')`. Mercury smoothly transitions one element to another when state changes:

<Code.Root lang="svelte" class="w-full" code={codeLayoutId}>
<Code.CopyButton />
</Code.Root>

Both elements share the layout id (`test`), enabling seamless and visually appealing transitions between the states.
