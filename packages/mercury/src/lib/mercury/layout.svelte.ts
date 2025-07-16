import { v4 as uuid } from 'uuid';
import { tick } from 'svelte';
import { useDebounce, useEventListener } from 'runed';
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
function hasTextChild(element: HTMLElement): boolean {
	if (!element || !(element instanceof HTMLElement)) {
		return false;
	}

	return Array.from(element.childNodes).some(
		(node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length > 0
	);
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

/**
 * Utility function for creating a snapshot of a projection node
 */
function resetAndMeasure(projectionNode: ProjectionNode): void {
	const isRoot = projectionNode.parent() === null;
	if (!isRoot) return;

	projectionNode.traverse((n) => {
		n.reset();
	});
	projectionNode.traverse((n) => {
		n.measure();
	});
}

/**
 * Handle snapshotting and animation for the projection tree
 */
function snapAndAnimate(
	projectionNode: ProjectionNode,
	animator: ProjectionAnimator,
	animationConfig: AnimationConfig
): void {
	const isRoot = projectionNode.parent() === null;
	if (!isRoot) return;

	const previousSnapshots = new Map<string, ProjectionNodeSnapshot>();

	// Create snapshots and store previous ones
	projectionNode.traverse((node) => {
		const previous = snapshots.get(node.identity());
		const current = createSnapshot(node);

		if (!previous && !current) return;
		if (current && previous?.equals(current)) return;

		snapshots.set(node.identity(), current);
		previousSnapshots.set(node.identity(), previous);
	});

	// Animate from previous to current snapshots
	projectionNode.traverse((node) => {
		const previous = previousSnapshots.get(node.identity());
		const current = snapshots.get(node.identity());

		if (!previous || !current) return;
		if (current && previous.equals(current)) return;

		animator.animate({
			node: node,
			from: previous,
			to: current,
			duration: animationConfig.duration,
			easing: animationConfig.easing
		});
	});
}
function snap(projectionNode: ProjectionNode): void {
	const isRoot = projectionNode.parent() === null;
	if (!isRoot) return;

	const previousSnapshots = new Map<string, ProjectionNodeSnapshot>();

	// Create snapshots and store previous ones
	projectionNode.traverse((node) => {
		const previous = snapshots.get(node.identity());
		const current = createSnapshot(node);

		if (!previous && !current) return;
		if (current && previous?.equals(current)) return;

		snapshots.set(node.identity(), current);
		previousSnapshots.set(node.identity(), previous);
	});
}

/**
 * Build the Projection Tree covering the given element and its child elements.
 * Create a Projection Node for the given element, and establish the parent-child
 * relationships with the existing child Projection Nodes without a parent.
 * This handles the case where child elements already have projection nodes from their own attachments.
 */
function buildProjectionTreeDownwards(
	element: HTMLElement,
	layoutId: string,
	metadataManager: InPlaceMetadataManager
): ProjectionNode {
	// Check if projection node already exists (from another attachment)
	let projectionNode = nodeMap.get(element);

	if (projectionNode) {
		// If this element already has a projection node, just use it
		// This happens when multiple attachments are on the same element
		// or when a child attachment runs before a parent attachment
		return projectionNode;
	}

	// Create new projection node
	projectionNode = new BasicProjectionNode(element, layoutId);
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
			// Create new projection node for children without attachments
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

/**
 * Layout projection attachment factory
 * Returns an attachment function that handles layout animations
 */
export const layout = ({
	layoutId,
	track,
	animationConfig = { duration: 300, easing: (progress) => progress }
}: {
	layoutId?: string;
	track: () => any;
	animationConfig?: AnimationConfig;
}) => {
	/**
	 * Attachment function - called when element mounts
	 * Recreated when dependencies (layoutId, track, animationConfig) change
	 */
	return (element: HTMLElement) => {
		// Determine if this is a shared layout
		const finalLayoutId = layoutId ?? uuid();

		// Set up animation infrastructure (shared among all nodes that might animate together)
		const layoutFramer = new LayoutAnimationFramer();
		const metadataManager = new InPlaceMetadataManager();
		const layoutHandler: ProjectionAnimationHandler = new LayoutProjectionAnimationHandler(
			layoutFramer,
			metadataManager
		);
		const handlers: ProjectionAnimationHandler[] = [layoutHandler];
		const animator: ProjectionAnimator = new CompositeProjectionAnimator(handlers);

		// Build the projection tree downwards from this element
		const projectionNode = buildProjectionTreeDownwards(element, finalLayoutId, metadataManager);

		// Try to attach to nearest parent in the projection tree
		tryAttachToNearestParent(projectionNode);
		let isScrolling = $state(false);
		// wrap our “end scroll” logic
		const onScrollEnd = useDebounce(() => {
			isScrolling = false;
			// final animate when scroll stops
			snapAndAnimate(projectionNode, animator, animationConfig);
		}, 200);
		useEventListener(
			() => document,
			'scroll',
			() => {
				isScrolling = true;
				resetAndMeasure(projectionNode);
				snap(projectionNode);
				onScrollEnd();
			},
			{ capture: true, passive: true }
		);
		// Set up reactive tracking for layout changes
		$effect(() => {
			// Call the tracking function to establish dependencies
			track();

			// Reset, measure, and animate from this root
			resetAndMeasure(projectionNode);
			if (!isScrolling) {
				snapAndAnimate(projectionNode, animator, animationConfig);
			}
		});

		// Return cleanup function
		return () => {
			// Clean up snapshots for this subtree only if this is the root of the attachment
			projectionNode.traverse((n) => {
				const snapshot = snapshots.get(n.identity());
				if (!snapshot) return;

				// Delete snapshot after next tick in case there's a shared element animation
				tick().then(() => {
					// Only delete if it's still the same snapshot (hasn't been replaced by shared animation)
					if (snapshots.get(n.identity()) === snapshot) {
						snapshots.delete(n.identity());
					}
				});
			});

			// Simple cleanup: just remove our main element from nodeMap and dispose the projection node
			// The projection node will handle cleaning up its children appropriately
			nodeMap.delete(element);
			projectionNode.dispose();
		};
	};
};
