---
title: Presence (Enter / Exit)
description: Effortlessly animate component mounting and unmounting using Mercury's presence features.
section: API
---
<script>
	import { Callout } from '@svecodocs/kit'
</script>
## Overview
Mercury simplifies animating component entrances and exits, leveraging Svelte’s powerful transitions while reducing manual overhead. Unlike typical implementations where you wrap elements with specialized components, Mercury utilizes Svelte transitions directly, providing seamless integration and intuitive behavior out-of-the-box.

## Enter animations
By default, Mercury animates from the element’s current style to the defined `animate` parameters, providing immediate entry animations. However, in scenarios where explicit control over initial states is required—particularly if you need different behaviors between initial render and subsequent renders—you can manually handle these styles.
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
```svelte
{#if show}
	<span
		class="opacity-0"
		style={untrack(() => initial) ? 'transform:translateY(-25px)' : ''}
		{@attach mercury({
			animate: { opacity: 1, y: 0 },
			transition: { type: 'spring', duration: 1, bounce: 0 }
		})}
		out:presence={{ opacity: 0, y: 25, popLayout: true, transition: { duration: 0.15 } }}
	>
		Example
	</span>
{/if}
```

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

`sync` is the default behaviour in Mercury, but as you will notice. As you can see in the example above `popLayout` is a boolean parameter in the transition. So what happens with `wait`? Well as per Svelte documentation that behaviour is accomplished by default by wrapping the element in a `{#key }` block. So by leaving the transition by default, iff the element is wrapped by a `{#key }` block the behaviour will be Motion’s `wait`, but if it isn’t the behaviour will be Motion’s `sync`.
