# 004 — Complete motion preferences and remaining demo polish

- **Commit:** cf0f2e8
- **Severity:** MEDIUM
- **Categories:** Accessibility, cohesion, physicality
- **Estimated scope:** Remaining examples listed below; parent owns library change

## Execution status

Implemented the assigned playground-only work in `components/dynamic-island.svelte`, `components/dynamic-island/ring.svelte`, `components/create-button.svelte`, `layout/interactive-badge.svelte`, `layout/interactive-badge-css.svelte`, and `layout/reordering-layout.svelte`. Island state now belongs to the layout scope; its size change uses layout, strike uses scaleY, label uses scale 0.95, and explicit springs use bounce at most 0.12. Island/reorder automatic updates stop under reduce and have manual controls. Reorder preserves the original array and uses Fisher-Yates. Badges use native 44px triggers with focus/touch access and 200ms motion. Create menu removes default stagger and excessive movement.

All steps are implemented. The combined Svelte type check passes with one existing feedback autofocus warning. The library build, package validation, and isolated docs build pass. Three regression tests exercise the installed Motion engine with normal and reduced motion preferences. Browser and device playback verification remains pending because no browser was available.

## Problem and current code

`packages/mercury/src/lib/mercury/layout.svelte.ts:80` and `animate-presence.ts:230` already respect reduced motion. `mercury.svelte.ts:39`, `gestures/hover.ts:17`, `tap.ts:17`, and `scroll.ts:12` call Motion without this check. Parent owns this shared gap: ordinary Mercury/presence demos must not each grow duplicate preference logic.

Independent gaps: Docs and playground `css-spring.svelte:11/12` place `transition: transform {springAnimation}` inline without reduced-motion CSS. Playground `layout/reordering-layout.svelte:11` auto-shuffles every second regardless of reduced motion. `components/dynamic-island/ring.svelte:9` switches states every two seconds regardless of preference. Layout snapping does not stop this recurring visual distraction.

Playground `animation/animate-presence-modes.svelte:191` starts from scale 0.6; its exit scale is 0.8 at line 81. `components/dynamic-island/ring.svelte:16` uses `initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' }`. `components/create-button.svelte:7,73` combines 40px content movement with item delays `index * staggerInterval + 0.1` inside a morphing panel.

## Target and steps

1. CSS spring pair: move duration/string to a custom property if helpful, but place actual transition in a `@media (prefers-reduced-motion: no-preference)` rule. Under reduce the selected position applies immediately. Preserve spring(0.5, 0.8), because bounce is the lesson.
2. Autoplay state demos: gate timeout creation on `prefers-reduced-motion: no-preference` with a reactive media query. Reordering remains manually operable, starts static under reduce, and stops its timer if preference changes. Initialize with `$state([...initialOrder])` so Add cannot mutate Reset's original list. Dynamic island can show the Ring state statically; provide a manual Ring/Silent toggle if needed to retain its explanatory states. The generic rotate/spring/color and spinner loops depend on parent Mercury fix: confirm repeat Infinity is suppressed there.
3. Presence modes: change initial scale to 0.95, exit to 0.95; use 0.2s entrance and 0.15s exit, ease `[0.23, 1, 0.32, 1]`. Keep all three modes clearly labeled and preserve wait behavior. No need for artificial ease-in wait exit.
4. Dynamic-island label scale 0.95 with opacity and 2px blur, entrance 0.2s/exit 0.15s. Preserve island bounce and bell rocking. Tiny absolute width/height motions are exempt from speculative performance rewrites.
5. Create menu: retain configurable spring, shared IDs, and props API. Default contentOffsetY to 8, contentScale to 0.98, staggerInterval to 0; remove additional fixed 0.1 item delay. Content fades together as the shell opens. Do not rewrite the entire visual design or remove existing completion callbacks without evidence they are unnecessary.
6. Interactive badge pair: use a keyboard-focusable native trigger or correctly named focusable group, show expansion on focus as well as fine-pointer hover; touch activation should toggle explicitly. Keep a stable event boundary. CSS version gets `prefers-reduced-motion: reduce` transition override. No need to replace four tiny CSS layout transitions solely for performance.
7. Rotate demo's continuous rotation gets `ease: 'linear'`. Spinner uses duration 1 rather than 1.5. Basic-animation's explicit scale is educational; preserve meaningful scale change, optionally reduce duration from 1 to 0.5 and use `[0.23, 1, 0.32, 1]`. Stagger is purposefully uniform with 50ms intervals; preserve it, optionally make its entrance duration explicit 0.3 and y 24 instead of 64 so it fits a small stage.

## Conventions and scope

Use inline transitions and the existing layout/presence APIs. The zero-bounce 0.3s spring in advanced-dialogue is the ordinary UI exemplar, while explicit bounce/spring demos are intentionally different. Do not alter flip-array, flip, layout-animate, layout-position or layout-id merely to standardize duration. Do not touch parent-owned flip-size/layout-id-cards or Mercury library. Avoid blanket CSS `animation-duration: 0.001ms` overrides.

## Verification

Run existing type checks. Verify no direct CSS or Motion path remains ungated under reduced motion. When browser access is restored, switch preference live; CSS spring snaps to chosen state, loops stop, graph shows full artwork and manual demo controls still work. Replay all docs examples and playground-only examples listed in README. Scrub recordings of presence modes and create-menu opening: one coherent entrance and clear wait behavior. Check badges with mouse, keyboard and touch. Explicit bounce and stagger lessons must remain visibly distinct. Actual browser/device verification remains pending if tooling is unavailable.
