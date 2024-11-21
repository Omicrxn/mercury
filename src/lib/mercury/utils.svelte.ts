import type { AnimationAttributes, AnimationCallbacks,  AnimationParams } from './animation-interface.js';
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
