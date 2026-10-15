# 003 — Repair pointer and scroll demo behavior

- **Commit:** cf0f2e8
- **Severity:** MEDIUM
- **Categories:** Interruptibility, accessibility, cohesion
- **Estimated scope:** 6 mirrored files

## Problem and current code

`apps/docs/examples/interactive-graph.svelte:13` and playground `components/interactive-graph.svelte:13` create `springValue(0, isHovering ? SPRING : SLOW_SPRING)` once while isHovering is false. The intended responsive spring is never selected. Line 23 sets that spring on every pointer move, making the clip edge lag the pointer. `onMount` discards `styleEffect` cleanup and the reset timeout survives destruction.

`apps/docs/examples/scroll.svelte:17` uses `document.querySelector('.scroll-test')` for its observer root, selecting the wrong container when examples repeat. Its arrow at line 8 has `{type:'spring', duration:0.1, repeat:Infinity, repeatType:'reverse'}`. The stage is only `h-full` and its content can shrink; the playground counterpart already binds an explicitly sized root. Both use a 1s reveal.

`apps/docs/examples/drag.svelte:7` fixes the bound container at `w-[400px]` with no responsive cap; playground already has `max-w-full`.

## Target and steps

1. Graph: create `motionValue(0)` for clipping; pointer moves set the raw value, preserving 1:1 tracking. On pointer leave, restore full graph with `animate(value, 0, { duration: 0.3, ease: [0.23, 1, 0.32, 1] })` after 150ms. Cancel restoration/timeout on pointer enter/move. Return `styleEffect` cleanup from onMount and stop outstanding controls on destruction. Type `PointerEvent` and safely type its currentTarget. Remove unused spring imports/config/state. Only enable pointer decoration for fine hover pointers; reduced motion shows full graph without a moving clip. Use built-in Svelte reactive media query or a lifecycle-managed matchMedia listener, not ad hoc globals. Keep existing SVG artwork.
2. Scroll Docs: copy playground pattern `let scrollRoot = $state<HTMLElement | undefined>(undefined)` plus `bind:this`, render observed child only once root exists, and supply that exact root. Set a 320px high, width-full, overflow-y-auto stage; spacer 420px with shrink-0; leave at least 96px below box so entry can finish. Use a modest explanatory reveal y 24 to 0/opacity 0 to 1 and optional rotate 12deg to 0, duration 0.3, ease `[0.23, 1, 0.32, 1]`. Mirror this in playground while preserving headings.
3. Replace the arrow's 100ms spring loop with either a static arrow or an 8px vertical hint of duration 0.8 with reverse repetition, disabled under reduce. Static is preferred because the text already explains scrolling.
4. Drag Docs and playground: ensure container `w-full max-w-[400px]` and adequate shrink behavior; preserve direct drag, bounds and release rubberband. Do not add springs between pointer and dragged object.

## Conventions, scope and verification

Playground `gestures/scroll.svelte:15` is the bound-root exemplar. Continue using Motion values/styleEffect; no new motion library. Do not change the library scroll/drag code or graph artwork. Check types and cleanup. Browser checks when available: two scroll examples observe their own roots, scrolling out and back replays cleanly, graph follows the pointer without a trailing clip edge, leave/reenter cancels reset, touch can scroll without accidental clipping, and all examples fit a 320px viewport. Record/scrub rapid pointer reversals and scroll reentry. No runtime feel test was possible during audit.
