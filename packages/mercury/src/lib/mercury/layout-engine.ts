import {
	GroupAnimation,
	type AnimationPlaybackControls,
	type HTMLVisualElement,
	type IProjectionNode,
	type Transition
} from 'motion';
// The projection classes are read through the namespace, not as named imports:
// if a Motion release drops one, it's `undefined` here and `failSoft` kicks in,
// instead of the app failing to link the module.
import * as motion from 'motion';

/**
 * Two-phase driver for Motion's layout projection engine — the engine behind
 * Motion's `animateLayout()` and the React `layout` / `layoutId` props.
 *
 * `animateLayout()` owns the DOM update: it snapshots on a microtask, then runs
 * the update callback. Svelte applies DOM updates itself, synchronously, right
 * after `$effect.pre` — so Mercury needs the snapshot and the commit as two
 * separate synchronous steps (the same split React gets from
 * `getSnapshotBeforeUpdate` / `componentDidUpdate`):
 *
 *   const session = snapshotLayout(scope, transitionFor)  // before the DOM changes
 *   ...DOM changes...
 *   session.commit()                                       // after
 */

export type LayoutTransitionResolver = (element: HTMLElement) => Transition | undefined;

export type LayoutSession = {
	/**
	 * Animate from the snapshot to the current DOM. Resolves with the running
	 * animations once Motion has created them.
	 */
	commit: () => Promise<GroupAnimation>;
};

/**
 * These are the projection classes Motion builds `animateLayout()` and its React
 * `layout` prop on. They're exported from `motion` but not documented, so if a
 * Motion release ever changes them, degrade to "no layout animation" instead of
 * throwing inside the host app's effects.
 */
let hasWarned = false;
function failSoft(error: unknown) {
	if (hasWarned) return;
	hasWarned = true;
	console.warn(
		'[mercury] Layout animation skipped: the installed version of `motion` is not compatible with this version of Mercury.',
		error
	);
}

type RestorePoint = { parent: Element | null; next: ChildNode | null };

type Session = {
	scope: Element | Document;
	transitionFor: LayoutTransitionResolver;
	tracked: Map<HTMLElement, IProjectionNode>;
	restorePoints: Map<HTMLElement, RestorePoint>;
	/** The projection root the snapshot started an update on, which the commit must complete. */
	root?: IProjectionNode;
	resolve: (animation: GroupAnimation) => void;
};

const LAYOUT_SELECTOR = '[data-layout],[data-layout-id]';

/** Every projection node Mercury has created, keyed by element for reuse. */
const layoutNodes = new WeakMap<HTMLElement, IProjectionNode>();

/** Every element Mercury has created a node for, so nodes of removed elements get dropped. */
const knownElements = new Set<HTMLElement>();

/** Elements seen under each scope, released with the group that owns the scope. */
const scopeElements = new WeakMap<Element | Document, Set<HTMLElement>>();

/**
 * Sessions that took a snapshot but haven't been flushed yet. Their removed
 * elements must survive pruning until the commit decides what to do with them.
 */
const openSessions = new Set<Session>();

/**
 * Sessions committed within the same tick are flushed together, so a removed
 * shared element knows whether a replacement with the same layout id was added
 * anywhere in this update — even by another layout group.
 */
let pendingCommits: Session[] | undefined;

/** Mid exit-crossfade: Mercury put the element back, and it removes itself once the animation completes. */
const isExiting = (element: HTMLElement) =>
	Boolean(layoutNodes.get(element)?.options.onExitComplete);

function collectLayoutElements(scope: Element | Document): HTMLElement[] {
	const elements: HTMLElement[] = [];
	const add = (element: Element) => {
		if (element instanceof HTMLElement && !isExiting(element)) elements.push(element);
	};
	if (scope instanceof HTMLElement && scope.matches(LAYOUT_SELECTOR)) add(scope);
	scope.querySelectorAll(LAYOUT_SELECTOR).forEach(add);
	return elements;
}

/**
 * Process any work scheduled on Motion's frameloop now, so values a previous
 * animation has set but not yet rendered are in the DOM before measuring.
 */
function flushPendingFrame() {
	const { frameData, frameSteps, time } = motion;
	if (frameData.isProcessing) return;
	const now = time.now();
	frameData.delta = Math.min(Math.max(now - frameData.timestamp, 0), 1000 / 60);
	frameData.timestamp = now;
	frameData.isProcessing = true;
	frameSteps.update.process(frameData);
	frameSteps.preRender.process(frameData);
	frameSteps.render.process(frameData);
	frameData.isProcessing = false;
}

function createVisualElement() {
	return new motion.HTMLVisualElement(
		{
			props: {},
			presenceContext: null,
			visualState: {
				latestValues: {},
				renderState: { transform: {}, transformOrigin: {}, style: {}, vars: {} }
			}
		} as unknown as ConstructorParameters<typeof HTMLVisualElement>[0],
		{ allowProjection: true }
	);
}

const RADIUS_KEYS = [
	'borderTopLeftRadius',
	'borderTopRightRadius',
	'borderBottomLeftRadius',
	'borderBottomRightRadius'
] as const;

type RadiusKey = (typeof RADIUS_KEYS)[number];

/** The inline radius each element was authored with, to put back once Motion is done with it. */
const authoredRadius = new WeakMap<HTMLElement, Record<RadiusKey, string>>();

let hasScaleCorrectors = false;

// Motion corrects pixel radii and mixes pixels or percentages — one value per corner.
const isMixable = (radius: string) => /^\S+(px|%)$/.test(radius) && parseFloat(radius) > 0;

function restoreRadius(element: HTMLElement) {
	const authored = authoredRadius.get(element);
	if (!authored) return;
	for (const key of RADIUS_KEYS) element.style[key] = authored[key];
}

/**
 * Hand the element's border radius to Motion for the duration of a layout
 * animation, so corners stay round while the element is scaled and morph
 * between shared elements (what Motion's React `style` prop does). While it
 * animates, Motion writes the corrected radius inline.
 *
 * Before the DOM changes, pass `restore`: mid-animation the inline radius holds
 * Motion's corrected value, so put the authored one back first. After the DOM
 * changed, whatever is inline is authored — possibly just updated by Svelte.
 */
function readRadius(element: HTMLElement, node: IProjectionNode, restore: boolean) {
	if (!hasScaleCorrectors) {
		hasScaleCorrectors = true;
		motion.addScaleCorrector(
			Object.fromEntries(RADIUS_KEYS.map((key) => [key, motion.correctBorderRadius]))
		);
	}

	if (restore) restoreRadius(element);

	const authored = {} as Record<RadiusKey, string>;
	let computed: CSSStyleDeclaration | undefined;
	for (const key of RADIUS_KEYS) {
		let radius = (authored[key] = element.style[key]);
		if (!isMixable(radius)) radius = (computed ||= getComputedStyle(element))[key];

		if (isMixable(radius)) {
			node.latestValues[key] = radius;
		} else {
			delete node.latestValues[key];
		}
	}
	authoredRadius.set(element, authored);
}

/** Give the border radius back to the element's own styles. */
function releaseRadius(node: IProjectionNode) {
	const element = node.instance as HTMLElement | undefined;
	if (!element || !authoredRadius.has(element)) return;
	restoreRadius(element);
	authoredRadius.delete(element);

	// Motion keeps rendering whatever is left in the node's values or its render
	// state, which would overwrite the authored radius again.
	const rendered = (node.options.visualElement as HTMLVisualElement | undefined)?.renderState.style;
	for (const key of RADIUS_KEYS) {
		delete node.latestValues[key];
		if (rendered) delete rendered[key];
	}
}

function readNodeOptions(element: HTMLElement, transition: Transition | undefined) {
	const layoutAttr = element.getAttribute('data-layout');
	return {
		layoutId: element.getAttribute('data-layout-id') ?? undefined,
		layout: layoutAttr !== null ? true : undefined,
		// `data-layout="position" | "size" | "preserve-aspect"` narrows what animates.
		animationType: !layoutAttr || layoutAttr === 'true' ? 'both' : layoutAttr,
		transition
	} as Parameters<IProjectionNode['setOptions']>[0];
}

/**
 * The projection parent is fixed when a node is created, so a marked ancestor
 * needs its node first — even when it's outside the scope being snapshotted
 * (a nested group updating before the outer one ever has). Otherwise the
 * children hang off the root and stretch when the ancestor animates.
 */
function getProjectionParent(element: HTMLElement): IProjectionNode | undefined {
	const ancestor = element.parentElement?.closest(LAYOUT_SELECTOR);
	if (!(ancestor instanceof HTMLElement)) return undefined;
	return layoutNodes.get(ancestor) ?? createNode(ancestor, undefined);
}

function createNode(element: HTMLElement, transition: Transition | undefined): IProjectionNode {
	const parent = getProjectionParent(element);

	let visualElement = motion.visualElementStore.get(element) as HTMLVisualElement | undefined;
	if (!visualElement) {
		visualElement = createVisualElement();
		// Values `animate()` (mercury's `animate`, gestures…) has been rendering on
		// this element move to the VisualElement, so the layout animation composes
		// with them instead of overwriting them.
		motion.handOffElementState(element, visualElement);
	}

	// A first-time element may carry a projection transform in its inline style
	// that isn't tracked in latestValues; clear it so the first measurement isn't
	// inflated.
	if (element.style.transform && !motion.hasTransform(visualElement.latestValues)) {
		element.style.transform = '';
	}

	const node = new motion.HTMLProjectionNode(visualElement.latestValues, parent) as IProjectionNode;
	visualElement.projection = node;
	node.setOptions({ ...readNodeOptions(element, transition), visualElement });
	node.mount(element);
	layoutNodes.set(element, node);
	knownElements.add(element);

	node.addEventListener('animationComplete', () => {
		// Shared elements animate as one: the lead completes for its whole stack.
		(node.getStack()?.members ?? [node]).forEach(releaseRadius);
	});

	return node;
}

function prepareNode(element: HTMLElement, transition: Transition | undefined): IProjectionNode {
	const existing = layoutNodes.get(element);
	const node = existing ?? createNode(element, transition);
	if (existing) node.setOptions(readNodeOptions(element, transition));

	node.isPresent = true;
	return node;
}

function dropNode(element: HTMLElement, node: IProjectionNode) {
	node.setOptions({ onExitComplete: undefined });
	// Stop any lingering animation so it can't leak into future updates. A follow
	// node can share its currentAnimation with a surviving lead, in which case it
	// isn't ours to stop.
	if (!node.getStack() || node.isLead()) node.currentAnimation?.stop();
	node.unmount();
	layoutNodes.delete(element);
	knownElements.delete(element);
}

function reconcileAdditions(session: Session, newMemberIds: Set<string>) {
	for (const element of collectLayoutElements(session.scope)) {
		if (session.tracked.has(element)) continue;
		const node = prepareNode(element, session.transitionFor(element));
		track(session, element, node);
		if (node.options.layoutId) newMemberIds.add(node.options.layoutId);
	}
}

function reconcileRemovals(session: Session, newMemberIds: Set<string>) {
	session.tracked.forEach((node, element) => {
		if (element.isConnected) return;

		const restore = session.restorePoints.get(element);
		session.restorePoints.delete(element);

		const { layoutId } = node.options;
		const stack = node.getStack();
		const hasSurvivor = stack?.members.some(
			(member) => member !== node && (member.instance as Element | undefined)?.isConnected
		);

		// A removed lead with a surviving stack member — and no replacement added in
		// this update — runs an exit crossfade: put the element back where it was,
		// relegate it and let the survivor take over. It's removed again once the
		// animation completes.
		if (layoutId && node.isLead() && hasSurvivor && !newMemberIds.has(layoutId)) {
			if (restore?.parent?.isConnected) {
				restore.parent.insertBefore(
					element,
					restore.next && restore.next.parentNode === restore.parent ? restore.next : null
				);
				node.isPresent = false;
				node.setOptions({
					onExitComplete: () => {
						element.remove();
						dropNode(element, node);
					}
				});
				if (node.relegate()) {
					session.tracked.delete(element);
					return;
				}
				element.remove();
			}
		}

		dropNode(element, node);
		session.tracked.delete(element);
		scopeElements.get(session.scope)?.delete(element);
	});
}

function track(session: Session, element: HTMLElement, node: IProjectionNode) {
	session.root ||= node.root;
	session.tracked.set(element, node);
	session.restorePoints.set(element, {
		parent: element.parentElement,
		next: element.nextSibling
	});

	let known = scopeElements.get(session.scope);
	if (!known) scopeElements.set(session.scope, (known = new Set()));
	known.add(element);
}

function flushCommits() {
	const sessions = pendingCommits!;
	pendingCommits = undefined;
	for (const session of sessions) openSessions.delete(session);

	try {
		// All additions before any removals — see `pendingCommits`.
		const newMemberIds = new Set<string>();
		for (const session of sessions) reconcileAdditions(session, newMemberIds);
		for (const session of sessions) reconcileRemovals(session, newMemberIds);

		for (const session of sessions) {
			session.tracked.forEach((node, element) => {
				if (element.isConnected) readRadius(element, node, false);
			});
		}
		// Looked up from the snapshot, not from what's still tracked: the update may
		// have removed every element the session was watching.
		sessions.find((session) => session.root)?.root?.didUpdate();
	} catch (error) {
		failSoft(error);
		sessions.find((session) => session.root)?.root?.checkUpdateFailed();
		for (const session of sessions) session.resolve(new GroupAnimation([]));
		return;
	}

	// The root flushes the update on a microtask, synchronously processing the
	// frame that creates the layout animations. Collect them in a later step of
	// the same microtask pass.
	motion.microtask.render(() => {
		for (const session of sessions) {
			const animations = new Set<AnimationPlaybackControls>();
			session.tracked.forEach((node) => {
				if (node.instance && node.currentAnimation) {
					animations.add(node.currentAnimation as unknown as AnimationPlaybackControls);
				} else {
					releaseRadius(node);
				}
			});
			session.resolve(new GroupAnimation([...animations]));
		}
	});
}

/**
 * Drop the nodes of elements that have left the DOM — plus, with `scope`, every
 * node under it. Elements an open session is tracking are left for its commit,
 * and elements mid exit-crossfade remove themselves. Returns the projection root
 * if anything was dropped: unmounting a shared node starts an update on it,
 * which the caller has to complete.
 */
function prune(scope?: Element | Document): IProjectionNode | undefined {
	const scoped = scope ? scopeElements.get(scope) : undefined;
	let root: IProjectionNode | undefined;

	const drop = (element: HTMLElement) => {
		if (isExiting(element)) return;
		for (const session of openSessions) if (session.tracked.has(element)) return;
		scoped?.delete(element);
		const node = layoutNodes.get(element);
		if (!node) return;
		root ||= node.root;
		dropNode(element, node);
	};

	knownElements.forEach((element) => {
		if (!element.isConnected) drop(element);
	});
	scoped?.forEach(drop);

	return root;
}

/**
 * Snapshot every `data-layout` / `data-layout-id` element under `scope`. Call
 * synchronously *before* the DOM changes, then `commit()` once it has. Returns
 * `null` if the snapshot couldn't be taken.
 */
export function snapshotLayout(
	scope: Element | Document,
	transitionFor: LayoutTransitionResolver
): LayoutSession | null {
	let resolve!: (animation: GroupAnimation) => void;
	const ready = new Promise<GroupAnimation>((r) => (resolve = r));
	const session: Session = {
		scope,
		transitionFor,
		tracked: new Map(),
		restorePoints: new Map(),
		resolve
	};

	try {
		flushPendingFrame();

		// Nodes of elements that left the DOM outside of a layout update (e.g. after
		// an exit transition) would otherwise linger in the projection tree. The
		// commit completes the update this may start.
		session.root = prune();

		// Mount every node before snapshotting any: querySelectorAll's document order
		// guarantees ancestors mount before their descendants.
		for (const element of collectLayoutElements(scope)) {
			track(session, element, prepareNode(element, transitionFor(element)));
		}

		session.tracked.forEach((node, element) => {
			// Another group may have already snapshotted this node in the same update
			// (nested scopes) — by now part of the DOM may have changed, so keep theirs.
			if (node.root?.isUpdating && node.snapshot) return;
			readRadius(element, node, true);
			// Mounting during an active update flags isLayoutDirty, which would make
			// willUpdate skip the snapshot.
			node.isLayoutDirty = false;
			node.willUpdate();
		});
	} catch (error) {
		failSoft(error);
		session.root?.checkUpdateFailed();
		return null;
	}

	openSessions.add(session);
	let committed = false;

	// If the commit never comes (e.g. the owning component was destroyed by the
	// very update it was watching), don't leave the tree mid-update holding
	// snapshots that a later update would animate from.
	setTimeout(() => {
		if (committed) return;
		committed = true;
		openSessions.delete(session);
		session.root?.checkUpdateFailed();
		resolve(new GroupAnimation([]));
	});

	return {
		commit() {
			if (!committed) {
				committed = true;
				if (!pendingCommits) {
					pendingCommits = [];
					queueMicrotask(flushCommits);
				}
				pendingCommits.push(session);
			}
			return ready;
		}
	};
}

/**
 * Release the projection nodes of elements that have left the DOM — and, with
 * `all`, every node Mercury created under `scope`, when the scope itself is
 * going away.
 *
 * Deferred so an update that's still committing can hand removed shared
 * elements over to their replacements first.
 */
export function releaseLayoutScope(scope: Element | Document, all = false) {
	setTimeout(() => {
		try {
			prune(all ? scope : undefined)?.didUpdate();
		} catch (error) {
			failSoft(error);
		}
		if (all) scopeElements.delete(scope);
	});
}
