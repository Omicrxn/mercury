// src/adapters/motionOneAdapter.ts
import type { AnimationEngine } from '../animation-interface.js';
import gsap from 'gsap'
import { mapTransitionToGSAP } from '../utils.js';

export const GSAPEngine: AnimationEngine = {
	animate(element, params) {
		const { animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
		//Mapping animation to motion
		const animationOptions = mercuryAnimation;
		//Mapping transition to motion
		const transitionOptions = mapTransitionToGSAP(mercuryTransition, callbacks);
		const animation = gsap.to(element, { ...animationOptions, ...transitionOptions });

		const instance = {
			completed: false,
			play: () => animation.restart(),
			pause: () => animation.pause(),
			cancel: () => animation.kill(),
			then: (onResolve: VoidFunction) => {
				return animation.then(() => {
					onResolve();
					// Update the completed flag on THIS instance
					instance.completed = true;
				});
			}
		};

		return instance;
	}
};
