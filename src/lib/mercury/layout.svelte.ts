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
import { useMutationObserver } from 'runed';
import { tick } from 'svelte';

// Global WeakMap to store projection nodes
const nodes = new WeakMap<Node, ProjectionNode>();
const measurer = new ElementMeasurer(new CssBorderRadiusParser());
const snapper = new ProjectionNodeSnapper(measurer);
const animator = new LayoutAnimator(
	new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
	measurer,
	new CssEasingParser()
);

export default function setupProjection(node: Node) {
	let parentNode: ProjectionNode | undefined = undefined;
	if (node.parentNode && !nodes.has(node.parentNode)) {
		parentNode = new ProjectionNode(node.parentElement!, measurer);
		nodes.set(node.parentNode, parentNode);
	} else if (node.parentNode) {
		parentNode = nodes.get(node.parentNode);
	}

	const projectionNode = new ProjectionNode(node, measurer);
	nodes.set(node, projectionNode);
	// If parent element has a projection node, attach to it
	if (node.parentNode && nodes.has(node.parentNode)) {
		projectionNode.attach(nodes.get(node.parentNode));
	}
	console.log('parentNode', node, parentNode);
	let snapshots = snapper.snapshotTree(parentNode);
	const observer = useMutationObserver(
		() => node.parentNode,
		(mutations) => {
			for (const mutation of mutations) {
				if (
					(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
					mutation.type === 'childList'
				) {
					requestAnimationFrame(() => {
						if (parentNode) {
							console.log(snapshots);
							tick().then(() => {
								console.log('update');
								animator.animate({ root: parentNode, from: snapshots }).then(() => {
									snapshots = snapper.snapshotTree(parentNode);
								});
								console.log('element rect:', (node as HTMLElement).getBoundingClientRect());
							});
						}
					});
					break;
				}
			}
		},
		{ attributes: true, childList: true }
	);

	return {
		destroy: () => {
			observer.stop();
			nodes.delete(node);
		}
	};
}
