import {
	ElementMeasurer,
	LayoutAnimator,
	ProjectionNode,
	ProjectionNodeSnapper,
	ProjectionTreeAnimationEngine,
	ProjectionNodeAnimationEngine,
	CssBorderRadiusParser,
	CssEasingParser,
	ProjectionNodeSnapshotMap,
	ProjectionNodeAnimationRouteMap
} from '@layout-projection/core';
import { watch, useDebounce } from 'runed';
import { tick } from 'svelte';
/**
 * Implementation of LayoutAnimator that logs additional information to the
 * console.
 */
class DebuggingLayoutAnimator extends LayoutAnimator {
	protected getAnimationRouteMap(
		root: ProjectionNode,
		snapshots: ProjectionNodeSnapshotMap,
		estimation: boolean
	): ProjectionNodeAnimationRouteMap {
		const result = super.getAnimationRouteMap(root, snapshots, estimation);

		return result;
	}
}

// singleton services from `@layout-projection/core`
const measurer = new ElementMeasurer(new CssBorderRadiusParser());
const snapper = new ProjectionNodeSnapper(measurer);
const animator = new LayoutAnimator(
	new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
	measurer,
	new CssEasingParser()
);
const abortController = new AbortController();

/**
 * Map of DOM elements to their projection nodes.
 */
export const nodeMap = $state(new WeakMap<HTMLElement, ProjectionNode>());

/**
 * Build the Projection Tree covering the given element and its child elements.
 * Create a Projection Node for the given element, and establish the parent-child
 * relationships with the existing child Projection Nodes without a parent.
 * This confronts Svelte's rendering mechanism where child elements are created
 * before the parent element.
 * @param element
 * @param layoutId if specified, assign the given ID to the created root Projection Node
 * @returns the created Projection Node of the given element
 */
function buildProjectionTreeDownwards(
	element: HTMLElement,
	layoutId: string | null
): ProjectionNode {
	if (nodeMap.has(element)) throw new Error('Projection Node already exists for the given element');
	const projectionNode = new ProjectionNode(element, measurer);
	if (layoutId) projectionNode.identifyAs(layoutId);
	nodeMap.set(element, projectionNode);

	traverseDomBreadthFirst(element, (current) => {
		if (!(current instanceof HTMLElement)) return;
		if (current === element) return;
		const childProjectionNode = nodeMap.get(current);
		if (!childProjectionNode) return;
		// if found a Projection Node that already has a parent, any deeper
		// nodes should already be well established
		if (childProjectionNode.parent) return false;
		childProjectionNode.attach(projectionNode);
		return;
	});

	return projectionNode;
}

/**
 * Attempt to find the nearest parent Projection Node for the given Projection
 * Node by looking upwards through the DOM.
 * @param projectionNode
 * @returns true if a parent Projection Node is found and attached
 */
function tryAttachToNearestParent(projectionNode: ProjectionNode): boolean {
	let parentElement = projectionNode.element.parentElement;
	while (parentElement) {
		const parentProjectionNode = nodeMap.get(parentElement);
		if (parentProjectionNode) {
			projectionNode.attach(parentProjectionNode);
			return true;
		}
		parentElement = parentElement.parentElement;
	}
	return false;
}

/**
 * Traverse the DOM tree breadth-first starting from the given node.
 * @param from the node to start traversing from
 * @param callback invoked for each node traversed, including the given node;
 * returns false to stop the traversal
 */
function traverseDomBreadthFirst(from: Node, callback: (node: Node) => void | boolean) {
	const queue: Node[] = [from];
	while (queue.length > 0) {
		const node = queue.shift()!;
		if (callback(node) === false) return;
		for (const child of Array.from(node.childNodes)) {
			queue.push(child);
		}
	}
}

/**
 * Locate furthest ancestor Projection Node of the given Projection Node.
 * @param node
 * @returns
 */
function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
	if (!node) return node;
	return node.parent ? findRootProjectionNode(node.parent) : node;
}

// TODO: definitely needs some refactor here - root and children have very different responsibilities
// TODO: switch to another mechanism for animation timing - must be performed after **all** layout changes
export function setupProjection(currentElement: Node, layoutId: string | null) {
	if (!(currentElement instanceof HTMLElement))
		throw new Error('Projection applies only to HTMLElement instances');

	const currentProjectionNode = buildProjectionTreeDownwards(
		currentElement as HTMLElement,
		layoutId
	);
	// In case called with a new element that was not there during the
	// initial render:
	tryAttachToNearestParent(currentProjectionNode);

	let rootProjectionNode: ProjectionNode | null = null;
	let observer: MutationObserver | null = null;

	let snapshots: ProjectionNodeSnapshotMap | null = null;
	const debounceSnapshot = useDebounce(() => {
		snapshots = snapper.snapshotTree(currentProjectionNode);
	}, 50);

	watch(
		() => nodeMap,
		() => {
			rootProjectionNode = findRootProjectionNode(currentProjectionNode);
			// Below are root-specific responsibilities
			if (rootProjectionNode !== currentProjectionNode) return;
			snapshots = snapper.snapshotTree(currentProjectionNode);
			//Todo: Not really optimal, but since I can't snapshot before a document change I have to do this
			window.addEventListener(
				'scroll',
				() => {
					debounceSnapshot();
				},
				{ capture: true, signal: abortController.signal }
			);
		}
	);

	watch(
		() => rootProjectionNode,
		() => {
			observer?.disconnect();

			// Below are root-specific responsibilities
			if (rootProjectionNode !== currentProjectionNode) return;
			observer = new MutationObserver((mutations) => {
				//TODO: This is done so that the animate doesn't trigger a infinite mutation loop but this doesn't trigger style changes without class changes
				const shouldUpdate = mutations.some(
					(mutation) =>
						(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
						mutation.type === 'childList'
				);
				if (shouldUpdate && snapshots) {
					requestAnimationFrame(() => {
						tick().then(() => {
							animator
								.animate({ root: currentProjectionNode, from: snapshots, estimation: true })
								.then(() => {
									snapshots = snapper.snapshotTree(currentProjectionNode);
								});
						});
					});
				}
			});

			observer.observe(rootProjectionNode.element, {
				attributes: true,
				childList: true,
				subtree: true
			});
		}
	);

	return {
		destroy: () => {
			observer?.disconnect();
			if (currentProjectionNode?.parent) {
				currentProjectionNode.detach();
			}
			if (currentProjectionNode === rootProjectionNode) {
				abortController.abort();
			}
		}
	};
}
