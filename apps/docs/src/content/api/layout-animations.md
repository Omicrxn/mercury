---
title: Layout Animations
description: Enhance your UI transitions with powerful layout animations using Mercury.
section: API
---

<script>
	import { Callout } from '@svecodocs/kit'
	import * as Code from "$lib/components/ui/code";

	let codeBasicUsage = `
	<div style="justify-content: {justify};">
		<div
			{@attach layout({ track: () => justify })}
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
	{#if toggle}
		<div
			bind:this={smallBox}
			{@attach layout({ layoutId: 'test', track: () => toggle })}
			class="box h-16 w-16 rounded-md border border-slate-500 bg-blue-200"
		></div>
{:else}
		<div
			bind:this={bigBox}
			{@attach layout({ layoutId: 'test', track: () => toggle })}
			class="box h-24 w-24 rounded-md border border-slate-500 bg-blue-200"
		></div>
{/if}
  `
</script>

## Overview

Layout animations enable you to animate properties and scenarios typically not supported by standard CSS animations. While standard animations effectively animate individual properties like opacity or scale, they can’t handle structural changes—such as switching flex-direction, updating grid-template-columns, or smoothly animating between two separate elements. Mercury’s layout animations effortlessly manage these complex cases.

## Basic Usage

Use Mercury’s layout attachment independently or along the main Mercury attachment:

<Code.Root lang="svelte" class="w-full" code={codeBasicUsage}>
<Code.CopyButton />
</Code.Root>

<Callout type="warning" title="Important Notes">
	Svelte lacks automatic DOM change detection. And Mercury is created from the idea that it should be built upong Svelte core features and working in HTML Elements rather than having wrapper components. Thus, you must explicitly provide a state reference via the track parameter to trigger layout animations.
</Callout>

## Layout ID (Shared Layout Animations)

To animate between two different elements, use the same layoutId in Mercury’s layout attachment. This smoothly transitions one element to another when state changes:

<Code.Root lang="svelte" class="w-full" code={codeLayoutId}>
<Code.CopyButton />
</Code.Root>

Both elements share the layoutId (test), enabling seamless and visually appealing transitions between the states.
