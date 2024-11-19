import type { AnimationAttributes, AnimationCallbacks, AnimationControls, AnimationParams } from './animation-interface.js';

// export default function createEventListeners(
// 	node: Node,
// 	params: AnimationParams,
// 	updateAnimation: (node: HTMLElement, params: AnimationParams) => void
// ) {
// 	const { whileHover, whileTap, initial, animate } = params;
// 	// Store handler functions as named functions
// 	const handleEnter = (enterParams: AnimationParams | undefined) => {
// 		if (!enterParams) {
// 			return;
// 		}
// 		updateAnimation(node as HTMLElement, enterParams);
// 	};

// 	const handleOut = () => {
// 		if (initial) {
// 			updateAnimation(node as HTMLElement, animate);
// 		}
// 	};

// 	// Add the listeners
// 	if (whileHover) {
// 		node.addEventListener('mouseover', () => handleEnter(whileHover));
// 		node.addEventListener('mouseout', handleOut);
// 	}
// 	if (whileTap) {
// 		node.addEventListener('mousedown', () => handleEnter(whileTap));
// 		node.addEventListener('mouseup', handleOut);
// 	}

// 	// Return the handlers so they can be used to remove listeners
// 	return {
// 		remove: () => {
// 			node.removeEventListener('mouseover', () => handleEnter(whileHover));
// 			node.removeEventListener('mouseout', handleOut);
// 		}
// 	};
// }

// export function useScope(params: ScopeParams = {}) {
// 	let root = $state<DOMTargetSelector | undefined>(params.root);
// 	let scope = $state<Scope>();

// 	$effect(() => {
// 		if (!root) return;
// 		return untrack(() => {
// 			scope = new Scope({ ...params, root });
// 			return () => {
// 				scope?.revert();
// 				scope = undefined;
// 			};
// 		});
// 	});

// 	return {
// 		get root() {
// 			return root;
// 		},
// 		set root(value) {
// 			root = value;
// 		},
// 		get scope() {
// 			return scope;
// 		},
// 		add(...props: Parameters<Scope['add']>) {
// 			$effect(() => {
// 				if (!scope) return;
// 				return untrack(() => {
// 					scope?.add(...props);
// 				});
// 			});
// 			return this;
// 		},
// 		refresh() {
// 			scope?.refresh();
// 		}
// 	};
// }

// Helper Function
export function mergeParams({
  initial = {},
  animate = {},
}: AnimationParams): AnimationAttributes & AnimationCallbacks {
  const properties = new Set([...Object.keys(initial), ...Object.keys(animate)]);
  const result: AnimationAttributes & AnimationCallbacks = {};

  for (const prop of properties) {
    const initialValue = initial[prop];
    const animateValue = animate[prop];

    if (initialValue !== undefined && animateValue !== undefined) {
      // Both initial and animate exist for this property
      if (Array.isArray(animateValue)) {
        // animate is an array (keyframes)
        result[prop] = [initialValue, ...animateValue];
      } else {
        // animate is a single value
        result[prop] = [initialValue, animateValue];
      }
    } else if (initialValue !== undefined) {
      // Only initial exists
      result[prop] = initialValue;
    } else if (animateValue !== undefined) {
      // Only animate exists
      result[prop] = animateValue;
    }
    // If neither exists, do nothing
  }

  // Merge in the transition and callback parameters
  return { ...result };
}
