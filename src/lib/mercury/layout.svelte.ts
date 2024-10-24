import {
	ElementMeasurer,
	LayoutAnimator,
	ProjectionNode,
	ProjectionNodeSnapper,
	ProjectionTreeAnimationEngine,
	ProjectionNodeAnimationEngine,
	CssBorderRadiusParser,
	CssEasingParser
} from '@layout-projection/core';
import { useMutationObserver } from 'runed';
import { tick } from 'svelte';
// Initialize core services
const measurer = new ElementMeasurer(new CssBorderRadiusParser());
const snapper = new ProjectionNodeSnapper(measurer);
const animator = new LayoutAnimator(
	new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
	measurer,
	new CssEasingParser()
);
// Store projection nodes
const nodes = new WeakMap<Node, ProjectionNode>();
function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
	console.log('this node is', node);
	if (!node) return node;
	return node.parent ? findRootProjectionNode(node.parent) : node;
}
export default function setupProjection(node: Node) {
	// Get or create parent projection node
	const parentNode =
		node.parentNode &&
		(nodes.get(node.parentNode) ||
			(() => {
				const newParent = new ProjectionNode(node.parentElement!, measurer);
				nodes.set(node.parentNode, newParent);
				return newParent;
			})());
	// Create and store projection node
	const projectionNode = new ProjectionNode(node, measurer);
	nodes.set(node, projectionNode);
	// Attach to parent if exists
	if (parentNode) {
		projectionNode.attach(parentNode);
	}

	const rootNode = findRootProjectionNode(projectionNode);

	let snapshots = snapper.snapshotTree(rootNode);
	console.log('root', rootNode);
	// Setup mutation observer
	const observer = useMutationObserver(
		() => node.parentNode,
		(mutations) => {
			const shouldUpdate = mutations.some(
				(mutation) =>
					(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
					mutation.type === 'childList'
			);
			if (shouldUpdate && parentNode) {
				requestAnimationFrame(() => {
					tick().then(async () => {
						await animator.animate({ root: rootNode, from: snapshots });
						snapshots = snapper.snapshotTree(rootNode);
					});
				});
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
