---
title: Presence (Enter / Exit)
description: Effortlessly animate component mounting and unmounting using Mercury's presence features.
section: API
---

<script>
	import { Callout } from '@svecodocs/kit'
	import * as Code from "$lib/components/ui/code";

	let codeExit = `
	{#if show}
		<span
			class="opacity-0"
			style={untrack(() => initial) ? 'transform:translateY(-25px)' : ''}
			{@attach mercury({
				animate: { opacity: 1, y: 0 },
				transition: { type: 'spring', duration: 1, bounce: 0 }
			})}
			out:presence={{ opacity: 0, y: 25, mode: 'popLayout', transition: { duration: 0.15 } }}
		>
			Example
		</span>
{/if}
  `
</script>

## Overview

Mercury simplifies animating component entrances and exits, leveraging Svelte’s powerful transitions while reducing manual overhead. Unlike typical implementations where you wrap elements with specialized components, Mercury utilizes Svelte transitions directly, providing seamless integration and intuitive behavior out-of-the-box.

## Enter animations

By default, Mercury animates from the element’s current style to the defined `animate` parameters, providing immediate entry animations. However, in scenarios where explicit control over initial states is required—particularly if you need different behaviors between initial render and subsequent renders—you can manually handle these styles.

### Using `in:presence`

`presence` is symmetric, so you can also use it with Svelte’s `in:` directive. The parameters describe the element’s _hidden_ state, and Mercury animates **from** those values **to** the element’s natural state on enter:

```svelte
<div in:presence={{ opacity: 0, y: 25 }} out:presence={{ opacity: 0, y: 25 }} />
```

For transform values (`x`, `y`, `scale`, `rotate`, …) the natural target is the identity (no transform); other properties fall back to the element’s computed style. Because of the Svelte first-render limitation described below, prefer the `mercury` attachment when you need full control over the very first mount.

### Author Notes on Svelte Limitations:

<Callout>
    Initially, the goal was to allow explicit initial styles directly within Mercury. However, there were two primary limitations with Svelte:
    1. No First Render Control: Svelte does not currently provide a built-in mechanism to conditionally run intro transitions on the first render (see this issue)
    2. Attachments Limitation: Styles cannot be applied via attachments before the component mounts, limiting pre-mount initialization capabilities. Due to these limitations, a manual workaround is necessary, as demonstrated below:

</Callout>

Mercury by default animates from the element style to the `animate` parameters. So you already get enter animations out of the box, however there are scenarios where explicitly note the `initial` styles so that Mercury animates from `initial` to `animate` parameters might be useful. The main example is if you want to have the default styles apply on the first run but then on the next ones go from `initial` to `animate`. The first thought was that like Exit animations that would be handled by `in:` transitions but Svelte doesn’t allow the ability to chose if they run on first render or not . The second thought was to apply the `initial` styles before the component mounts but that can’t be done in attachments as far as I’m concerned. So right now Enter animations are only from the element styles to `animate`. However if you need to have initial animation disabled on first render this is a solution:

### Disabling Initial Animation on First Render

Here’s how to disable animations on the initial render but apply them subsequently:

```svelte
<script lang="ts">
	import { presence, mercury } from '$lib/index.js';
	import { onMount, untrack } from 'svelte';
	let initial = $state(false);
	onMount(() => {
		initial = true;
	});
</script>

<span
	class="opacity-0"
	style={untrack(() => initial) ? 'transform:translateY(-25px)' : ''}
	{@attach mercury({
		animate: { opacity: 1, y: 0 },
		transition: { type: 'spring', duration: 1, bounce: 0 }
	})}
>
	Example
</span>

```

#### Explanation:

- The span doesn’t animate initially.

- After the first render, subsequent renders animate smoothly from y: `-25px` to `y: 0px`.

## Exit Animations

Mercury provides smooth exit animations through its custom `presence` transition. Simply use it with Svelte’s built-in `out`: directive:

<Code.Root lang="svelte" class="w-full" code={codeExit}>
<Code.CopyButton />
</Code.Root>

#### Explanation:

- `out:presence`: Defines exit animations explicitly.

- Parameters (`opacity`, `y`) specify the exit state of the animation.

- The `transition` parameter customizes duration and easing behavior.

### Exit Modes (`sync`, `wait` and `popLayout`)

If you are familiar with Motion, you will know that it has 3 main exit modes. While not as advanced as Motion’s.

Quoting [Motion’s documentation](https://motion.dev/docs/react-animate-presence#mode)

> - “sync”: Children animate in/out as soon as they’re added/removed.
> - “wait”: The entering child will wait until the exiting child has animated out. Note: Currently only renders a single child at a time.
> - “popLayout”: Exiting children will be “popped” out of the page layout. This allows surrounding elements to move to their new layout immediately.

In Mercury the mode is selected with a single `mode` parameter on the **exit** transition:

```svelte
<div out:presence={{ opacity: 0, scale: 0.8, mode: 'popLayout' }} />
```

- **`mode: 'sync'`** (default) — entering and exiting nodes animate at the same time. Use an `{#if}` branch swap without `{#key}` so both can overlap. Pair with `{@attach mercury(...)}` on enter and `out:presence` on exit.
- **`mode: 'popLayout'`** — snapshots the exiting element's box and pins it with `position: absolute`, so siblings reflow immediately while it animates out in place. Mercury sets the direct parent to `position: relative` when it is `static`.
- **`mode: 'wait'`** — the next enter in the same parent slot waits until the exit animation finishes. Set `mode: 'wait'` on `out:presence`; Mercury coordinates the delay automatically for `in:presence` and `{@attach mercury(...)}` enter animations in that slot.

When an element uses both `{@attach mercury(...)}` and `out:presence`, Mercury stops the enter animation before running the exit so the two don't fight over the same properties.

<Callout>
    `presence` respects the user’s <code>prefers-reduced-motion</code> setting. When reduced motion is requested the element is added/removed instantly without animating.
</Callout>

## Caveats & differences from Motion

`presence` is built directly on Svelte transitions instead of a wrapper component like React's `<AnimatePresence>`. The common cases map over cleanly, but a few rules come from Svelte's model rather than Mercury and are worth knowing up front.

### Exits inside a conditional parent need `|global`

Svelte does **not** play a _local_ `out:` transition when a **parent** block (`{#if}`, `{#key}`, `{#each}`) is the thing being removed — it only plays local transitions when the element's own block is removed. If an ancestor block is destroyed, add the `|global` modifier so the exit still runs:

```svelte
{#if open}
	{#if state === 'success'}
		<Success />
	{:else}
		<!-- the parent {:else} block is destroyed on success, so |global is required -->
		<form out:presence|global={{ opacity: 0, y: 8, mode: 'popLayout' }}>…</form>
	{/if}
{/if}
```

Rule of thumb: if the element's own `{#if}` toggles, local `out:presence` is fine; if an ancestor block is removed, use `out:presence|global`.

### `mode` is set per element, not on a wrapper

Motion sets `mode` once on `<AnimatePresence>`. In Mercury the mode lives on each `out:presence`. For a list, set the same `mode` on every item's exit transition.

### Animate-on-first-mount isn't automatic with `in:`

Svelte usually won't play an `in:` transition for an element that is already present on the very first render (intros are off by default on initial load), whereas Motion animates `initial` by default. For a guaranteed mount animation use the `{@attach mercury(...)}` `animate` (it runs on mount), and reserve `in:presence` for conditionally-inserted elements. See [Disabling Initial Animation on First Render](#disabling-initial-animation-on-first-render) above.

### `popLayout` reflows siblings instantly

Motion pairs `popLayout` with the `layout` prop so neighbours _animate_ to their new positions (FLIP). Mercury's `popLayout` only pops the exiting node out of flow; surrounding elements reflow **immediately**. For a smooth reflow, add Mercury's [`layout`](/docs/api/layout-animations) to the siblings.

### No `onExitComplete` hook

There is no single "all exits finished" callback like Motion's `onExitComplete`. Because the node is removed as the exit ends, a Motion `transition.onComplete` may not fire for exits — don't rely on it to detect exit completion.

### `wait` coordinates through the shared parent

`wait` mode renders one child at a time and sequences the next enter after the current exit, coordinating through the **shared parent element**. The entering and exiting nodes must live under the same DOM parent for the sequencing to work — keyed swaps (`{#key}`) and `{#if}` blocks normally satisfy this.
