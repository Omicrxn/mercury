import { MotionEngine } from './adapters/index.js';
import type { AnimationEngine, AnimationParams } from './animation-interface.js';
import { handleGestures } from './gestures.js';

export const mercury = (options?: AnimationParams) => {
	const engine: AnimationEngine = options?.engine ?? MotionEngine;

	return (element: HTMLElement) => {
		if (options) {
			let animation = engine.animate(element, options);
			options.instance?.(animation);
		}
		handleGestures(element, options);

		return () => {};
	};
};
