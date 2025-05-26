import type { AnimationCallbacks, AnimationTransition } from "./animation-interface.js";
import { createSpring } from 'animejs';

export const mapTransitionToMotion = (
	mercuryTransition?: AnimationTransition,
	callbacks?: AnimationCallbacks
) => ({
	duration: mercuryTransition?.duration,
	autoplay: mercuryTransition?.autoplay,
	delay: mercuryTransition?.delay,
	ease: mercuryTransition?.ease,
	repeat: mercuryTransition?.repeat,
	repeatType: mercuryTransition?.repeatType,
	repeatDelay: mercuryTransition?.repeatDelay,
	type: mercuryTransition?.type,
	stiffness: mercuryTransition?.stiffness ?? 100,
	damping: mercuryTransition?.damping ?? 10,
	mass: mercuryTransition?.mass ?? 1,
	velocity: mercuryTransition?.velocity,
	...callbacks
});

export const mapTransitionToAnimeJS = (
	mercuryTransition?: AnimationTransition,
	callbacks?: AnimationCallbacks
) => ({
	duration: (mercuryTransition?.duration ?? 0.3) * 1000,
	autoplay: mercuryTransition?.autoplay,
	delay: (mercuryTransition?.delay ?? 0) * 1000,
	ease:
		mercuryTransition?.type === 'spring'
			? createSpring({
					stiffness: mercuryTransition?.stiffness,
					damping: mercuryTransition?.damping,
					mass: mercuryTransition?.mass,
					velocity: mercuryTransition?.velocity
				})
			: mercuryTransition?.ease,
	loop: mercuryTransition?.repeat,
	alternate: mercuryTransition?.repeatType === 'reverse',
	reversed: mercuryTransition?.repeatType === 'mirror',
	loopDelay: (mercuryTransition?.repeatDelay ?? 0) * 1000,
	...callbacks
});
