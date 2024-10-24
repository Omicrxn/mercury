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
export const nodes = new WeakMap<Node, ProjectionNode>();

function createProjectionTree(node: HTMLElement): ProjectionNode {
	// First create or get projection node for parent if it exists
	const parentNode =
		node.parentNode &&
		(nodes.get(node.parentNode) ||
			(() => {
				const newParent = new ProjectionNode(node.parentElement!, measurer);
				nodes.set(node.parentNode, newParent);
				return newParent;
			})());

	// Create and store projection node for current element
	const projectionNode = new ProjectionNode(node, measurer);
	nodes.set(node, projectionNode);

	// Attach to parent if exists
	if (parentNode) {
		projectionNode.attach(parentNode);
	}

	// Recursively create projection nodes for all child elements
	Array.from(node.children).forEach((child) => {
		if (child instanceof HTMLElement) {
			const childNode = createProjectionTree(child);
			// Child nodes automatically attach to their parent when created
			// but we make it explicit here for clarity
			childNode.attach(projectionNode);
		}
	});

	return projectionNode;
}
function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
	console.log('this node is', node);
	if (!node) return node;
	return node.parent ? findRootProjectionNode(node.parent) : node;
}
export function setupProjection(node: Node) {
	const thisProjectionNode = createProjectionTree(node as HTMLElement);
	const rootProjectionNode = findRootProjectionNode(thisProjectionNode);
	console.log('this element', thisProjectionNode);
	console.log('true root', rootProjectionNode);
	let snapshots = snapper.snapshotTree(rootProjectionNode);
	// Setup mutation observer
	const observer = useMutationObserver(
		() => node.parentNode,
		(mutations) => {
			const shouldUpdate = mutations.some(
				(mutation) =>
					(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
					mutation.type === 'childList'
			);
			if (shouldUpdate && rootProjectionNode) {
			animator.animate({ root: rootProjectionNode, from: snapshots }).then(() => {
				snapshots = snapper.snapshotTree(rootProjectionNode);
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
