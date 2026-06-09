import { animate, type AnimationOptions, type AnimationPlaybackControls } from 'motion';
import type { AnimationTransition, PresenceAnimation } from './animation-interface.js';
import {
	completeWaitExit,
	registerWaitExit,
	runAfterPendingExit,
	stopMercury
} from './presence-coordinator.js';
import { mapTransitionToMotion } from './utils.js';
import { prefersReducedMotion } from './layout-anime.js';

type PresenceDirection = 'in' | 'out' | 'both';

interface PresenceState {
	controls: AnimationPlaybackControls;
	restore?: () => void;
}

const PRESENCE_STATE = Symbol('mercury:presence');
const WAIT_REGISTERED = Symbol('mercury:presence-wait');

type WithPresence = HTMLElement & {
	[PRESENCE_STATE]?: PresenceState;
	[WAIT_REGISTERED]?: boolean;
};

const TRANSFORM_IDENTITY: Record<string, number> = {
	x: 0,
	y: 0,
	z: 0,
	translateX: 0,
	translateY: 0,
	translateZ: 0,
	rotate: 0,
	rotateX: 0,
	rotateY: 0,
	rotateZ: 0,
	skew: 0,
	skewX: 0,
	skewY: 0,
	scale: 1,
	scaleX: 1,
	scaleY: 1,
	scaleZ: 1
};

const getNaturalValue = (element: HTMLElement, key: string): string | number => {
	if (key in TRANSFORM_IDENTITY) return TRANSFORM_IDENTITY[key];
	return (getComputedStyle(element) as unknown as Record<string, string>)[key] ?? '';
};

const resolveDurationMs = (
	controls: AnimationPlaybackControls,
	transition: AnimationTransition | undefined,
	fallbackMs: number
): number => {
	const motionMs =
		typeof controls.duration === 'number' && controls.duration > 0
			? controls.duration * 1000
			: fallbackMs;
	if (transition?.type === 'spring') return Math.max(motionMs, fallbackMs);
	return motionMs;
};

/**
 * Cancels any in-flight presence animation on the element and restores any inline
 * styles that were mutated (e.g. by popLayout). Called when a new presence/mercury
 * lifecycle starts on the same node so a reversed exit doesn't leave it stranded.
 */
export const clearPresence = (element: HTMLElement): void => {
	const el = element as WithPresence;
	const state = el[PRESENCE_STATE];
	if (!state) return;
	state.controls.stop();
	state.restore?.();
	if (el[WAIT_REGISTERED]) {
		completeWaitExit(element);
		el[WAIT_REGISTERED] = undefined;
	}
	el[PRESENCE_STATE] = undefined;
};

/**
 * Pops the element out of layout flow (mode: 'popLayout') so surrounding elements
 * reflow immediately while it animates out in place.
 *
 * Inset is left as `auto` so the browser keeps the static position after siblings
 * reflow. Width/height are frozen so the node doesn't collapse.
 */
const applyPopLayout = (element: HTMLElement): (() => void) => {
	const style = element.style;
	const saved = {
		position: style.position,
		width: style.width,
		height: style.height,
		boxSizing: style.boxSizing
	};

	const rect = element.getBoundingClientRect();

	let restoreParent: (() => void) | undefined;
	const parent = element.parentElement;
	if (parent && getComputedStyle(parent).position === 'static') {
		const savedParentPosition = parent.style.position;
		parent.style.position = 'relative';
		restoreParent = () => {
			parent.style.position = savedParentPosition;
		};
	}

	style.boxSizing = 'border-box';
	style.width = `${rect.width}px`;
	style.height = `${rect.height}px`;
	style.position = 'absolute';

	return () => {
		style.position = saved.position;
		style.width = saved.width;
		style.height = saved.height;
		style.boxSizing = saved.boxSizing;
		restoreParent?.();
	};
};

const buildKeyframes = (
	element: HTMLElement,
	targets: Record<string, unknown>,
	direction: 'in' | 'out'
): Record<string, unknown> => {
	if (direction === 'out') return targets;

	const keyframes: Record<string, [unknown, unknown]> = {};
	for (const key of Object.keys(targets)) {
		keyframes[key] = [targets[key], getNaturalValue(element, key)];
	}
	return keyframes;
};

/** Snap the element to the "from" values before a deferred intro begins. */
const applyFromState = (
	element: HTMLElement,
	targets: Record<string, unknown>
): AnimationPlaybackControls => animate(element, targets, { duration: 0 });

const registerOutWait = (element: HTMLElement, mode: PresenceAnimation['mode']): void => {
	if (mode !== 'wait') return;
	registerWaitExit(element);
	(element as WithPresence)[WAIT_REGISTERED] = true;
};

const finishOutWait = (element: HTMLElement): void => {
	const el = element as WithPresence;
	if (!el[WAIT_REGISTERED]) return;
	completeWaitExit(element);
	el[WAIT_REGISTERED] = undefined;
};

export const presence = (
	element: HTMLElement,
	params: PresenceAnimation,
	options: { direction: PresenceDirection }
) => {
	const el = element as WithPresence;
	clearPresence(element);

	const { transition, mode = 'sync', ...targets } = params;
	const delayMs = (transition?.delay ?? 0) * 1000;
	const fallbackDuration = (transition?.duration ?? 0.3) * 1000;

	if (prefersReducedMotion()) {
		return { delay: delayMs, duration: 0 };
	}

	const motionOptions = mapTransitionToMotion(transition) as AnimationOptions;
	const userOnComplete = motionOptions.onComplete;

	// Both `popLayout` and `wait` take the exiting element out of layout flow: popLayout so
	// siblings reflow immediately, wait so the (already-mounted but deferred) incoming element
	// can occupy the slot without displacing the element that's still animating out.
	const popsLayout = mode === 'popLayout' || mode === 'wait';

	const begin = (direction: 'in' | 'out', onDone?: () => void): AnimationPlaybackControls => {
		const restore = direction === 'out' && popsLayout ? applyPopLayout(element) : undefined;
		let state: PresenceState;
		const controls = animate(element, buildKeyframes(element, targets, direction), {
			...motionOptions,
			onComplete: () => {
				userOnComplete?.();
				if (el[PRESENCE_STATE] === state) el[PRESENCE_STATE] = undefined;
				onDone?.();
			}
		});
		state = { controls, restore };
		el[PRESENCE_STATE] = state;
		return controls;
	};

	if (options.direction === 'both') {
		let started = false;
		let outgoing = false;
		let waitDone = false;
		const finishOnce = () => {
			if (waitDone) return;
			waitDone = true;
			finishOutWait(element);
		};

		return {
			delay: delayMs,
			duration: fallbackDuration,
			tick: (t: number) => {
				if (!started) {
					started = true;
					// First tick decides direction: an outro starts near 1, an intro near 0.
					outgoing = t > 0.5;

					if (outgoing) {
						registerOutWait(element, mode);
						stopMercury(element);
						begin('out', finishOnce);
					} else {
						applyFromState(element, targets);
						runAfterPendingExit(element, () => begin('in'));
					}
					return;
				}

				// Outro completes when Svelte ticks down to 0.
				if (outgoing && t <= 0) finishOnce();
			}
		};
	}

	if (options.direction === 'in') {
		applyFromState(element, targets);
		let started = false;
		return {
			delay: delayMs,
			duration: fallbackDuration,
			tick: () => {
				if (started) return;
				started = true;
				runAfterPendingExit(element, () => begin('in'));
			}
		};
	}

	registerOutWait(element, mode);
	stopMercury(element);

	let waitDone = false;
	const finishOnce = () => {
		if (waitDone) return;
		waitDone = true;
		finishOutWait(element);
	};

	const controls = begin('out', finishOnce);
	const resolvedDuration = resolveDurationMs(controls, transition, fallbackDuration);

	// Svelte outro end is the reliable signal — Motion onComplete may not fire once
	// the node is removed from the document. During an outro Svelte ticks `t` from 1 → 0
	// and emits a final `tick(0, ...)`, so completion is `t <= 0` (not the start, `t >= 1`).
	return {
		delay: delayMs,
		duration: resolvedDuration,
		tick: (t: number) => {
			if (t <= 0) finishOnce();
		}
	};
};
