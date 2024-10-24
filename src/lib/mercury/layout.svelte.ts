import {
  ElementMeasurer,
  LayoutAnimator,
  ProjectionNode,
  ProjectionNodeSnapper,
  ProjectionTreeAnimationEngine,
  ProjectionNodeAnimationEngine,
  CssBorderRadiusParser,
  CssEasingParser,
  type ProjectionNodeSnapshot,
  ProjectionNodeSnapshotMap
} from '@layout-projection/core';
import { useMutationObserver } from 'runed';

// Types
interface ProjectionService {
  measurer: ElementMeasurer;
  snapper: ProjectionNodeSnapper;
  animator: LayoutAnimator;
}

interface ProjectionCleanup {
  destroy: () => void;
}

// Initialize core services as a singleton
class ProjectionServiceProvider {
  private static instance: ProjectionService;

  private static initialize(): ProjectionService {
    const measurer = new ElementMeasurer(new CssBorderRadiusParser());
    return {
      measurer,
      snapper: new ProjectionNodeSnapper(measurer),
      animator: new LayoutAnimator(
        new ProjectionTreeAnimationEngine(new ProjectionNodeAnimationEngine()),
        measurer,
        new CssEasingParser()
      )
    };
  }

  static getServices(): ProjectionService {
    if (!ProjectionServiceProvider.instance) {
      ProjectionServiceProvider.instance = ProjectionServiceProvider.initialize();
    }
    return ProjectionServiceProvider.instance;
  }
}

// Store projection nodes with type safety
const nodes = new WeakMap<Node, ProjectionNode>();

class ProjectionTreeBuilder {
  private services: ProjectionService;

  constructor() {
    this.services = ProjectionServiceProvider.getServices();
  }

  private createOrGetParentNode(parentElement: Node | null): ProjectionNode | null {
    if (!parentElement) return null;

    return (
      nodes.get(parentElement) ||
      (() => {
        if (!(parentElement instanceof HTMLElement)) return null;
        const newParent = new ProjectionNode(parentElement, this.services.measurer);
        nodes.set(parentElement, newParent);
        return newParent;
      })()
    );
  }

  private processChildNodes(node: HTMLElement, parentProjectionNode: ProjectionNode): void {
    Array.from(node.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        const childNode = this.buildTree(child, null);
        childNode.attach(parentProjectionNode);
      }
    });
  }

  buildTree(node: HTMLElement, layoutId: string | null): ProjectionNode {
    try {
      const parentNode = this.createOrGetParentNode(node.parentNode);
      const projectionNode = new ProjectionNode(node, this.services.measurer);

      nodes.set(node, projectionNode);

      if (parentNode) {
        if (layoutId) {
          projectionNode.identifyAs(layoutId);
        }
        projectionNode.attach(parentNode);
      }

      this.processChildNodes(node, projectionNode);
      return projectionNode;

    } catch (error) {
      console.error('Error building projection tree:', error);
      throw error;
    }
  }
}

function findRootProjectionNode(node: ProjectionNode): ProjectionNode {
  return node.parent ? findRootProjectionNode(node.parent) : node;
}

class MutationHandler {
  private snapshots: ProjectionNodeSnapshotMap;
  private services: ProjectionService;
  private rootNode: ProjectionNode;

  constructor(rootNode: ProjectionNode) {
    this.services = ProjectionServiceProvider.getServices();
    this.rootNode = rootNode;
    this.snapshots = this.services.snapper.snapshotTree(rootNode);
  }

  shouldHandleMutation(mutation: MutationRecord): boolean {
    return (
      (mutation.type === 'attributes' && mutation.attributeName === 'class') ||
      mutation.type === 'childList'
    );
  }

  async handleMutation(): Promise<void> {
    try {
      await this.services.animator.animate({
        root: this.rootNode,
        from: this.snapshots
      });
      this.snapshots = this.services.snapper.snapshotTree(this.rootNode);
    } catch (error) {
      console.error('Error handling mutation:', error);
    }
  }
}

export function setupProjection(node: Node, layoutId: string | null): ProjectionCleanup {
  if (!(node instanceof HTMLElement)) {
    throw new Error('Node must be an HTMLElement');
  }

  try {
    const treeBuilder = new ProjectionTreeBuilder();
    const projectionNode = treeBuilder.buildTree(node, layoutId);
    const rootNode = findRootProjectionNode(projectionNode);
    const mutationHandler = new MutationHandler(rootNode);

    const observer = useMutationObserver(
      () => rootNode.element,
      (mutations) => {
        const shouldUpdate = mutations.some((mutation) =>
          mutationHandler.shouldHandleMutation(mutation)
        );

        if (shouldUpdate && rootNode) {
          mutationHandler.handleMutation();
        }
      },
      { attributes: true, subtree: true, childList: true }
    );

    return {
      destroy: () => {
        observer.stop();
        const nodeToRemove = nodes.get(node);
        if (nodeToRemove) {
          nodeToRemove.detach();
          nodes.delete(node);
        }
      }
    };

  } catch (error) {
    console.error('Error setting up projection:', error);
    throw error;
  }
}
