// src/adapters/motionOneAdapter.ts
import type { AnimationEngine } from '../animation-interface.js';
import { animate as animeAnimate } from 'animejs';
import { mapTransitionToAnimeJS } from '../utils.js';

export const AnimeEngine: AnimationEngine = {
	animate(element, params) {
		const { animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
		//Mapping animation to motion
		const animationOptions = mercuryAnimation;
		//Mapping transition to motion
		const transitionOptions = mapTransitionToAnimeJS(mercuryTransition, callbacks);
		const animation = animeAnimate(element, { ...animationOptions, ...transitionOptions });

		const instance = {
			completed: false,
			play: () => animation.restart(),
			pause: () => animation.pause(),
			cancel: () => animation.cancel(),
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
