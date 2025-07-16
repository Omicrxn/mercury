import type { AnimationEngine } from '../animation-interface.js';
import { animate as motionAnimate } from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const MotionEngine: AnimationEngine = {
	animate(element, params) {
		const { animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
		//Mapping animation to motion
		const animationOptions = mercuryAnimation;
		//Mapping transition to motion
		const transitionOptions = mapTransitionToMotion(mercuryTransition, callbacks);

		const animation = motionAnimate(element, animationOptions, transitionOptions);

		const instance = {
			completed: false,
			play: ()=> animation.play(),
			pause:  ()=> animation.pause(),
			cancel: ()=> animation.cancel(),
			onComplete: (onResolve: VoidFunction, onReject?: VoidFunction) => {
				return animation.then(() => {
					onResolve();
					// Update the completed flag on THIS instance
					instance.completed = true;
				}, onReject);
			}
		};

		return instance;
	}
};
