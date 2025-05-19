import type { AnimationEngine, AnimationParams } from './animation-interface.js';
import { MotionEngine } from './adapters/motion-adapter.js';
import { animate } from 'motion';
import pose from 'popmotion-pose';
import { setupProjection } from './layout.svelte.js';
export const mercury = (options: AnimationParams) => {
	const engine: AnimationEngine = options?.engine ?? MotionEngine;
	return (element: HTMLElement) => {
		console.log('🫡 element created');
		const layoutId = element.getAttribute('layout');
		let projection = null;
		if (element.hasAttribute('drag')) {
			console.log('IT HAS DRAG');
			pose(element, { draggable: true });
		}

		if (element.hasAttribute('layout') || layoutId) {
		console.log('IT HAS FLIP');

			projection = setupProjection(element, layoutId);
		}

		if (options) {
			engine.animate(element, options);
		}
		return async () => {
			console.log('🧹 element removed');
			projection?.destroy()
		};
	};
};
