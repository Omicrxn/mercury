// src/adapters/motionOneAdapter.ts
import type { AnimationEngine } from '../animation-interface.js';
import { animate as motionAnimate } from 'motion';
import { mergeParams } from '../utils.svelte.js';

export const MotionAdapter: AnimationEngine = {
	animate(targets, params) {
		const { initial, animate: animateAttrs, transition } = params;
		const mergedParams = mergeParams({ initial, animate: animateAttrs });
		const animation = motionAnimate(targets, mergedParams, transition);

		return {
			play: () => animation.play(),
			pause: () => animation.pause(),
			cancel: () => animation.cancel(),
			then: (callback) => animation.then(callback)
		};
	}
};
