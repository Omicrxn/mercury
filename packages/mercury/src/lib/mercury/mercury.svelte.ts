import { animate as motionAnimate, type AnimationOptions } from 'motion';
import type { AnimationInstance, AnimationParams } from './animation-interface.js';
import { handleGestures } from './gestures/index.js';
import { mapTransitionToMotion } from './utils.js';

export const mercury = (options?: AnimationParams) => {
	return (element: HTMLElement) => {
		let animation: AnimationInstance | undefined;

		if (options?.animate) {
			const { animate, transition, callbacks } = options;
			const controls = motionAnimate(
				element,
				animate,
				mapTransitionToMotion(transition, callbacks) as AnimationOptions
			);

			const instance: AnimationInstance = {
				completed: false,
				play: () => controls.play(),
				pause: () => controls.pause(),
				stop: () => controls.stop(),
				cancel: () => controls.cancel(),
				onComplete: (onResolve, onReject) =>
					controls.then(() => {
						onResolve();
						instance.completed = true;
					}, onReject)
			};

			animation = instance;
			options.instance?.(instance);
		}

		const cleanupGestures = handleGestures(element, options);

		return () => {
			animation?.stop();
			cleanupGestures();
		};
	};
};
