import {
	GroupAnimation,
	HTMLVisualElement,
	animateVisualElement,
	SVGVisualElement,
	createAnimationState,
	handOffElementState,
	isAnimationControls,
	isControllingVariants,
	isMotionValue,
	isVariantLabel,
	isVariantNode,
	resolveMotionValue,
	resolveVariantFromProps,
	scrapeHTMLMotionValuesFromProps,
	scrapeSVGMotionValuesFromProps,
	visualElementStore,
	type AnimationPlaybackControls,
	type TargetAndTransition,
	type Transition
} from 'motion';
import type { AnimationInstance, MotionConfigOptions } from './animation-interface.js';
import { featureDefinitions, type Feature } from './gestures/features.js';
import { hasPendingWaitExit, runAfterPendingExit } from './presence-coordinator.js';
import { prefersReducedMotion } from './utils.js';

/**
 * Mercury's equivalent of a `<motion.*>` component: one Motion `VisualElement` per
 * element, with Motion's own animation state machine (`initial` / `animate` /
 * `while*` / `exit` priorities, variants and their propagation to children) and
 * gesture features. Svelte attachments re-run on every change, so nodes outlive
 * them: a re-run updates the node's props, like a React re-render.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = Record<string, any>;
type AnyVisualElement = any;
type TreeVariants = { initial?: unknown; animate?: unknown };

/** Behaviour of deprecated Mercury options that Motion props can't express. */
export interface LegacyOptions {
	onTapEnd?: (event: PointerEvent) => void;
	scrollExit?: { target: TargetAndTransition; transition?: Transition };
	instance?: (instance: AnimationInstance) => void;
}

const nodes = new WeakMap<Element, MercuryNode>();

const REDUCED_MOTION = { type: 'keyframes', duration: 0.2, delay: 0, repeat: 0, ease: 'easeOut' };
const configs = new WeakMap<Element, MotionConfigOptions>();

export const getMercuryNode = (element: Element): MercuryNode | undefined => nodes.get(element);

export function setMotionConfig(element: Element, config: MotionConfigOptions | undefined) {
	if (config) configs.set(element, config);
	else configs.delete(element);
}

function findConfig(element: Element): MotionConfigOptions | undefined {
	for (let el: Element | null = element; el; el = el.parentElement) {
		const config = configs.get(el);
		if (config) return config;
	}
	return undefined;
}

function findParentNode(element: Element): MercuryNode | undefined {
	for (let el = element.parentElement; el; el = el.parentElement) {
		const node = nodes.get(el);
		if (node) return node;
	}
	return undefined;
}

/** `<MotionConfig>` props merge under the element's own, like Motion's `{ ...config, ...props }`. */
function withConfig(props: Props, config: MotionConfigOptions | undefined): Props {
	if (!config) return props;
	return {
		...props,
		transition: props.transition ?? config.transition,
		transformPagePoint: props.transformPagePoint ?? config.transformPagePoint
	};
}

/** The variant labels a node passes down to children that inherit them (Motion's MotionContext). */
function getTreeVariants(props: Props, parentContext: TreeVariants): TreeVariants {
	if (isControllingVariants(props)) {
		const { initial, animate } = props;
		return {
			initial: initial === false || isVariantLabel(initial) ? initial : undefined,
			animate: isVariantLabel(animate) ? animate : undefined
		};
	}
	return props.inherit !== false ? parentContext : {};
}

/** The values an element renders before its first animation: `initial`, or `animate` when `initial: false`. */
function makeLatestValues(props: Props, context: TreeVariants, isSVG: boolean) {
	const values: Record<string, unknown> = {};
	const scrape = isSVG ? scrapeSVGMotionValuesFromProps : scrapeHTMLMotionValuesFromProps;
	const motionValues = scrape(props as any, {});
	for (const key in motionValues) values[key] = resolveMotionValue(motionValues[key]);

	let { initial, animate } = props;
	if (isVariantNode(props) && !isControllingVariants(props) && props.inherit !== false) {
		if (initial === undefined) initial = context.initial;
		if (animate === undefined) animate = context.animate;
	}

	const isInitialAnimationBlocked = initial === false;
	const variantToSet = isInitialAnimationBlocked ? animate : initial;
	if (variantToSet && typeof variantToSet !== 'boolean' && !isAnimationControls(variantToSet)) {
		const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];
		for (const definition of list) {
			const resolved = resolveVariantFromProps(props as any, definition);
			if (!resolved) continue;
			const { transitionEnd, transition: _transition, ...target } = resolved as Props;
			for (const key in target) {
				let valueTarget = target[key];
				if (Array.isArray(valueTarget)) {
					// Take the final keyframe if the initial animation is blocked, as we
					// want to initialise at the end of that blocked animation.
					valueTarget = valueTarget[isInitialAnimationBlocked ? valueTarget.length - 1 : 0];
				}
				if (valueTarget !== null) values[key] = valueTarget;
			}
			for (const key in transitionEnd) values[key] = transitionEnd[key];
		}
	}
	return values;
}

function createVisualElement(
	element: Element,
	{
		props = {},
		parent,
		latestValues = {},
		config
	}: {
		props?: Props;
		parent?: AnyVisualElement;
		latestValues?: object;
		config?: MotionConfigOptions;
	} = {}
): AnyVisualElement {
	const isSVG = element instanceof SVGElement;
	const renderState = {
		style: {},
		transform: {},
		transformOrigin: {},
		vars: {},
		...(isSVG ? { attrs: {} } : {})
	};
	const options = {
		parent,
		props,
		presenceContext: null,
		reducedMotionConfig: config?.reducedMotion,
		skipAnimations: config?.skipAnimations,
		blockInitialAnimation: false,
		visualState: { latestValues, renderState }
	} as any;
	return isSVG
		? new SVGVisualElement(options)
		: new HTMLVisualElement(options, { allowProjection: true });
}

/** VisualElements Mercury made for elements without a node (presence, layout), until one attaches. */
const bareVisualElements = new WeakSet<object>();

/**
 * The element's VisualElement: its Mercury node's, or a bare one shared by
 * `presence` and layout animations so everything animating the element goes
 * through the same motion values. `animate(element)` uses it too.
 */
export function getVisualElement(element: Element): AnyVisualElement {
	const existing = visualElementStore.get(element);
	if (existing) return existing;
	const visualElement = createVisualElement(element);
	bareVisualElements.add(visualElement);
	handOffElementState(element, visualElement as any);
	visualElement.mount(element);
	return visualElement;
}

/** Take over a bare VisualElement's motion values and projection. */
function adopt(previous: AnyVisualElement, visualElement: AnyVisualElement) {
	previous.values.forEach((value: unknown, key: string) => {
		if (!visualElement.hasValue(key) && !(key in visualElement.latestValues)) {
			visualElement.addValue(key, value);
		}
	});
	for (const key in previous.latestValues) {
		if (!(key in visualElement.latestValues)) {
			visualElement.latestValues[key] = previous.latestValues[key];
		}
	}
	const { projection } = previous;
	if (projection) {
		previous.projection = undefined;
		projection.latestValues = visualElement.latestValues;
		projection.setOptions({ visualElement });
		visualElement.projection = projection;
	}
	previous.unmount();
}

function createInstance(animations: AnimationPlaybackControls[]): AnimationInstance {
	const controls = new GroupAnimation(animations);
	const track = () => {
		instance.completed = false;
		instance.finished = controls.finished.then(() => {
			instance.completed = true;
		});
		instance.finished.catch(() => {});
	};
	const instance: AnimationInstance = {
		controls,
		completed: false,
		finished: Promise.resolve(),
		play: () => {
			const wasCompleted = instance.completed;
			controls.play();
			if (wasCompleted) track();
		},
		pause: () => controls.pause(),
		stop: () => controls.stop(),
		cancel: () => controls.cancel(),
		onComplete: (onResolve, onReject) => instance.finished.then(onResolve, onReject)
	};
	track();
	return instance;
}

const LAYOUT_ATTRIBUTES = [
	'data-layout',
	'data-layout-id',
	'data-layout-scroll',
	'data-layout-root',
	'data-layout-crossfade'
] as const;

function layoutAttributes(
	props: Props
): Record<(typeof LAYOUT_ATTRIBUTES)[number], string | undefined> {
	const { layout, layoutId, layoutScroll, layoutRoot, layoutCrossfade } = props;
	return {
		'data-layout':
			layout === undefined || layout === false ? undefined : layout === true ? '' : layout,
		'data-layout-id': layoutId,
		'data-layout-scroll': layoutScroll ? '' : undefined,
		'data-layout-root': layoutRoot ? '' : undefined,
		'data-layout-crossfade': layoutCrossfade === false ? 'false' : undefined
	};
}

/** Layout attributes each element got from its `mercury()` props, so they can be removed again. */
const ownedLayoutAttributes = new WeakMap<Element, Set<string>>();

/**
 * Mirror `layout` / `layoutId` props onto the `data-layout*` attributes Mercury's
 * layout engine reads. Synchronous, so an element added by an update is marked
 * before that update's layout animation looks for it.
 */
function syncLayoutAttributes(element: Element, props: Props) {
	let owned = ownedLayoutAttributes.get(element);
	for (const [name, value] of Object.entries(layoutAttributes(props))) {
		if (value !== undefined) {
			element.setAttribute(name, value);
			if (!owned) ownedLayoutAttributes.set(element, (owned = new Set()));
			owned.add(name);
		} else if (owned?.has(name)) {
			element.removeAttribute(name);
			owned.delete(name);
		}
	}
}

export class MercuryNode {
	readonly element: Element;
	readonly visualElement: AnyVisualElement;
	readonly parent?: MercuryNode;
	legacy: LegacyOptions;
	/** Variant labels inherited by children (Motion's MotionContext value). */
	childContext: TreeVariants;
	isExiting = false;
	private config?: MotionConfigOptions;
	private features: Record<string, Feature> = {};

	constructor(element: Element, props: Props, legacy: LegacyOptions) {
		this.element = element;
		this.legacy = legacy;
		this.parent = findParentNode(element);
		this.config = findConfig(element);

		const merged = withConfig(props, this.config);
		const parentContext = this.parent?.childContext ?? {};
		this.childContext = getTreeVariants(merged, parentContext);

		this.visualElement = createVisualElement(element, {
			props: merged,
			parent: this.parent?.visualElement,
			latestValues: makeLatestValues(merged, parentContext, element instanceof SVGElement),
			config: this.config
		});
		const animationState = createAnimationState(this.visualElement);
		animationState.setAnimateFunction(
			(visualElement: AnyVisualElement) =>
				(animations: { animation: unknown; options?: Props }[]) => {
					const reduce = this.reducesMotion();
					visualElement.shouldReduceMotion = reduce;
					return Promise.all(
						animations.map(({ animation, options }) =>
							animateVisualElement(
								visualElement,
								animation as any,
								reduce ? { ...options, transitionOverride: REDUCED_MOTION } : options
							)
						)
					);
				}
		);
		this.visualElement.animationState = animationState;
		nodes.set(element, this);
	}

	/**
	 * Mercury's reduced-motion policy, stricter than Motion's default: positional
	 * values jump (Motion's own rule), everything else gets a short fade — no
	 * springs, delays, staggers or loops. Read when each animation starts, so it
	 * follows the OS setting live; `motionConfig({ reducedMotion })` overrides it.
	 */
	reducesMotion(): boolean {
		const config = this.config?.reducedMotion;
		if (config === 'always') return true;
		if (config === 'never') return false;
		return prefersReducedMotion();
	}

	mount() {
		const { element, visualElement } = this;
		const previous = visualElementStore.get(element);
		if (previous && previous !== visualElement && bareVisualElements.has(previous)) {
			adopt(previous, visualElement);
		} else {
			// Values `animate(element)` has been rendering move over, so they compose.
			handOffElementState(element, visualElement);
		}
		visualElement.mount(element);
		// Render `initial` now: attachments run before the browser paints the new element.
		visualElement.render();
		this.renderText();
		this.updateFeatures();
	}

	/** Motion only writes a motion value child on change; React renders its first value. */
	private renderText() {
		const { children } = this.visualElement.getProps();
		if (isMotionValue(children)) this.element.textContent = `${children.get()}`;
	}

	update(props: Props, legacy: LegacyOptions) {
		this.legacy = legacy;
		this.config = findConfig(this.element);
		const merged = withConfig(props, this.config);
		this.childContext = getTreeVariants(merged, this.parent?.childContext ?? {});
		this.syncConfig();
		const previousText = this.visualElement.getProps().children;
		this.visualElement.update(merged, this.visualElement.presenceContext);
		if (merged.children !== previousText) this.renderText();
		this.updateFeatures();
	}

	private syncConfig() {
		const visualElement = this.visualElement;
		visualElement.shouldSkipAnimations = this.config?.skipAnimations ?? false;
		visualElement.reducedMotionConfig = this.config?.reducedMotion;
	}

	private updateFeatures() {
		const props = this.visualElement.getProps();
		for (const key in featureDefinitions) {
			const { isEnabled, create } = featureDefinitions[key];
			const feature = this.features[key];
			if (feature) {
				feature.update();
			} else if (isEnabled(props, this)) {
				(this.features[key] = create(this)).mount();
			}
		}
	}

	/** Diff the props against the last animated state and start what changed. */
	animate() {
		const visualElement = this.visualElement;
		visualElement.animationState.animateChanges();
		visualElement.enteringChildren = undefined;

		const onInstance = this.legacy.instance;
		if (!onInstance) return;
		const animations: AnimationPlaybackControls[] = [];
		visualElement.values.forEach((value: any) => {
			if (value.animation && value.isAnimating()) animations.push(value.animation);
		});
		if (animations.length) onInstance(createInstance(animations));
	}

	/** Whether this node defines an exit for `presence` to play. */
	get hasExit() {
		return this.visualElement.getProps().exit !== undefined;
	}

	/**
	 * Start (`false`) or reverse (`true`) the exit animation, as AnimatePresence does
	 * when a child is removed or re-added. Resolves when the exit animations finish.
	 */
	setPresent(isPresent: boolean, custom?: unknown): Promise<unknown> {
		this.isExiting = !isPresent;
		const presenceContext = { isPresent, custom };
		const assign = (visualElement: AnyVisualElement) => {
			visualElement.presenceContext = presenceContext;
			visualElement.variantChildren?.forEach(assign);
		};
		this.visualElement.variantChildren?.forEach(assign);
		this.visualElement.update(this.visualElement.getProps(), presenceContext);
		return this.visualElement.animationState.setActive('exit', !isPresent);
	}

	destroy() {
		for (const key in this.features) this.features[key].unmount();
		this.features = {};
		const visualElement = this.visualElement;
		const { projection } = visualElement;
		if (projection) {
			// The layout engine still owns the projection node (it may be mid exit
			// crossfade), and renders through this VisualElement until it drops it.
			visualElement.projection = undefined;
			const { current } = visualElement;
			visualElement.unmount();
			visualElement.projection = projection;
			visualElement.current = current;
		} else {
			visualElement.unmount();
		}
		if (nodes.get(this.element) === this) nodes.delete(this.element);
	}
}

// --- Scheduling -------------------------------------------------------------
//
// Attachments queue their props and a microtask applies them, before the browser
// paints. Batching lets nodes be created in document order — so parents exist
// when their children look them up — and animate children first, as React's
// effects do. A re-run's teardown is cancelled by the run that follows it.

type Pending = { props: Props; legacy: LegacyOptions };
const pending = new Map<Element, Pending>();
const pendingDestroy = new Set<Element>();
let scheduled = false;

function schedule() {
	if (scheduled) return;
	scheduled = true;
	queueMicrotask(flush);
}

/**
 * One element's failure (bad props, an incompatible Motion release) shouldn't stop the
 * rest of the batch; the error is rethrown on its own so it still reaches the console.
 */
function guard(run: () => void) {
	try {
		run();
	} catch (error) {
		queueMicrotask(() => {
			throw error;
		});
	}
}

const byDocumentOrder = (a: Element, b: Element) =>
	a === b ? 0 : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

const hiddenForWait = new WeakMap<Element, string>();

/** In `mode: 'wait'`, an entering element stays out of the page until the exit before it finishes. */
export function hideUntilExitCompletes(element: Element, onReady: () => void) {
	const style = (element as HTMLElement).style;
	if (!hiddenForWait.has(element)) hiddenForWait.set(element, style?.display ?? '');
	if (style) style.display = 'none';
	runAfterPendingExit(element, () => {
		if (style && hiddenForWait.has(element)) style.display = hiddenForWait.get(element)!;
		hiddenForWait.delete(element);
		if (element.isConnected) onReady();
	});
}

function flush() {
	scheduled = false;

	for (const element of pendingDestroy) {
		if (!pending.has(element)) guard(() => nodes.get(element)?.destroy());
	}
	pendingDestroy.clear();

	const entries = [...pending.entries()].sort(([a], [b]) => byDocumentOrder(a, b));
	pending.clear();

	const created: MercuryNode[] = [];
	for (const [element, { props, legacy }] of entries) {
		const node = nodes.get(element);
		if (node) {
			guard(() => node.update(props, legacy));
		} else if (element.isConnected) {
			guard(() => created.push(new MercuryNode(element, props, legacy)));
		}
	}

	// Children mount and animate before their parents, like React effects.
	for (let i = created.length - 1; i >= 0; i--) guard(() => created[i].mount());

	const isCreated = new Set(created);
	for (let i = entries.length - 1; i >= 0; i--) {
		const node = nodes.get(entries[i][0]);
		if (!node) continue;
		if (isCreated.has(node) && hasPendingWaitExit(node.element)) {
			hideUntilExitCompletes(node.element, () => {
				if (nodes.get(node.element) === node) node.animate();
			});
		} else {
			guard(() => node.animate());
		}
	}

	// Children added in this flush were staggered against each other by their parent's
	// `delayChildren`; the next ones start a new group (React clears it on the parent's render).
	for (const node of created) {
		if (node.parent) node.parent.visualElement.enteringChildren = undefined;
	}
}

/** Queue props for the element's node. Returns the attachment teardown. */
export function attachNode(element: Element, props: Props, legacy: LegacyOptions) {
	syncLayoutAttributes(element, props);
	pendingDestroy.delete(element);
	pending.set(element, { props, legacy });
	schedule();
	return () => {
		pending.delete(element);
		pendingDestroy.add(element);
		schedule();
	};
}
