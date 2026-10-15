import type { MercuryOptions } from './animation-interface.js';
import { toRef } from './gestures/events.js';
import { attachNode, type LegacyOptions } from './node.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = Record<string, any>;

/** Map Mercury's Svelte-friendly options (and deprecated ones) onto Motion props. */
function toMotionProps(options: MercuryOptions = {}): { props: Props; legacy: LegacyOptions } {
	const {
		animateOnMount,
		dragOptions,
		scroll,
		callbacks,
		instance,
		onTapEnd,
		text,
		viewport,
		dragConstraints,
		...rest
	} = options;
	const props: Props = { ...rest };
	const legacy: LegacyOptions = { onTapEnd, instance };

	if (text !== undefined) props.children = text;
	if (viewport) props.viewport = { ...viewport, root: toRef(viewport.root) };
	// An element (e.g. from `bind:this`) becomes the `{ current }` ref Motion expects.
	if (dragConstraints !== undefined)
		props.dragConstraints = toRef(dragConstraints) ?? dragConstraints;

	if (animateOnMount === false && props.initial === undefined) props.initial = false;

	if (callbacks) {
		props.onAnimationStart ??= callbacks.onPlay && (() => callbacks.onPlay!());
		props.onAnimationComplete ??= callbacks.onComplete && (() => callbacks.onComplete!());
		props.onUpdate ??= callbacks.onUpdate;
		if (callbacks.onRepeat || callbacks.onStop) {
			props.transition = {
				...props.transition,
				onRepeat: callbacks.onRepeat,
				onStop: callbacks.onStop
			};
		}
	}

	if (dragOptions) {
		const { axis, bounds, rubberband } = dragOptions;
		if (props.drag === true && (axis === 'x' || axis === 'y')) props.drag = axis;
		if (axis === 'lock') props.dragDirectionLock ??= true;
		if (bounds && props.dragConstraints === undefined) {
			props.dragConstraints = toRef(bounds) ?? bounds;
		}
		if (rubberband !== undefined && props.dragElastic === undefined) {
			props.dragElastic = rubberband === true ? undefined : rubberband === false ? 0 : rubberband;
		}
	}

	if (scroll) {
		const { enter, exit, root, margin, amount, transition } = scroll;
		if (enter && props.whileInView === undefined) {
			props.whileInView = transition ? { ...enter, transition } : enter;
		}
		props.viewport ??= { root: toRef(root), margin, amount };
		if (exit) legacy.scrollExit = { target: exit, transition };
	}

	return { props, legacy };
}

/**
 * Animate an element with Motion: `{@attach mercury({ initial, animate, exit, whileHover, drag, … })}`.
 *
 * Takes Motion's `motion.*` component props. Attachments re-run when the state they read
 * changes; each run updates the same Motion node, so only what changed animates and
 * gestures in progress carry on — like a React re-render of a motion component.
 */
export const mercury = (options?: MercuryOptions) => {
	const { props, legacy } = toMotionProps(options);
	return (element: Element) => attachNode(element, props, legacy);
};
