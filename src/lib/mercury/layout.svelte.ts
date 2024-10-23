import {
	CssBorderRadiusParser,
	CssEasingParser,
	ElementMeasurer,
	LayoutAnimator,
	ProjectionNode,
	ProjectionNodeAnimationEngine,
	ProjectionNodeSnapper,
	ProjectionTreeAnimationEngine
} from '@layout-projection/core';
import { tick } from 'svelte';

interface AnimationParameters {
	duration?: number;
	delay?: number;
	easing?: string;
}

export default function layoutProjection(node: HTMLElement, params: AnimationParameters = {}) {
	const measurer = new ElementMeasurer(new CssBorderRadiusParser());
	const snapper = new ProjectionNodeSnapper(measurer);
	const animator = new LayoutAnimator(
		new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
		measurer,
		new CssEasingParser()
	);

	let projectionNode: ProjectionNode;

	function createProjectionNode() {
		projectionNode = new ProjectionNode(node, measurer);
	}

	function updateProjection(snapshots: any) {
		if (!projectionNode) return;

		// Animate from the previous state to the new state
		animator.animate({
			root: projectionNode,
			from: snapshots
		});
	}

	// Create the projection node immediately
	createProjectionNode();

	// Set up the mutation observer
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (
				(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
				mutation.type === 'childList'
			) {
				console.log('updated');
				requestAnimationFrame(() => {
					// Re-measure and update the projection node
					projectionNode.measure();
					const snapshots = snapper.snapshotTree(projectionNode);

					tick().then(() => {
						updateProjection(snapshots);
					});
				});
				break;
			}
		}
	});

	// Observe the node itself and its children
	observer.observe(node, { attributes: true, childList: true, subtree: true });
	observer.observe(node.parentNode, { attributes: true, childList: true, subtree: true });

	return {
		update(newParams: AnimationParameters) {
			Object.assign(params, newParams);
		},
		destroy() {
			observer.disconnect();
		}
	};
}
