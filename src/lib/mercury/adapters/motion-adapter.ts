// src/adapters/motionOneAdapter.ts
import type { AnimationEngine } from '../animation-interface.js';
import { hover, animate as motionAnimate, press, inView } from 'motion';

export const MotionEngine: AnimationEngine = {
	animate(targets, params) {
		const { values, animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
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

		const animation = values
			? motionAnimate(values.from, values.to, transitionOptions)
			: motionAnimate(targets, animationOptions, transitionOptions);
		if (params.whileTap) {
			press(targets, () => {
				motionAnimate(targets, params.whileTap?.enter, params.whileTap?.transition);
				return () => motionAnimate(targets, params.whileTap?.exit ?? animationOptions, params.whileTap?.transition);
			});
		}
		if (params.whileHover) {
			hover(targets, () => {
				motionAnimate(targets, params.whileHover?.enter, params.whileHover?.transition);
				return () => motionAnimate(targets, params.whileHover?.exit ?? animationOptions, params.whileHover?.transition);
			});
		}
		if (params.scroll) {
			inView(targets, (element) => {
			  console.log("enter")
				motionAnimate(targets, params.scroll?.enter, params.scroll?.transition);
				return () => motionAnimate(targets, params.scroll?.exit ?? animationOptions, params.scroll?.transition);
			},{root: params.scroll.root, amount: params.scroll.amount});
		}
		const instance = {
			completed: false,
			play: () => animation.play(),
			pause: () => animation.pause(),
			cancel: () => animation.cancel(),
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
