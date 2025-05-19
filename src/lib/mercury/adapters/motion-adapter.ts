// src/adapters/motionOneAdapter.ts
import type { AnimationEngine, EasingFunction} from '../animation-interface.js';
import { animate as motionAnimate } from 'motion';
import { mergeParams } from '../utils.svelte.js';

export const MotionEngine: AnimationEngine = {
	animate(targets, params) {
		const {values, animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
		//Mapping animation to motion
		const animationOptions = mercuryAnimation;
		//Mapping transition to motion
		const transitionOptions = {
			duration: mercuryTransition?.duration,
			autoplay: mercuryTransition?.autoplay,
			delay: mercuryTransition?.delay,
			ease: mercuryTransition?.ease,
			repeat: mercuryTransition?.repeat,
			repeatType: mercuryTransition?.repeatType,
			repeatDelay: mercuryTransition?.repeatDelay,
			type: mercuryTransition?.type,
			stiffness: mercuryTransition?.stiffness,
			damping: mercuryTransition?.damping,
			...callbacks
		};

		const animation = values? motionAnimate(values.from, values.to, transitionOptions) :motionAnimate(targets, animationOptions, transitionOptions);
		const instance = {
			completed: false,
			play: animation.play,
			pause: animation.pause,
			cancel: animation.cancel,
			then: (onResolve: VoidFunction, onReject?: VoidFunction) => {
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
