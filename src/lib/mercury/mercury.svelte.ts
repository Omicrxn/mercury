import type { AnimationEngine, AnimationParams } from './animation-interface.js';
import { MotionEngine } from './adapters/motion-adapter.js';
export const mercury = (options: AnimationParams) => {
	const engine: AnimationEngine = options?.engine ?? MotionEngine;

	return (element: HTMLElement) => {
		if (options) {
			engine.animate(element, options);
		}
		return () => {};
	};
};
