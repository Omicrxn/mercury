# 001 — Make gesture feedback respond promptly

- **Commit:** cf0f2e8
- **Severity:** MEDIUM
- **Categories:** Easing/duration, physicality, accessibility
- **Estimated scope:** 10 mirrored files, roughly 100 lines

## Problem and current code

`apps/docs/examples/hover.svelte:12` has `whileHover: { scale: 1.25, transition: { duration: 0.5, type: 'spring' } }`. `tap.svelte:13` uses `scale: 0.5` with the same half-second duration. Playground gesture mirrors carry the same settings; `gestures/tap.svelte:21` additionally uses hover scale 1.5. These targets exaggerate basic feedback and delay reversal.

`apps/docs/examples/gooey-button.svelte:57` and its `components` mirror use `whileTap: { scale: 0.6 }`; `advanced-dialogue.svelte:42,87` and mirror use 0.9. The gooey transition is placed at top level despite there being no animate block: gesture code only reads the transition inside `whileTap`.

## Target

- Hover scale 1.02, tap scale 0.97. Set the transition within each gesture: `{ type: 'spring', duration: 0.15, bounce: 0 }`.
- Remove the unrelated scale(0.4) mount entrance from hover/tap, including redundant `animate: { scale: 1 }`; their purpose is interaction. Native buttons should be 64px square, `type="button"`, with names such as `Hover animation` and `Press animation` and visible keyboard focus.
- Keep the gooey effect; use a native 48px button with `aria-label`, `aria-expanded`, and 0.97 press.
- Keep advanced-dialogue shared layout unchanged; change both press targets to 0.97 and ensure the close button has a centered 44px hitbox without moving the visible 24px icon.
- Increase Docs animated-navbar tab and orientation button targets to at least 44px, preserving their indicator structure.

The 150ms budget and 1.02/0.97 scales come directly from AUDIT.md. `advanced-dialogue.svelte:7` already models duration-based springs with `bounce: 0`; follow that inline convention.

## Steps

1. Update the four Docs gesture/component files and respective playground mirrors (`gestures/hover.svelte`, `gestures/tap.svelte`, `components/gooey-button.svelte`, `components/advanced-dialogue.svelte`). Preserve playground headings and Docs imports.
2. Apply minimum targets to animated-navbar Docs and mirror where needed.
3. Give click-only bouncing-easing track a native button and label in both locations; preserve the custom bounce function and 1.2s duration.

## Scope and verification

Do not change library gesture implementation, flip-size, layout-id-cards, demo teaching springs, or introduce a library/token system. Type-check using existing package checks. When browser access is available, rapidly enter/leave and press/release, including release outside; no scale should stick. Compare keyboard Space/Enter with pointer input and emulate reduce. Record and scrub press/release; response should start immediately and settle within 150ms. Real touch-device verification remains pending if no device is available.
