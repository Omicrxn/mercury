import {
	animate,
	resolveVariant,
	transformProps,
	type AnimationOptions,
	type AnimationPlaybackControls,
	type DOMKeyframesDefinition,
	type Transition
} from 'motion';
import type { PresenceAnimation, PresenceMode } from './animation-interface.js';
import {
	getMercuryNode,
	getVisualElement,
	hideUntilExitCompletes,
	type MercuryNode
} from './node.js';
import { completeWaitExit, hasPendingWaitExit, registerWaitExit } from './presence-coordinator.js';
import { mapTransitionToMotion, prefersReducedMotion } from './utils.js';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

/** An exit played by the element's `mercury()` node (its `exit` prop). */
interface NodeExitState {
	node: MercuryNode;
	restore?: () => void;
}

interface ResolvedSpec {
	targets: Record<string, unknown>;
	transition?: Transition;
}

const PRESENCE_STATE = Symbol('mercury:presence');
const NODE_EXIT = Symbol('mercury:presence-node-exit');
const WAIT_REGISTERED = Symbol('mercury:presence-wait');
const NATURAL_VALUES = Symbol('mercury:presence-natural');
const AUTHORED_STYLES = Symbol('mercury:presence-authored');

type WithPresence = HTMLElement & {
	[PRESENCE_STATE]?: PresenceState;
	[NODE_EXIT]?: NodeExitState;
	/** Token identifying the play that registered a wait-mode exit on this element. */
	[WAIT_REGISTERED]?: object;
	[NATURAL_VALUES]?: Record<string, string | number>;
	[AUTHORED_STYLES]?: Record<string, string>;
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

const NUMERIC = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

const getNaturalValue = (element: HTMLElement, key: string): string | number => {
	if (key in TRANSFORM_IDENTITY) return TRANSFORM_IDENTITY[key];
	const computed = getComputedStyle(element);
	const value = key.startsWith('--')
		? computed.getPropertyValue(key).trim()
		: ((computed as unknown as Record<string, string>)[key] ?? '');
	// Computed styles are strings, and Motion doesn't animate a number into a numeric
	// string (`0` → `"1"` would jump), so unitless values like opacity become numbers.
	return NUMERIC.test(value) ? parseFloat(value) : value;
};

/**
 * "Natural" values are the element's settled styles — what an enter animates towards and a
 * reversed exit recovers to. They're snapshotted while the element is at rest, because
 * reading computed styles mid-animation would capture transient values.
 */
const snapshotNaturalValues = (element: HTMLElement, keys: string[]): void => {
	const el = element as WithPresence;
	const store = (el[NATURAL_VALUES] ??= {});
	const authored = (el[AUTHORED_STYLES] ??= {});
	for (const key of keys) {
		if (!(key in store)) store[key] = getNaturalValue(element, key);
		if (!(key in authored) && !transformProps.has(key))
			authored[key] = readInlineStyle(element, key);
	}
};

const naturalValueOf = (element: HTMLElement, key: string): string | number =>
	(element as WithPresence)[NATURAL_VALUES]?.[key] ?? getNaturalValue(element, key);

const readInlineStyle = (element: HTMLElement, key: string) =>
	key.startsWith('--')
		? element.style.getPropertyValue(key)
		: ((element.style as unknown as Record<string, string>)[key] ?? '');

/**
 * Once an enter settles, hand the animated styles back to the element's CSS — its
 * resting state — instead of pinning the values Motion measured: a `height: 0` enter
 * would otherwise leave `height: 120px` inline and stop following its content, and an
 * inline `opacity` would override hover styles. Values the element's `mercury()` node
 * animates stay with it.
 */
function releaseToCss(element: HTMLElement, keys: string[]) {
	const el = element as WithPresence;
	const authored = el[AUTHORED_STYLES];
	const node = getMercuryNode(element);
	const owned = node ? ownedKeys(node) : undefined;
	const visualElement = getVisualElement(element);
	for (const key of keys) {
		if (transformProps.has(key) || owned?.has(key) || !authored || !(key in authored)) continue;
		visualElement.removeValue(key);
		if (key.startsWith('--')) element.style.setProperty(key, authored[key]);
		else (element.style as unknown as Record<string, string>)[key] = authored[key];
	}
	el[AUTHORED_STYLES] = undefined;
}

/** Keys the node's own props animate or render. */
function ownedKeys(node: MercuryNode): Set<string> {
	const keys = new Set<string>();
	const props = node.visualElement.getProps();
	for (const type of [
		'initial',
		'animate',
		'whileHover',
		'whileTap',
		'whileFocus',
		'whileInView',
		'whileDrag',
		'exit'
	]) {
		const definition = props[type];
		const list = Array.isArray(definition) ? definition : [definition];
		for (const item of list) {
			if (!item || typeof item === 'boolean') continue;
			const resolved = resolveVariant(node.visualElement, item);
			if (resolved) for (const key in resolved) keys.add(key);
		}
	}
	for (const key in props.style ?? {}) keys.add(key);
	return keys;
}

const resolveDurationMs = (
	controls: AnimationPlaybackControls,
	transition: Transition | undefined,
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
 * styles that were mutated (e.g. by popLayout). Called when a new presence lifecycle
 * starts on the same node so a reversed exit doesn't leave it stranded.
 */
const clearPresence = (element: HTMLElement): void => {
	const el = element as WithPresence;
	const state = el[PRESENCE_STATE];
	if (!state) return;
	state.controls.stop();
	state.restore?.();
	finishOutWait(element);
	el[PRESENCE_STATE] = undefined;
};

/** Per parent: how many children popLayout popped, and its position before the first. */
const poppedParents = new WeakMap<HTMLElement, { count: number; position: string | undefined }>();

/**
 * Pops the element out of layout flow (mode: 'popLayout') so surrounding elements
 * reflow immediately while it animates out in place.
 *
 * Like Motion's PopChild, the element is pinned at its measured offset and size:
 * leaving the inset `auto` only keeps its place in block layout — in a flex or grid
 * container an absolutely positioned child moves to the container's start. The parent
 * becomes the containing block (`position: relative`) while any child is popped.
 */
const applyPopLayout = (element: HTMLElement): (() => void) => {
	const style = element.style;
	const saved = {
		position: style.position,
		top: style.top,
		left: style.left,
		width: style.width,
		height: style.height,
		boxSizing: style.boxSizing
	};

	const parent = element.parentElement;
	if (parent) {
		const popped = poppedParents.get(parent);
		if (popped) {
			popped.count++;
		} else {
			const isStatic = getComputedStyle(parent).position === 'static';
			poppedParents.set(parent, {
				count: 1,
				position: isStatic ? parent.style.position : undefined
			});
			if (isStatic) parent.style.position = 'relative';
		}
	}

	const computed = getComputedStyle(element);
	const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = element;
	style.boxSizing = 'border-box';
	style.width = `${offsetWidth}px`;
	style.height = `${offsetHeight}px`;
	style.top = `${offsetTop - parseFloat(computed.marginTop)}px`;
	style.left = `${offsetLeft - parseFloat(computed.marginLeft)}px`;
	style.position = 'absolute';

	let restored = false;
	return () => {
		if (restored) return;
		restored = true;
		Object.assign(style, saved);
		const popped = parent && poppedParents.get(parent);
		if (!popped || --popped.count > 0) return;
		poppedParents.delete(parent);
		if (popped.position !== undefined) parent.style.position = popped.position;
	};
};

/**
 * Splits a spec into animation targets and its (possibly shared) transition.
 * `transition` and `mode` keys are configuration, everything else is animated.
 */
const resolveSpec = (raw: object | undefined, shared?: Transition): ResolvedSpec | undefined => {
	if (!raw) return undefined;
	const { transition, mode: _mode, ...targets } = raw as Record<string, any>;
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
 * A finished exit lets a waiting enter start. The exiting element is hidden first: Svelte
 * may only remove it a frame later, and the entering element must not share the page with it.
 */
function completeExit(element: HTMLElement, mode: PresenceMode) {
	if (mode === 'wait' && (element as WithPresence)[WAIT_REGISTERED]) element.style.display = 'none';
	finishOutWait(element);
}

/**
 * End Svelte's outro now. Svelte needs a duration up front, but an exit driven by Motion's
 * animation state (variants, `staggerChildren`, `when`) only knows it's done when its
 * promise resolves — so the outro gets a generous duration and is finished early.
 * Svelte times it with an empty WAAPI animation on the element.
 */
function finishSvelteOutro(element: HTMLElement) {
	for (let pass = 0; pass < 2; pass++) {
		for (const animation of element.getAnimations()) {
			const effect = animation.effect as KeyframeEffect | null;
			if (effect?.getKeyframes().length === 0 && animation.playState !== 'finished') {
				animation.finish();
			}
		}
	}
}

/** A safe upper bound for an exit run by Motion's animation state, in ms. */
function estimateExitMs(node: MercuryNode): number {
	const walk = (visualElement: any): number => {
		let own = 0;
		visualElement.values.forEach((value: any) => {
			if (!value.isAnimating()) return;
			try {
				own = Math.max(own, value.animation?.duration ?? 0);
			} catch {
				// An animation that can't report a duration is covered by the padding.
			}
		});
		let children = 0;
		let count = 0;
		visualElement.variantChildren?.forEach((child: any) => {
			children = Math.max(children, walk(child));
			count++;
		});
		const { exit } = visualElement.getProps();
		const transition: any =
			(exit && resolveVariant(visualElement, exit)?.transition) ??
			visualElement.getDefaultTransition() ??
			{};
		const numeric = (value: unknown) => (typeof value === 'number' ? value : 0);
		const orchestration =
			numeric(transition.delay) +
			numeric(transition.delayChildren) +
			numeric(transition.staggerChildren) * count;
		return own + orchestration + children;
	};
	return Math.max(1000, walk(node.visualElement) * 1500 + 500);
}

/**
 * Svelte-native AnimatePresence.
 *
 * Used as a transition directive, so Svelte's semantics map directly onto motion/react's:
 *
 * - `{@attach mercury({ initial, animate, exit })}` + `transition:presence` — like a child of
 *   `<AnimatePresence>`: Svelte keeps the element until its `exit` (variants included) has
 *   played. `mode`, `custom` and `onExitComplete` go on `presence`.
 * - `transition:presence={{ initial, exit, mode, transition }}` — the shorthand without a
 *   `mercury()` attachment: on enter the element animates from `initial` to its settled
 *   CSS styles, on removal it animates to `exit`.
 * - Local transitions don't run when an ancestor block mounts, which is exactly
 *   `<AnimatePresence initial={false}>`. Use `transition:presence|global` to opt in.
 * - Flat params (`out:presence={{ opacity: 0 }}`) describe the hidden state for both
 *   directions: enters animate from it, exits animate to it.
 *
 * In `initial`, array values are treated as full keyframes (`opacity: [0, 0.5, 1]`).
 */
export const presence = (
	element: HTMLElement,
	params: PresenceAnimation | undefined,
	options: { direction: PresenceDirection }
): PresenceResult => {
	const el = element as WithPresence;
	const wasAnimating = el[PRESENCE_STATE] !== undefined;
	clearPresence(element);

	const {
		transition,
		mode: sharedMode,
		initial,
		exit,
		custom,
		onExitComplete,
		...flat
	} = (params ?? {}) as PresenceAnimation;
	const structured = initial !== undefined || exit !== undefined;
	const enterSpec = resolveSpec(structured ? initial : flat, transition);
	const exitSpec = resolveSpec(structured ? exit : flat, transition);
	const mode: PresenceMode = sharedMode ?? (exit as { mode?: PresenceMode })?.mode ?? 'sync';

	// Without its own exit spec, presence plays the `exit` of the element's mercury() node.
	const nodeFor = () => (exitSpec ? undefined : getMercuryNode(element));
	const hasExit = () => Boolean(exitSpec || nodeFor()?.hasExit);

	// The shorthand animates the element's shared VisualElement, which its mercury()
	// node adopts if one attaches later.
	if (enterSpec || exitSpec) getVisualElement(element);

	if (prefersReducedMotion() && !nodeFor()) {
		if (onExitComplete && options.direction === 'out') queueMicrotask(onExitComplete);
		return { duration: 0 };
	}

	// This runs at play start, before any animation begins — refresh the settled-value
	// snapshot when the element is at rest, so reversals have reliable targets.
	if (!wasAnimating) {
		el[NATURAL_VALUES] = undefined;
		el[AUTHORED_STYLES] = undefined;
	}
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

	if (mode === 'wait' && options.direction !== 'in' && hasExit()) {
		waitToken = {};
		registerWaitExit(element);
		el[WAIT_REGISTERED] = waitToken;
		// Safety net: if the play is aborted before its deferred config ever resolves,
		// release the registration so enters in this scope aren't deferred forever.
		setTimeout(() => {
			if (!resolved) releaseWait();
		}, 0);
	}

	const begin = (
		direction: PlayDirection,
		keyframes: Record<string, unknown>,
		specTransition?: Transition,
		onDone?: () => void,
		restore?: () => void
	): AnimationPlaybackControls => {
		const motionOptions = mapTransitionToMotion(specTransition) as AnimationOptions;
		const userOnComplete = motionOptions.onComplete;
		let state: PresenceState;
		const controls = animate(element, keyframes as DOMKeyframesDefinition, {
			...motionOptions,
			onComplete: () => {
				userOnComplete?.();
				if (el[PRESENCE_STATE] === state) el[PRESENCE_STATE] = undefined;
				if (direction === 'in') releaseToCss(element, Object.keys(keyframes));
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

		const start = () => begin('in', keyframes, enterSpec.transition);
		// Like AnimatePresence's `wait`, the entering element isn't in the page until the
		// exiting one is gone.
		if (hasPendingWaitExit(element)) hideUntilExitCompletes(element, start);
		else start();
	};

	const recoverFromExit = (): void => {
		if (el[PRESENCE_STATE]?.direction !== 'out') return;
		runEnter();
	};

	const runExit = (spec: ResolvedSpec): PresenceTransitionConfig => {
		let finished = false;
		const restore = mode === 'popLayout' ? applyPopLayout(element) : undefined;
		const finishOnce = () => {
			if (finished) return;
			finished = true;
			completeExit(element, mode);
			onExitComplete?.();
		};

		const controls = begin('out', spec.targets, spec.transition, finishOnce, restore);
		const fallbackMs = ((spec.transition as { duration?: number })?.duration ?? 0.3) * 1000;
		let sawProgress = false;

		return {
			delay: ((spec.transition as { delay?: number })?.delay ?? 0) * 1000,
			duration: resolveDurationMs(controls, spec.transition, fallbackMs),
			tick: (t: number) => {
				// `out:`-only directives never get an 'in' play on reversal — Svelte aborts the
				// outro and emits a reset `tick(1, 0)` instead. Recover by animating back.
				if (t >= 1) {
					if (sawProgress) recoverFromExit();
					return;
				}
				sawProgress = true;
				// Svelte's outro end is the reliable removal signal — Motion's onComplete may
				// not fire once the node leaves the document. The popped styles go back right
				// before removal, so the element never re-enters the flow on screen.
				if (t <= 0) {
					finishOnce();
					restore?.();
				}
			}
		};
	};

	const reverseNodeExit = () => {
		const state = el[NODE_EXIT];
		if (!state) return;
		el[NODE_EXIT] = undefined;
		state.restore?.();
		void state.node.setPresent(true);
	};

	const runNodeExit = (node: MercuryNode): PresenceTransitionConfig => {
		const state: NodeExitState = {
			node,
			restore: mode === 'popLayout' ? applyPopLayout(element) : undefined
		};
		el[NODE_EXIT] = state;

		let finished = false;
		const finishOnce = () => {
			if (finished) return;
			finished = true;
			completeExit(element, mode);
			onExitComplete?.();
		};

		void node.setPresent(false, custom).then(() => {
			if (el[NODE_EXIT] !== state) return;
			finishOnce();
			finishSvelteOutro(element);
		});

		let sawProgress = false;
		return {
			duration: estimateExitMs(node),
			tick: (t: number) => {
				if (t >= 1) {
					if (sawProgress) reverseNodeExit();
					return;
				}
				sawProgress = true;
				if (t <= 0) {
					finishOnce();
					state.restore?.();
				}
			}
		};
	};

	return (opts) => {
		resolved = true;
		if ((opts?.direction ?? options.direction) === 'in') {
			releaseWait();
			if (el[NODE_EXIT]) reverseNodeExit();
			else if (enterSpec || exitSpec) runEnter();
			// Motion drives the visuals; a zero-length intro keeps Svelte's bookkeeping out of
			// the way (an interrupted intro would otherwise scale down the exit's duration).
			return { duration: 0 };
		}
		if (exitSpec) return runExit(exitSpec);
		const node = nodeFor();
		if (node?.hasExit) return runNodeExit(node);
		finishOutWait(element);
		if (onExitComplete) queueMicrotask(onExitComplete);
		return { duration: 0 };
	};
};
