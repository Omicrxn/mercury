// src/adapters/motionOneAdapter.ts
import type { AnimationEngine, EasingFunction } from '../animation-interface.js';
import { animate as motionAnimate } from 'motion';
import { mergeParams } from '../utils.svelte.js';
function mapEasing(easing?: EasingFunction): any {
	if (!easing) return undefined;

	if (typeof easing === 'string') {
		// Directly use the easing string if it's one of Motion One's built-in easings
		return { type: easing };
	} else if (typeof easing === 'object') {
		if (easing.type === 'spring') {
			// Motion One supports spring easing
			return {
				type: 'spring',
				...(easing.stiffness !== undefined && { stiffness: easing.stiffness }),
				...(easing.damping !== undefined && { damping: easing.damping }),
				...(easing.mass !== undefined && { mass: easing.mass }),
				...(easing.bounce !== undefined && { bounce: easing.bounce }),
				...(easing.restSpeed !== undefined && { restSpeed: easing.restSpeed }),
				...(easing.restDelta !== undefined && { restSpeed: easing.restDelta })
			};
		} else if (easing.type === 'cubic-bezier') {
			return `cubic-bezier(${easing.x1}, ${easing.y1}, ${easing.x2}, ${easing.y2})`;
		} else if (easing.type === 'steps') {
			return `steps(${easing.steps})`;
		} else {
			return 'linear';
		}
	}

	return 'linear';
}
export const MotionAdapter: AnimationEngine = {
	animate(targets, params) {
		const { initial, animate: animateAttrs, transition } = params;
		const mergedParams = mergeParams({ initial, animate: animateAttrs });
		const mappedEasing = mapEasing(transition?.ease);
		const motionTransition = {
			...transition,
			...mappedEasing
		};
		console.log(motionTransition);
		const animation = motionAnimate(targets, mergedParams, motionTransition);

		return {
			play: () => animation.play(),
			pause: () => animation.pause(),
			cancel: () => animation.cancel(),
			then: (callback) => animation.then(callback),
			completed: animation.then(() => true)
		};
	}
};
