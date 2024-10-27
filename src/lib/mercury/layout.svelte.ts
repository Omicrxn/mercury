import {
	ElementMeasurer,
	LayoutAnimator,
	ProjectionNode,
	ProjectionNodeSnapper,
	ProjectionTreeAnimationEngine,
	ProjectionNodeAnimationEngine,
	CssBorderRadiusParser,
	CssEasingParser,
	ProjectionNodeSnapshotMap
} from '@layout-projection/core';
import { watch } from 'runed';

// Initialize core services
const measurer = new ElementMeasurer(new CssBorderRadiusParser());
const snapper = new ProjectionNodeSnapper(measurer);
const animator = new LayoutAnimator(
	new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
	measurer,
	new CssEasingParser()
);

// Store projection nodes
export const nodes = $state(new WeakMap<Node, ProjectionNode>());

function createProjectionTree(node: HTMLElement, layoutId: string | null): ProjectionNode {
	// First create or get projection node for parent if it exists
	const projectionNode = new ProjectionNode(node, measurer);
	let parentNode = node.parentElement;
	if (layoutId) {
		projectionNode.identifyAs(layoutId);
	}
	nodes.set(node, projectionNode);
	while (parentNode) {
		if (nodes.has(parentNode)) {
			projectionNode.parent = nodes.get(parentNode);
			break;
		}
		parentNode = parentNode.parentElement;
	}
	for (const childNode of node.children) {
		if (nodes.has(childNode)) {
			const childProjectionNode = nodes.get(childNode);
			childProjectionNode?.attach(projectionNode);
		}
	}

	return projectionNode;
}

function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
	if (!node) return node;
	return node.parent ? findRootProjectionNode(node.parent) : node;
}
export function setupProjection(node: Node, layoutId: string | null) {
	const thisProjectionNode = createProjectionTree(node as HTMLElement, layoutId);
	let rootProjectionNode: ProjectionNode | null = null;
	let snapshots: ProjectionNodeSnapshotMap | null = null;
	let observer: MutationObserver | null = null;
	watch(
		() => nodes,
		() => {
			rootProjectionNode = findRootProjectionNode(thisProjectionNode);
		}
	);

	watch(
		() => rootProjectionNode,
		() => {
			if (rootProjectionNode?.id === thisProjectionNode.id) {
				console.log('test', thisProjectionNode);
				snapshots = snapper.snapshotTree(thisProjectionNode);
				observer = new MutationObserver((mutations) => {
					//TODO: This is done so that the animate doesn't trigger a infinite mutation loop but this doesn't trigger style changes without class changes
					const shouldUpdate = mutations.some(
						(mutation) =>
							(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
							mutation.type === 'childList'
					);
					if (shouldUpdate && rootProjectionNode) {
						console.log('mutatin...');

						animator
							.animate({ root: rootProjectionNode, from: snapshots, estimation: true })
							.then(() => {
								if (rootProjectionNode) {
									snapshots = snapper.snapshotTree(rootProjectionNode);
									// 	console.log('snapshot taken on ', rootProjectionNode.id);
								}
								// console.log('AFTER', snapshots);
							});
					}
				});
				observer.disconnect();
				if (rootProjectionNode) {
					observer.observe(rootProjectionNode.element, {
						attributes: true,
						childList: true,
						subtree: true
					});
				}
			}
		}
	);

	return {
		destroy: () => {
			console.log('destroying');
			if (observer) {
				observer.disconnect();
			}
			const projNode = nodes.get(node);
			if (projNode?.parent) {
				projNode?.detach();
			}
			if (nodes) nodes.delete(node);
		}
	};
}
