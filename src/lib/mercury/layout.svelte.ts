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
const snapshots = new Map<string, ProjectionNodeSnapshot>();

/**
 * Map of DOM elements to their projection nodes.
 */
export const nodeMap = new WeakMap<HTMLElement, ProjectionNode>();

/**
 * Checks if an HTMLElement has a direct text node child
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - True if element has a direct text node child, false otherwise
 */
function hasTextChild(element: HTMLElement) {
	// Check if the element is valid
	if (!element || !(element instanceof HTMLElement)) {
		return false;
	}

	// Convert NodeList to array and check if any child is a non-empty text node
	return Array.from(element.childNodes).some(
		(node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0
	);
}

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

	if (hasTextChild(element)) {
		metadataManager.define(projectionNode, SKIP_SIZE, true);
	}

	// Recursively build the tree with correct parent-child relationships
	buildTreeRecursive(element, projectionNode, metadataManager);

	return projectionNode;
}

/**
 * Recursively build projection tree ensuring correct parent-child relationships
 */
function buildTreeRecursive(
	element: HTMLElement,
	parentProjectionNode: ProjectionNode,
	metadataManager: InPlaceMetadataManager
): void {
	for (const child of Array.from(element.children)) {
		if (!(child instanceof HTMLElement)) continue;

		let childProjectionNode = nodeMap.get(child);

		if (!childProjectionNode) {
			// Create new projection node
			childProjectionNode = new BasicProjectionNode(child, uuid());
			nodeMap.set(child, childProjectionNode);

			if (hasTextChild(child)) {
				metadataManager.define(childProjectionNode, SKIP_SIZE, true);
			}
		}

		// Attach to correct parent if not already attached
		if (!childProjectionNode.parent()) {
			childProjectionNode.attach(parentProjectionNode);
		}

		// Recursively process children
		buildTreeRecursive(child, childProjectionNode, metadataManager);
	}
}

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
	animationConfig = { duration: 300, easing: (progress) => progress }
}: {
	layoutId?: string;
	track: () => any;
	animationConfig: AnimationConfig;
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
		// tryAttachToNearestParent(projectionNode);

		$effect(() => {
			track();
			resetAndMeasure(projectionNode);
			snapAndAnimate(projectionNode, animator, animationConfig);
		});
		return () => {
			projectionNode.traverse((n) => {
				const snapshot = snapshots.get(n.identity());

				if (!snapshot) return;
				//delete the snapshot after the next tick in case there is a shared element animation
				tick().then(() => {
					if (snapshots.get(n.identity()) !== snapshot) return;
					snapshots.delete(n.identity());
				});
			});
		};
	};
};

//utility function for creating a snapshot of a projection node
const resetAndMeasure = (projectionNode: ProjectionNode) => {
	const isRoot = projectionNode.parent() === null;
	if (!isRoot) return;

	console.log('resetAndMeasure');
	projectionNode.traverse((n) => {
		console.log('resetted:', n.identity());
		n.reset();
	});
	projectionNode.traverse((n) => {
		console.log('measured:', n.identity());
		n.measure();
	});
};

const snapAndAnimate = (
	projectionNode: ProjectionNode,
	animator: ProjectionAnimator,
	animationConfig: AnimationConfig
) => {
	const isRoot = projectionNode.parent() === null;
	if (!isRoot) return;
	const previousSnapshots = new Map<string, ProjectionNodeSnapshot>();
	projectionNode.traverse((node) => {
		console.log('snapshotting:', node.identity());
		let previous = snapshots.get(node.identity());
		let current = createSnapshot(node);
		if (!previous && !current) return;
		if (current && previous?.equals(current)) return;
		snapshots.set(node.identity(), current);
		previousSnapshots.set(node.identity(), previous);
	});
	projectionNode.traverse((node) => {
		let previous = previousSnapshots.get(node.identity());
		let current = snapshots.get(node.identity());
		if (!previous || !current) return;
		if (current && previous?.equals(current)) return;
		console.log('animating:', node.identity(), previous?.measurement?.layout, current?.measurement?.layout);
		animator.animate({
			node: node,
			from: previous!,
			to: current!,
			duration: animationConfig.duration,
			easing: animationConfig.easing
		});
	});
};
