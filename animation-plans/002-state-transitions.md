# 002 — Make state feedback coherent and interruption safe

- **Commit:** cf0f2e8
- **Severity:** HIGH for stale timers; MEDIUM for motion
- **Categories:** Interruptibility, easing/duration, cohesion
- **Estimated scope:** 10–11 mirrored files

## Problem and current code

`apps/docs/examples/copy-button.svelte:7` schedules an uncancelled reset on every click. A second click does not keep confirmation visible for one second after that latest click. Both icon exits use `scale: 0` at lines 18,25. Playground `components/copy-button.svelte` mirrors this.

`apps/docs/examples/feedback-popover.svelte:18,23` schedules success after 1500ms and close after 3300ms without clearing either on close or unmount. Playground `components/feedback-popover.svelte:25` also schedules an uncancelled 400ms reset. Closing and reopening can let an old operation mutate or dismiss the new form.

`apps/docs/examples/stateful-button.svelte:43` and playground `components/stateful-button/button.svelte:42` use `{ type: 'spring', duration: 1, bounce: 0 }` for text traveling 25px inside a 32px button. The spinner at line 28/25 takes 2.5s per revolution. Docs button defaults to undefined state, producing a blank standalone example.

`apps/docs/examples/gooey-button.svelte:25,34` and mirror have two child animations both delayed 200ms for 500ms after the parent already moves. Total entrance reaches 700ms. Outermost exit also delays 100ms.

## Target

- Copy icon entrance: opacity 0 to 1, scale 0.95 to 1, duration 0.15, ease `[0.23, 1, 0.32, 1]`; exit opacity 0, scale 0.95, duration 0.1, same curve. Reset 1000ms after latest activation by cancelling previous timeout, and clear it on component destruction. Native button minimum 44px and dynamic accessible name/status.
- Feedback has one owner for success/close/reset timers. Clear pending callbacks on close, reopen and destroy. Submit must require nonempty feedback and idle state for pointer and keyboard alike. Keep 1500ms loading simulation and 3300ms total flow. Reset stale form state before a new opening. Success entrance is opacity 0 to 1, y -8 to 0, blur 2px to 0, spring duration 0.3, bounce 0; outgoing form opacity 0/y 8/blur 2px over 0.15s. Keep layout morph around 0.3s and zero bounce; no delayed close reset if immediate reset is visually safe after DOM removal.
- Stateful button defaults to `'idle'`. Use typed `'idle' | 'loading' | 'success'` props as in playground button. Label entrance uses y -8, opacity 0, duration 0.3, bounce 0; exit y 8/opacity 0 over 0.15s. Spinner uses linear 1s. Minimum target height 44px. Retain disabled loading behavior and preserve supplied props. Make standalone Docs stateful example demonstrable if its current consumer does not supply state (do not break its use by feedback).
- Gooey parent moves with duration 0.3 and ease `[0.23, 1, 0.32, 1]`; content fades within 0.18s, delay 0.06; remove separate 20px grandchild movement so there is one entrance. Close returns y 78 over 0.2s with no delay; content fades over 0.12s.
- Exit-animation may use explicit opacity entrance 0.2s and exit 0.15s, same quint ease, retaining the reserved stage.

## Conventions and steps

Use Svelte `onDestroy` or effect cleanup for timers, native state rather than a new abstraction. Existing playground `components/stateful-button/button.svelte` is the typed presence exemplar. Keep Docs package imports and playground local imports.

1. Repair timers first in both copies and playground stateful demo wrapper, so rapid replay is deterministic.
2. Adjust icon and label presence values and button dimensions.
3. Simplify gooey hierarchy and update paired exit/entrance timing.
4. Check feedback consumes the stateful button correctly and all keyboard submit paths share validation.

## Scope and verification

No actual clipboard/network service is needed; these remain mock examples. Do not rewrite layout engine or unrelated shared-layout surfaces. Run repository type checks. Behavioral verification: click copy twice 600ms apart; success must remain until 1000ms after click two. Submit feedback, close at 500ms, reopen, wait past 3300ms: new form stays idle/open. Close and immediately reopen within 400ms: no reset races. Destroy a loading demo: no pending callbacks mutate it. When browser access returns, record/scrub icon/label swaps and rapid reopen; confirm no ghost content, long reading delay or scale-to-zero collapse. Check reduced motion in coordination with the library change. Report browser verification as unavailable when appropriate.
