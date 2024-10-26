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

function createProjectionTree(node: HTMLElement, layoutId: string | null): ProjectionNode {
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
		if (layoutId) {
			projectionNode.identifyAs(layoutId);
		}
		projectionNode.attach(parentNode);
	}

	// Recursively create projection nodes for all child elements
	Array.from(node.children).forEach((child) => {
		if (child instanceof HTMLElement) {
			const childNode = createProjectionTree(child, null);
			// Child nodes automatically attach to their parent when created
			// but we make it explicit here for clarity
			childNode.attach(projectionNode);
		}
	});

	return projectionNode;
}

function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
	if (!node) return node;
	return node.parent ? findRootProjectionNode(node.parent) : node;
}
export function setupProjection(node: Node, layoutId: string | null) {
	const thisProjectionNode = createProjectionTree(node as HTMLElement, layoutId);

	const rootProjectionNode = findRootProjectionNode(thisProjectionNode);

	let snapshots = snapper.snapshotTree(rootProjectionNode);
	console.log('INITIAL', snapshots);
	// Setup mutation observer
	const observer = new MutationObserver((mutations) => {
		//TODO: This is done so that the animate doesn't trigger a infinite mutation loop but this doesn't trigger style changes without class changes
		const shouldUpdate = mutations.some(
			(mutation) =>
				(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
				mutation.type === 'childList'
		);
		if (shouldUpdate && rootProjectionNode) {
			console.log('mutatin...');

			animator.animate({ root: rootProjectionNode, from: snapshots }).then(() => {
				snapshots = snapper.snapshotTree(rootProjectionNode);
				console.log('AFTER', snapshots);
			});
		}
	});
	observer.observe(rootProjectionNode.element, {
		attributes: true,
		subtree: true,
		childList: true
	});

	return {
		destroy: () => {
			console.log('destroying');
			observer.disconnect();
			nodes.get(node)?.detach();
			nodes.delete(node);
		}
	};
}
