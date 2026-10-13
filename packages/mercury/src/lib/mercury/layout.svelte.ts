import { tick, untrack } from 'svelte';
import { GroupAnimation, type Transition } from 'motion';
import type { AnimationCallbacks, AnimationTransition } from './animation-interface.js';
import { releaseLayoutScope, snapshotLayout, type LayoutSession } from './layout-engine.js';
import { mapTransitionToMotion, prefersReducedMotion } from './utils.js';

export type LayoutProps = Record<string, string>;

/**
 * What a marked element animates when its layout changes (Motion's `layout` prop):
 * - `position` — only its position; size changes apply instantly, so content never stretches.
 * - `size` — only its size.
 * - `preserve-aspect` — position and size when the aspect ratio stays the same, otherwise position only.
 */
export type LayoutType = 'position' | 'size' | 'preserve-aspect';

export type LayoutPropsOptions = {
	type?: LayoutType;
};

export type LayoutOptions = {
	/** Transition for every element that changes layout. */
	transition?: AnimationTransition;
	/** Per layout id overrides of `transition`, keyed by the id passed to `layout.props(id)`. */
	shared?: Record<string, AnimationTransition>;
	/**
	 * `onPlay` runs when a change starts layout animations, `onComplete` once they
	 * have all ended.
	 */
	callbacks?: Pick<AnimationCallbacks, 'onPlay' | 'onComplete'>;
};

export type LayoutAnimateOptions = LayoutOptions & {
	/** Only animate marked elements inside this element. Defaults to the whole document. */
	scope?: Element;
};

type LayoutAttachment = (element: HTMLElement) => (() => void) | void;

export function layoutProps(options?: LayoutPropsOptions): LayoutProps;
export function layoutProps(id?: string, options?: LayoutPropsOptions): LayoutProps;
export function layoutProps(
	idOrOptions?: string | LayoutPropsOptions,
	maybeOptions?: LayoutPropsOptions
): LayoutProps {
	const id = typeof idOrOptions === 'string' ? idOrOptions : undefined;
	const options = typeof idOrOptions === 'object' ? idOrOptions : maybeOptions;
	const props: LayoutProps = { 'data-layout': options?.type ?? '' };

	if (id) {
		props['data-layout-id'] = id;
	}

	return props;
}

/**
 * Read every nested value of the trigger so the effects re-run on deep changes —
 * `layout(() => items)` reacts to pushes, reorders and edits of `items`.
 */
function trackDeep(value: unknown, seen = new Set<unknown>()): void {
	if (typeof value !== 'object' || value === null || seen.has(value)) return;
	seen.add(value);

	if (Array.isArray(value) || value instanceof Set) {
		for (const item of value) trackDeep(item, seen);
	} else if (value instanceof Map) {
		for (const [key, item] of value) {
			trackDeep(key, seen);
			trackDeep(item, seen);
		}
	} else {
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) return;
		for (const key in value) trackDeep((value as Record<string, unknown>)[key], seen);
	}
}

function begin(scope: Element | Document, options: LayoutOptions): LayoutSession | null {
	if (prefersReducedMotion()) return null;

	const toMotion = (transition?: AnimationTransition) =>
		transition ? (mapTransitionToMotion(transition) as Transition) : undefined;
	const base = toMotion(options.transition);
	const shared = new Map(
		Object.entries(options.shared ?? {}).map(([id, transition]) => [id, toMotion(transition)])
	);

	return snapshotLayout(
		scope,
		(element) => shared.get(element.getAttribute('data-layout-id') ?? '') ?? base
	);
}

function finish(session: LayoutSession | null, options: LayoutOptions): Promise<GroupAnimation> {
	const ready = session?.commit() ?? Promise.resolve(new GroupAnimation([]));
	const { onPlay, onComplete } = options.callbacks ?? {};

	if (onPlay || onComplete) {
		void ready.then((animation) => {
			if (animation.animations.length) onPlay?.();
			if (onComplete) void animation.finished.then(onComplete, () => {});
		});
	}

	return ready;
}

function createLayout(
	trigger: () => unknown,
	optionsOrGetter?: LayoutOptions | (() => LayoutOptions)
): LayoutAttachment {
	const getOptions =
		typeof optionsOrGetter === 'function' ? optionsOrGetter : () => optionsOrGetter ?? {};

	// Until the group is attached to a container, it covers the whole document.
	let scope: Element | Document | null = null;
	let session: LayoutSession | null = null;
	let isFirst = true;

	// Effects must register when layout() is called in <script>, not inside the
	// attachment callback: `$effect.pre` has to run before {#if}/{#each} commit so
	// the snapshot sees the DOM as it was.
	$effect.pre(() => {
		trackDeep(trigger());
		if (isFirst) return;

		session = untrack(() => begin(scope ?? document, getOptions()));
	});

	$effect(() => {
		trackDeep(trigger());

		if (isFirst) {
			isFirst = false;
			return;
		}

		const current = session;
		session = null;
		untrack(() => finish(current, getOptions()));
	});

	// On destroy, release what this group tracked while it wasn't attached.
	$effect(() => () => releaseLayoutScope(document));

	return (element: HTMLElement) => {
		scope = element;

		return () => {
			scope = null;
			releaseLayoutScope(element, true);
		};
	};
}

/**
 * Animate the layout changes caused by `update` — for one-off changes, or DOM
 * changes Svelte doesn't know about. Resolves with the running animations.
 */
async function animateLayout(
	update: () => void,
	options: LayoutAnimateOptions = {}
): Promise<GroupAnimation> {
	const session = begin(options.scope ?? document, options);
	update();
	await tick();
	return finish(session, options);
}

export const layout = Object.assign(createLayout, {
	props: layoutProps,
	animate: animateLayout
});
