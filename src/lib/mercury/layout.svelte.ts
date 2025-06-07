import { v4 as uuid } from 'uuid';
import { tick } from 'svelte';
import { BasicProjectionNode, ProjectionNode } from '@layout-projection/core';
import {
	CompositeProjectionAnimator,
	createSnapshot,
	InPlaceMetadataManager,
	ProjectionAnimationHandler,
	ProjectionAnimator,
	type AnimationConfig,
	type ProjectionNodeSnapshot
} from '@layout-projection/animation';
import {
	LayoutAnimationFramer,
	LayoutProjectionAnimationHandler,
	SKIP_SIZE
} from '@layout-projection/animation/handlers';

// Global registry for shared layout snapshots
const sharedSnapshots = new Map<string, ProjectionNodeSnapshot>();
const currentSnapshots = new Map<string, ProjectionNodeSnapshot>();

/**
 * Map of DOM elements to their projection nodes.
 */
export const nodeMap = new WeakMap<HTMLElement, ProjectionNode>();

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
	layoutId: string = uuid(),
	metadataManager: InPlaceMetadataManager
): ProjectionNode {
	if (nodeMap.has(element)) throw new Error('Projection Node already exists for the given element');
	const projectionNode = new BasicProjectionNode(element, layoutId);
	nodeMap.set(element, projectionNode);
	if (element.textContent) {
		metadataManager.define(projectionNode, SKIP_SIZE, true);
	}
	traverseDomBreadthFirst(element, (current) => {
		if (!(current instanceof HTMLElement)) return;

		if (current === element) return;
		let childProjectionNode = nodeMap.get(current);
		if (!childProjectionNode) {
			childProjectionNode = new BasicProjectionNode(current, uuid());
			childProjectionNode.attach(projectionNode);
			if (current.textContent) {
				metadataManager.define(childProjectionNode, SKIP_SIZE, true);
			}
			nodeMap.set(current, childProjectionNode);
			return;
		} else {
			// if found a Projection Node that already has a parent, any deeper
			// nodes should already be well established
			if (childProjectionNode.parent()) return false;
			childProjectionNode.attach(projectionNode);
			return;
		}
	});

	return projectionNode;
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
 * Attempt to find the nearest parent Projection Node for the given Projection
 * Node by looking upwards through the DOM.
 * @param projectionNode
 * @returns true if a parent Projection Node is found and attached
 */
function tryAttachToNearestParent(projectionNode: ProjectionNode): boolean {
	let parentElement = projectionNode.element().parentElement;
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

export const layout = ({
	layoutId,
	track,
	animation = { duration: 300, easing: (progress) => progress }
}: {
	layoutId?: string;
	track: () => any;
	animation: AnimationConfig;
}) => {
	//This function runs when an element is mounted, it runs on every element that has layout attribute
	return (element: HTMLElement) => {
		//This part runs only once when the element is mounted
		let isShared = layoutId !== undefined;
		if (!isShared) {
			layoutId = uuid();
		}
		const layoutFramer = new LayoutAnimationFramer();
		const metadataManager = new InPlaceMetadataManager();
		const layoutHandler: ProjectionAnimationHandler = new LayoutProjectionAnimationHandler(
			layoutFramer,
			metadataManager
		);
		const handlers: ProjectionAnimationHandler[] = [layoutHandler];
		const animator: ProjectionAnimator = new CompositeProjectionAnimator(handlers);
		// 1. Build the projection tree downwards from the element that has the layout attribute
		const projectionNode = buildProjectionTreeDownwards(element, layoutId, metadataManager);
		// In case called with a new element that was not there during the
		// initial render:
		tryAttachToNearestParent(projectionNode);
		// Check if we have a previous snapshot from a shared layout element
		//2. if there is no previous shared snapshot (eg. if another element with the same layoutId was removed) then we take an initial snapshot.
		//if there is no previous snapshot create an initial one
		projectionNode.traverse((node) => {
			if (!sharedSnapshots.has(node.identity())) {
				let snap = snapshot(node);
				sharedSnapshots.set(node.identity(), snap);
			}
		});
		let isInitialized = false; // Prevents overriding prev snapshot on shared layouts, but still allows capturing effect.pre when switching elements. Also avoids scroll offset issues in non-shared layouts.

		$effect.pre(() => {
			track();
			//this runs before DOM renders
			if (isInitialized) {
				projectionNode.traverse((node) => {
					let snap = snapshot(node);
					sharedSnapshots.set(node.identity(), snap);
				});
			}
		});

		$effect(() => {
			track();
			//This runs after DOM renders
			// 3. If there is a previous snapshot we take a current one now that the element has moved and animate it
			if (sharedSnapshots.has(layoutId!) && !projectionNode.parent()) {
				projectionNode.traverse((node) => {
					let snapCurr = snapshot(node);
					currentSnapshots.set(node.identity(), snapCurr);
				});

				projectionNode.traverse((node) => {
					animator.animate({
						node: node,
						from: sharedSnapshots.get(node.identity())!,
						to: currentSnapshots.get(node.identity())!,
						duration: animation.duration,
						easing: animation.easing
					});
				});

				//4. Take a snapshot of the final state to be used as the next initial snapshot
				projectionNode.traverse((node) => {
					let snap = snapshot(node);
					sharedSnapshots.set(node.identity(), snap);
					currentSnapshots.clear();
				});
				isInitialized = true;
			}
		});
		return () => {
			if (!isShared) {
				sharedSnapshots.delete(layoutId!);
			}
			nodeMap.delete(element);
			projectionNode.dispose();
		};
	};
};

//utility function for creating a snapshot of a projection node
const snapshot = (projectionNode: ProjectionNode) => {
	if (projectionNode.measurement()) {
		projectionNode.reset();
	}
	projectionNode.measure();
	return createSnapshot(projectionNode);
};
