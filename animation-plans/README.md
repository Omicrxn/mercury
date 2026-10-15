# Example animation audit

Audited commit: `cf0f2e8`. The initial audit was based on source inspection. The user subsequently requested targeted corrections and restoration of the dynamic island, create button, and copy button. Those restorations supersede the corresponding audit recommendations below. The corrected examples have now been exercised in headless Chrome on both local sites.

Stack: Svelte 5 attachments/actions, Mercury over Motion v14, Tailwind 4. Transitions are inline; there is no shared duration/easing token system. The examples teach animation, so deliberate bounce, visible travel, uniform stagger and occasional replay are valid. Do not apply daily-dashboard frequency rules indiscriminately.

| Order | Plan | Status | Dependency |
| --- | --- | --- | --- |
| 1 | [001 — Gesture feedback](001-gesture-feedback.md) | IMPLEMENTED | None |
| 2 | [002 — State transitions and timer interruption](002-state-transitions.md) | IMPLEMENTED | None |
| 3 | [003 — Pointer and scroll examples](003-pointer-scroll.md) | IMPLEMENTED | None |
| 4 | [004 — Motion preference and remaining examples](004-motion-preference.md) | IMPLEMENTED | Shared Mercury preference handling included |
| 5 | [005 — Size and shared cards](005-size-shared-cards.md) | IMPLEMENTED | Bundled SVG assets |

The size and shared-card repairs are recorded in [005 — Size and shared cards](005-size-shared-cards.md). Both copies now use bundled mock artwork. Shared Mercury transitions respect reduced motion, with three regression tests that exercise the installed Motion engine.

All eight audit categories were applied to each surface: purpose/frequency; easing/duration; physicality/origin; interruption/springs; performance; accessibility; cohesion/spatial consistency; missed opportunities. The table records findings or the reason to leave a surface alone. Paths in the Docs column mean `apps/docs/examples/<name>.svelte`; mirrors mean `packages/mercury/src/routes/tests/<category>/<name>.svelte` unless stated otherwise.

| Docs example | Playground mirror | Audit result |
| --- | --- | --- |
| advanced-dialogue | components | Plan 001: excessive press scale, 24px close hitbox. Existing 0.3s zero-bounce shell is a good convention; centered modal origin is exempt. |
| animated-navbar | components | Shared-layout indicator and 0.35s zero-bounce spring are appropriate educational movement; Docs tab and orientation control hitboxes need 44px minimum. |
| basic-animation | animation | Explicit scale demonstration permits visible scaling; optional response polish in 004, common reduced-motion gap. |
| bouncing-easing | animation | Preserve 1.2s custom bounce and spring comparison; use a native button for click-only track. Common reduced-motion gap. |
| color-interpolation | animation | Linear color loop is a valid interpolation demonstration; freeze autoplay under reduce. |
| copy-button | components | Plan 002: stale reset timers, scale-to-zero exit, Docs 36px unlabeled icon control. |
| css-spring | animation | Explicit CSS spring is valid; missing reduced-motion CSS in 004. |
| drag | gestures | Direct pointer drag with release rubberband is appropriate; Docs fixed 400px container overflows narrow viewports. No speculative frame-rate defect filed. |
| exit-animation | animation | Opacity-only entrance/exit is appropriate; explicit faster exit is optional in 002. |
| feedback-popover | components | Plan 002: old timers mutate reopened form, long success displacement; shell shared-layout continuity is appropriate. |
| flip-array | layout | Stable keyed children, Fisher-Yates shuffle, position-only FLIP are clean; deliberate 0.4s layout explanation is exempt. |
| flip-size | layout | Parent-owned diagnosis; excluded from this audit. |
| flip | layout | Clean explanatory FLIP; 0.4s travel is justified by demonstration. |
| gooey-button | components | Plans 001/002: 0.6 press scale and delayed duplicate entrances. Retain gooey identity. |
| hover | gestures | Plan 001: 1.25 scale and 0.5s response are excessive. |
| interactive-graph | components | Plan 003: static slow spring selection, lagging pointer tracking and missing cleanup. |
| layout-animate | layout | Nested position-only label correction is good; bounce 0.2 is intentional spring demonstration. |
| layout-id-cards | layout | Parent-owned diagnosis and mock images; excluded from this audit. |
| layout-id | layout | Clean shared geometry; retain distinct child color change. |
| layout-position | layout | Position-only text and contrasting shared pill spring teach API behavior; do not homogenize them. |
| scroll | gestures | Plan 003: document-global root selection, rapidly looping arrow, 1s observer transition. |
| stagger | animation | Three equal examples with 50ms gaps are the purpose; preserve uniform stagger. Common reduced-motion gap. |
| stateful-button | components/stateful-button/button.svelte plus components/stateful-button.svelte wrapper | Plan 002: 1s label motion/25px travel in 32px button; loading rotation needs reduced-motion support. |
| tap | gestures | Plan 001: 0.5 press scale, 0.5s response; playground adds 1.5 hover. |

| Playground-only surface | Audit result |
| --- | --- |
| animation/animate-presence-modes.svelte | Plan 004: scale 0.6 initial and 0.8 exit distract from modes; maintain a visible wait phase. |
| animation/rotate.svelte | Use linear constant rotation; common reduced-motion gap. |
| animation/spring.svelte | Explicit repeated spring demonstrates behavior; preserve personality, freeze under reduce. |
| animation/svg-loading-spinner.svelte | Linear rotation is correct; 1.5s cycle can be shortened to 1s, freeze under reduce. |
| components/create-button.svelte | Parent morph plus 40px child rise plus item delays to 350ms creates competing entrances; plan 004. Respect configurable spring props. |
| components/dynamic-island.svelte and dynamic-island/ring.svelte | Bounce is deliberate playful island behavior; small/absolute width and height animations are performance exceptions. Automatic 2s toggling must stop under reduce; label scale 0.25 is excessive (004). |
| layout/interactive-badge.svelte | Layout supports reduced motion; mouse-only hover misses touch/keyboard parity (004). |
| layout/interactive-badge-css.svelte | Tiny four-row layout animation is a performance exception; missing reduced-motion CSS and keyboard/touch parity (004). |
| layout/reordering-layout.svelte | Autoshuffle persists under reduce despite layout snapping; pause it under reduce. Reset also shares mutable initial array (004). |

Performance: no measured dropped frames, parent CSS-variable animation, heavy React/state rerender loop, `transition: all`, or blur above 20px was found. Do not mechanically rewrite every x/y shorthand. Accessibility: layout and presence already call `prefersReducedMotion()`; Mercury animate, hover/tap/scroll and direct Motion examples do not. Tailwind 4 hover classes and Motion hover are already preferable to custom touch hover.

Missed opportunities, separately from corrective findings: native button press feedback on copy/feedback controls, faster spinner, and a subtle button-label state crossfade improve acknowledgment. Do not add decorative motion to every control. No repository instruction injection was encountered in the files read.

## Validation

- `pnpm --filter @omicrxn/mercury check`: passed, with one existing autofocus warning in feedback-popover.
- `pnpm --filter @omicrxn/mercury test`: three Motion-engine regression tests passed.
- `pnpm --filter @omicrxn/mercury build`: passed, including package validation.
- `pnpm --filter @omicrxn/mercury-docs validate`: passed.
- `pnpm --filter @omicrxn/mercury-docs build --isolated`: passed, 56 pages built without disturbing the active docs server.
- Five SVG assets parse and match across both demos; both repaired Svelte demo pairs match apart from their library import.
- `git diff --check`: passed.
- Headless Chrome: corrected gooey button, feedback popover, navbar, scroll, and cards exercised on both sites at 1100px and 390px viewport widths. Navbar bounds sampled on every animation frame; card content checked before and after its fade. All five images load in both versions.
- Restored dynamic island, create button, and copy button exercised in the playground. Reduced-motion behavior checked for the five corrected examples on both sites.
- All 23 docs examples load and hydrate without page errors. All 24 example/component source pairs match after allowing for imports, preview height, replay binding, and formatting.
- Rapid reversals and feedback timer cancellation pass on both sites. Gooey open/close also passes at both viewport widths with normal and reduced motion.
- Physical-device and measured frame-rate checks have not been performed.

## Corrections after user feedback

- Restored the original dynamic island, ring, create button, and copy button. The dynamic island restoration preserves the user's changes that preceded this audit.
- Restored the gooey button's separating circle and staged panel reveal inside a stable container. Persistent nodes retarget from their current state when the user reverses direction.
- Made the feedback popover its text's positioning container. Its label remains inside after the layout transform clears. Outside clicks use a capture listener, avoiding the debounced dependency's rejected cancellation when closing during submission.
- Included the navbar shell in layout projection, clipped its content, and kept the orientation control stationary.
- Restored visible scroll-driven travel and rotation with a local scroll root and enough room for the box.
- Clipped expanded cards and separated the body's opacity animation from layout projection. The body starts hidden and appears as the card expands. Mock SVG imports use `?url` so Astro and Svelte receive image URLs.
- Synchronized docs examples with the playground, including the feedback button dependency. Docs retain a compact preview height and the basic example's replay binding.
