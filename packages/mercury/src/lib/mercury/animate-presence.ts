import {
	animate,
	type AnimationOptions,
	type AnimationPlaybackControls,
	type DOMKeyframesDefinition
} from 'motion';
import type {
	AnimationAttributes,
	AnimationTransition,
	PresenceAnimation,
	PresenceMode
} from './animation-interface.js';
import {
	completeWaitExit,
	registerWaitExit,
	runAfterPendingExit,
	stopMercury
} from './presence-coordinator.js';
import { mapTransitionToMotion } from './utils.js';
import { prefersReducedMotion } from './layout-anime.js';

type PresenceDirection = 'in' | 'out' | 'both';
type PlayDirection = 'in' | 'out';

interface PresenceTransitionConfig {
	delay?: number;
	duration?: number;
	tick?: (t: number, u: number) => void;
}

/**
 * Svelte supports deferred transitions (the mechanism behind `crossfade`): returning a
 * function instead of a config makes Svelte call it in a microtask with the *actual* play
 * direction. This is what lets a single `transition:presence` behave like AnimatePresence —
 * we build the enter or exit animation only once we know which one is playing, and can
 * report the real (e.g. spring-resolved) exit duration to Svelte.
 */
type PresenceResult =
	| PresenceTransitionConfig
	| ((opts?: { direction: PlayDirection }) => PresenceTransitionConfig);

interface PresenceState {
	controls: AnimationPlaybackControls;
	direction: PlayDirection;
	restore?: () => void;
}

interface ResolvedSpec {
	targets: Record<string, unknown>;
	transition?: AnimationTransition;
}

const PRESENCE_STATE = Symbol('mercury:presence');
const WAIT_REGISTERED = Symbol('mercury:presence-wait');
const NATURAL_VALUES = Symbol('mercury:presence-natural');

type WithPresence = HTMLElement & {
	[PRESENCE_STATE]?: PresenceState;
	/** Token identifying the play that registered a wait-mode exit on this element. */
	[WAIT_REGISTERED]?: object;
	[NATURAL_VALUES]?: Record<string, string | number>;
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

/**
 * "Natural" values are the element's settled styles — what an enter animates towards and a
 * reversed exit recovers to. They're snapshotted while the element is at rest, because
 * reading computed styles mid-animation would capture transient values.
 */
const snapshotNaturalValues = (element: HTMLElement, keys: string[]): void => {
	const el = element as WithPresence;
	const store = (el[NATURAL_VALUES] ??= {});
	for (const key of keys) {
		if (!(key in store)) store[key] = getNaturalValue(element, key);
	}
};

const naturalValueOf = (element: HTMLElement, key: string): string | number =>
	(element as WithPresence)[NATURAL_VALUES]?.[key] ?? getNaturalValue(element, key);

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

/**
 * Splits a spec into animation targets and its (possibly shared) transition.
 * `transition` and `mode` keys are configuration, everything else is animated.
 */
const resolveSpec = (
	raw: AnimationAttributes | undefined,
	shared?: AnimationTransition
): ResolvedSpec | undefined => {
	if (!raw) return undefined;
	const { transition, mode: _mode, ...targets } = raw;
	if (Object.keys(targets).length === 0) return undefined;
	return { targets, transition: transition ?? shared };
};

const finishOutWait = (element: HTMLElement): void => {
	const el = element as WithPresence;
	if (!el[WAIT_REGISTERED]) return;
	completeWaitExit(element);
	el[WAIT_REGISTERED] = undefined;
};

/**
 * Svelte-native AnimatePresence.
 *
 * Used as a transition directive, so Svelte's semantics map directly onto motion/react's:
 *
 * - `transition:presence={{ initial, exit, mode, transition }}` — like a child of
 *   `<AnimatePresence>`: on enter the element animates from `initial` to its settled
 *   CSS styles, on removal it animates to `exit`.
 * - Local transitions don't run when an ancestor block mounts, which is exactly
 *   `<AnimatePresence initial={false}>`. Use `transition:presence|global` to opt in.
 * - `mode: 'sync' | 'wait' | 'popLayout'` matches AnimatePresence's `mode`.
 * - Flat params (`out:presence={{ opacity: 0 }}`) describe the hidden state for both
 *   directions: enters animate from it, exits animate to it.
 *
 * In `initial`, array values are treated as full keyframes (`opacity: [0, 0.5, 1]`).
 */
export const presence = (
	element: HTMLElement,
	params: PresenceAnimation,
	options: { direction: PresenceDirection }
): PresenceResult => {
	const el = element as WithPresence;
	const wasAnimating = el[PRESENCE_STATE] !== undefined;
	clearPresence(element);

	const { transition, mode: sharedMode, initial, exit, ...flat } = params;
	const structured = initial !== undefined || exit !== undefined;
	const enterSpec = resolveSpec(structured ? initial : flat, transition);
	const exitSpec = resolveSpec(structured ? exit : flat, transition);
	const mode: PresenceMode = sharedMode ?? exit?.mode ?? 'sync';

	if (prefersReducedMotion()) return { duration: 0 };

	// This runs at play start, before any animation begins — refresh the settled-value
	// snapshot when the element is at rest, so reversals have reliable targets.
	if (!wasAnimating) el[NATURAL_VALUES] = undefined;
	snapshotNaturalValues(element, [
		...(enterSpec ? Object.keys(enterSpec.targets) : []),
		...(exitSpec ? Object.keys(exitSpec.targets) : [])
	]);

	// Wait-mode exits must register *synchronously*: Svelte creates the incoming branch
	// (whose enters check for pending exits) in the same flush, possibly before this play's
	// deferred config resolves. For `transition:` we can't know the direction yet, so the
	// registration is provisional — released as soon as the play resolves to an enter.
	let resolved = false;
	let waitToken: object | undefined;

	const releaseWait = () => {
		if (!waitToken || el[WAIT_REGISTERED] !== waitToken) return;
		el[WAIT_REGISTERED] = undefined;
		completeWaitExit(element);
	};

	if (mode === 'wait' && exitSpec && options.direction !== 'in') {
		waitToken = {};
		registerWaitExit(element);
		el[WAIT_REGISTERED] = waitToken;
		// Safety net: if the play is aborted before its deferred config ever resolves,
		// release the registration so enters in this scope aren't deferred forever.
		setTimeout(() => {
			if (!resolved) releaseWait();
		}, 0);
	}

	// Both `popLayout` and `wait` take the exiting element out of layout flow: popLayout so
	// siblings reflow immediately, wait so the (already-mounted but deferred) incoming element
	// can occupy the slot without displacing the element that's still animating out.
	const popsLayout = mode === 'popLayout' || mode === 'wait';

	const begin = (
		direction: PlayDirection,
		keyframes: Record<string, unknown>,
		specTransition?: AnimationTransition,
		onDone?: () => void
	): AnimationPlaybackControls => {
		const restore = direction === 'out' && popsLayout ? applyPopLayout(element) : undefined;
		const motionOptions = mapTransitionToMotion(specTransition) as AnimationOptions;
		const userOnComplete = motionOptions.onComplete;
		let state: PresenceState;
		const controls = animate(element, keyframes as DOMKeyframesDefinition, {
			...motionOptions,
			onComplete: () => {
				userOnComplete?.();
				if (el[PRESENCE_STATE] === state) el[PRESENCE_STATE] = undefined;
				onDone?.();
			}
		});
		state = { controls, direction, restore };
		el[PRESENCE_STATE] = state;
		return controls;
	};

	const runEnter = (): void => {
		// An exit may still be in flight if this enter reverses it (the block was resurrected
		// mid-outro). Animate from wherever the exit left off back to the settled state
		// instead of replaying the intro from its hidden keyframes.
		const reversesExit = el[PRESENCE_STATE]?.direction === 'out';
		clearPresence(element);

		if (!enterSpec) {
			// Exit-only spec: don't leave a reversed exit frozen mid-animation — settle back.
			if (reversesExit && exitSpec) {
				const recovery: Record<string, unknown> = {};
				for (const key of Object.keys(exitSpec.targets)) {
					recovery[key] = naturalValueOf(element, key);
				}
				begin('in', recovery, exitSpec.transition);
			}
			return;
		}

		const { targets } = enterSpec;
		const keyframes: Record<string, unknown> = {};

		if (reversesExit) {
			for (const key of Object.keys(targets)) {
				const value = targets[key];
				keyframes[key] = Array.isArray(value)
					? value[value.length - 1]
					: naturalValueOf(element, key);
			}
		} else {
			const from: Record<string, unknown> = {};
			for (const key of Object.keys(targets)) {
				const value = targets[key];
				if (Array.isArray(value)) {
					keyframes[key] = value;
					from[key] = value[0];
				} else {
					keyframes[key] = [value, naturalValueOf(element, key)];
					from[key] = value;
				}
			}
			// Snap to the hidden state immediately so the element doesn't flash its settled
			// styles while a wait-mode exit defers the intro.
			animate(element, from as DOMKeyframesDefinition, { duration: 0 });
		}

		runAfterPendingExit(element, () => {
			if (!element.isConnected) return;
			begin('in', keyframes, enterSpec.transition);
		});
	};

	const recoverFromExit = (): void => {
		if (el[PRESENCE_STATE]?.direction !== 'out') return;
		runEnter();
	};

	const runExit = (): PresenceTransitionConfig => {
		if (!exitSpec) return { duration: 0 };

		stopMercury(element);

		let finished = false;
		const finishOnce = () => {
			if (finished) return;
			finished = true;
			finishOutWait(element);
		};

		const controls = begin('out', exitSpec.targets, exitSpec.transition, finishOnce);
		const fallbackMs = (exitSpec.transition?.duration ?? 0.3) * 1000;
		let sawProgress = false;

		return {
			delay: (exitSpec.transition?.delay ?? 0) * 1000,
			duration: resolveDurationMs(controls, exitSpec.transition, fallbackMs),
			tick: (t: number) => {
				// `out:`-only directives never get an 'in' play on reversal — Svelte aborts the
				// outro and emits a reset `tick(1, 0)` instead. Recover by animating back.
				if (t >= 1) {
					if (sawProgress) recoverFromExit();
					return;
				}
				sawProgress = true;
				// Svelte's outro end is the reliable removal signal — Motion's onComplete may
				// not fire once the node leaves the document.
				if (t <= 0) finishOnce();
			}
		};
	};

	return (opts) => {
		resolved = true;
		if ((opts?.direction ?? options.direction) === 'in') {
			releaseWait();
			runEnter();
			// Motion drives the visuals; a zero-length intro keeps Svelte's bookkeeping out of
			// the way (an interrupted intro would otherwise scale down the exit's duration).
			return { duration: 0 };
		}
		return runExit();
	};
};
