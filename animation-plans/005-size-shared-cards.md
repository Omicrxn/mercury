# Size and shared card examples

- Commit audited: `cf0f2e8`
- Status: implemented; browser playback review pending
- Severity: high
- Categories: spatial consistency, interruptibility, accessibility

## Diagnosis

Both `apps/docs/examples/flip-size.svelte` and its playground mirror combined a centered flex row with `type: 'size'`. Resizing moved the box’s left edge, although size-only layout deliberately snaps position changes. The playground also squeezed a label into a 40px box. The demo now anchors the box at a fixed top-left position, reserves height for its larger state, uses widths of 64px and 144px, and marks its label as position-only. A 300ms spring with zero bounce animates the resize.

The shared card examples removed the selected list row, shifting all later rows. Images depended on third-party deployment URLs; the expanded panel was 500px wide. Both copies now use five bundled SVG mock covers, fixed-height list slots, instance-scoped layout IDs, and a panel that fits its container. Matching card, image, title and description IDs retain the shared-element transition. A 320ms zero-bounce spring moves the card, with 180ms backdrop entry and 140ms exit. The native card buttons open an accessible dialog with Escape dismissal and focus restoration.

## Files

- `apps/docs/examples/flip-size.svelte`
- `apps/docs/examples/layout-id-cards.svelte`
- `apps/docs/examples/assets/*.svg`
- Matching files under `packages/mercury/src/routes/tests/layout/`

## Verification

Compile both copies and build both apps. When a browser is available, open every card, dismiss through the backdrop and Escape, interrupt transitions, and repeat at 320px width. Check that later rows stay put, images load locally, and focus returns to the original card. Record the resize and shared transition at quarter speed, then review at normal speed. Repeat with reduced motion enabled. Browser runtime was unavailable during this session, so these visual checks remain pending.
