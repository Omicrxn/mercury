import { v4 as uuid } from 'uuid';
import { tick } from 'svelte';
import { BasicProjectionNode, ProjectionNode } from '@layout-projection/core';
import {
	CompositeProjectionAnimator,
	createSnapshot,
	InPlaceMetadataManager,
	ProjectionAnimationHandler,
	ProjectionAnimator,
	type ProjectionNodeSnapshot
} from '@layout-projection/animation';
import {
	LayoutAnimationFramer,
	LayoutProjectionAnimationHandler
} from '@layout-projection/animation/handlers';

// Global registry for shared layout snapshots
const sharedSnapshots = new Map<string, ProjectionNodeSnapshot>();

export const layout = ({ layoutId = uuid(), track }: { layoutId?: string; track: () => any }) => {
	return (element: HTMLElement) => {
		const projectionNode = new BasicProjectionNode(element, layoutId);
		const layoutFramer = new LayoutAnimationFramer();
		const layoutHandler: ProjectionAnimationHandler = new LayoutProjectionAnimationHandler(
			layoutFramer,
			new InPlaceMetadataManager()
		);
		const handlers: ProjectionAnimationHandler[] = [layoutHandler];
		const animator: ProjectionAnimator = new CompositeProjectionAnimator(handlers);

		// Check if we have a previous snapshot from a shared layout element
		let snapshotPrev: ProjectionNodeSnapshot | undefined = sharedSnapshots.get(layoutId);
		console.log('has previous snapshot?', snapshotPrev !== undefined);
		if (!snapshotPrev) {
			snapshotPrev = snapshot(projectionNode);
			sharedSnapshots.set(layoutId, snapshotPrev);
			console.log('initial snapshot', sharedSnapshots.get(layoutId));
		}

		$effect.pre(() => {
			track();

			// Only update snapshotPrev if this isn't the first measurement
			// and we don't already have a shared snapshot
			if (!sharedSnapshots.has(layoutId)) {
				snapshotPrev = snapshot(projectionNode);
				sharedSnapshots.set(layoutId, snapshotPrev);
				console.log(`effect.pre ${layoutId}`, snapshotPrev);
			}

			tick().then(() => {
				if (snapshotPrev) {
					const snapshotCurr: ProjectionNodeSnapshot = snapshot(projectionNode);
					console.log(`effect.tick ${layoutId}`, snapshotPrev, snapshotCurr);
					animator.animate({
						node: projectionNode,
						from: snapshotPrev,
						to: snapshotCurr,
						duration: 300,
						easing: (progress) => progress
					});
					// Update for next iteration
					snapshotPrev = snapshot(projectionNode);
					sharedSnapshots.set(layoutId, snapshotPrev);

				}
			});
		});

		// Store snapshot when element is about to unmount
		return () => {};
	};
};

const snapshot = (projectionNode: ProjectionNode) => {
  if(projectionNode.measurement())
  {
    projectionNode.reset()
  }
	projectionNode.measure();
	return createSnapshot(projectionNode);
};
