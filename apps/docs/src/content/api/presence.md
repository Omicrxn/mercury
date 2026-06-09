---
title: Presence (Enter / Exit)
description: Effortlessly animate component mounting and unmounting using Mercury's presence features.
section: API
---

<script>
	import { Callout } from '@svecodocs/kit'
	import * as Code from "$lib/components/ui/code";

	let codeUsage = `
{#if show}
	<div
		class="card"
		transition:presence={{
			initial: { opacity: 0, scale: 0.8 },
			exit: { opacity: 0, scale: 0.8 },
			transition: { duration: 0.3 }
		}}
	/>
{/if}
  `

	let codePill = `
{#if isSilent}
	<div
		class="absolute left-[5px] h-[18px] w-10 rounded-full bg-[#FD4F30]"
		transition:presence={{
			initial: { width: 0, opacity: 0, filter: 'blur(4px)' },
			exit: { width: 0, opacity: 0, filter: 'blur(4px)' },
			transition: { type: 'spring', bounce: 0.35 }
		}}
	/>
{/if}
  `

	let codeFlat = `
<!-- the flat form: one hidden state for both directions -->
<div transition:presence={{ opacity: 0, y: 25 }} />

<!-- or per direction -->
<div in:presence={{ opacity: 0 }} out:presence={{ opacity: 0, y: 25 }} />
  `

	let codeModes = `
{#key currentTab}
	<section
		transition:presence={{
			initial: { opacity: 0, scale: 0.9 },
			exit: { opacity: 0, scale: 0.9 },
			mode: 'popLayout',
			transition: { duration: 0.25 }
		}}
	>
		{currentTab.content}
	</section>
{/key}
  `
</script>

## Overview

Mercury's `presence` is the equivalent of Motion's `<AnimatePresence>` — without the wrapper component. It is a Svelte transition, so you attach it directly to the element whose mounting and unmounting you want to animate:

<Code.Root lang="svelte" class="w-full" code={codeUsage}>
<Code.CopyButton />
</Code.Root>

- **`initial`** — the hidden state the element enters **from**. On enter, Mercury animates from these values to the element's settled CSS styles.
- **`exit`** — the values the element animates **to** before it is removed.
- **`transition`** — shared timing for both directions. Each spec can override it with its own `transition` (e.g. `exit: { opacity: 0, transition: { duration: 0.15 } }`).
- **`mode`** — `'sync' | 'wait' | 'popLayout'`, matching `<AnimatePresence mode>`.

The mental model is one sentence: **your CSS is the resting state, `initial` and `exit` are the hidden states, and `mercury({ animate })` is for state-driven animation.** Because the enter target is the element's own styles, there is no `animate` key on `presence` — `animate` always means the [mercury attachment](/docs/api/animate).

## Mapping from Motion

```jsx
// motion/react
<AnimatePresence>
	{isSilent && (
		<motion.div
			initial={{ width: 0, opacity: 0, filter: 'blur(4px)' }}
			animate={{ width: 40, opacity: 1, filter: 'blur(0px)' }}
			exit={{ width: 0, opacity: 0, filter: 'blur(4px)' }}
			transition={{ type: 'spring', bounce: 0.35 }}
			className="... w-10"
		/>
	)}
</AnimatePresence>
```

In Mercury, the static `animate` values move into CSS (`w-10`, default opacity, no filter), and `initial`/`exit` move onto the transition:

<Code.Root lang="svelte" class="w-full" code={codePill}>
<Code.CopyButton />
</Code.Root>

| motion/react | Mercury |
| --- | --- |
| `<AnimatePresence>` wrapper | not needed — Svelte transitions track unmounts natively |
| `initial={{ ... }}` | `initial` on `transition:presence` |
| `animate={{ ... }}` (static) | the element's CSS |
| `animate={{ ... }}` (state-driven) | `{@attach mercury({ animate })}` |
| `exit={{ ... }}` | `exit` on `transition:presence` |
| `<AnimatePresence mode="...">` | `mode` on `transition:presence` |
| `<AnimatePresence initial={false}>` | the default (local transitions) |
| `<AnimatePresence initial>` | `transition:presence\|global` |

## First render (`initial={false}`)

Svelte transitions are _local_ by default: they don't play when an **ancestor** block mounts, only when the element's own block is added or removed. This is exactly `<AnimatePresence initial={false}>` — a component appearing for the first time renders its children in their resting state, and only subsequent toggles animate.

If you _do_ want the enter to play when an ancestor mounts (Motion's default), opt in with the `|global` modifier:

```svelte
<div transition:presence|global={{ initial: { opacity: 0 }, exit: { opacity: 0 } }} />
```

## The flat form

For simple cases you can skip `initial`/`exit` and pass the hidden state directly. Enters animate **from** it, exits animate **to** it:

<Code.Root lang="svelte" class="w-full" code={codeFlat}>
<Code.CopyButton />
</Code.Root>

For transform values (`x`, `y`, `scale`, `rotate`, …) the settled target is the identity (no transform); other properties use the element's computed style.

## Modes (`sync`, `wait` and `popLayout`)

Quoting [Motion's documentation](https://motion.dev/docs/react-animate-presence#mode):

> - “sync”: Children animate in/out as soon as they’re added/removed.
> - “wait”: The entering child will wait until the exiting child has animated out. Note: Currently only renders a single child at a time.
> - “popLayout”: Exiting children will be “popped” out of the page layout. This allows surrounding elements to move to their new layout immediately.

In Mercury the mode is a parameter of the transition itself:

<Code.Root lang="svelte" class="w-full" code={codeModes}>
<Code.CopyButton />
</Code.Root>

- **`mode: 'sync'`** (default) — entering and exiting elements animate at the same time.
- **`mode: 'popLayout'`** — snapshots the exiting element's box and pins it with `position: absolute`, so siblings reflow immediately while it animates out in place. Mercury sets the direct parent to `position: relative` when it is `static`.
- **`mode: 'wait'`** — the next enter in the same parent slot waits until the exit animation finishes. Mercury coordinates the delay automatically for `presence` enters and `{@attach mercury(...)}` enter animations in that slot.

## Interruptions

Presence animations are interruptible, like Motion's:

- If an element is re-inserted while its exit is still running (a quick toggle back), Mercury animates it from wherever the exit left off back to its settled state instead of replaying the enter from `initial`.
- If an exit starts mid-enter, the enter is stopped and the exit animates from the current state.
- When an element uses both `{@attach mercury(...)}` and `presence`, Mercury stops the mercury animation before running the exit so the two don't fight over the same properties.

<Callout>
    `presence` respects the user’s <code>prefers-reduced-motion</code> setting. When reduced motion is requested the element is added/removed instantly without animating.
</Callout>

## Caveats & differences from Motion

`presence` is built directly on Svelte transitions instead of a wrapper component. The common cases map over cleanly, but a few rules come from Svelte's model rather than Mercury and are worth knowing up front.

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

Rule of thumb: if the element's own `{#if}` toggles, local `presence` is fine; if an ancestor block is removed, use `presence|global`.

### `mode` is set per element, not on a wrapper

Motion sets `mode` once on `<AnimatePresence>`. In Mercury the mode lives on each element's `presence` params. For a list, set the same `mode` on every item.

### `popLayout` reflows siblings instantly

Motion pairs `popLayout` with the `layout` prop so neighbours _animate_ to their new positions (FLIP). Mercury's `popLayout` only pops the exiting node out of flow; surrounding elements reflow **immediately**. For a smooth reflow, add Mercury's [`layout`](/docs/api/layout-animations) to the siblings.

### No `onExitComplete` hook

There is no single "all exits finished" callback like Motion's `onExitComplete`. Because the node is removed as the exit ends, a Motion `transition.onComplete` may not fire for exits — don't rely on it to detect exit completion.

### `wait` coordinates through the shared parent

`wait` mode renders one child at a time and sequences the next enter after the current exit, coordinating through the **shared parent element**. The entering and exiting nodes must live under the same DOM parent for the sequencing to work — keyed swaps (`{#key}`) and `{#if}` blocks normally satisfy this.
