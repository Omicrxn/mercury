import type { AnimationOptions } from 'motion';
import type { AnimationCallbacks, AnimationTransition } from './animation-interface.js';

/**
 * Maps Mercury's transition + callbacks onto Motion's `animate()` options.
 *
 * Undefined fields are stripped before returning. This matters for springs:
 * Motion only uses a duration-based spring (`duration`/`bounce`) when no physics
 * options (`stiffness`/`damping`/`mass`) are present — it overrides `duration`
 * and `bounce` the moment any physics option is set. The previous mapper injected
 * `stiffness`/`damping`/`mass` defaults unconditionally, which forced every spring
 * into physics mode and silently discarded `duration`/`bounce`.
 */
export const mapTransitionToMotion = (
	mercuryTransition?: AnimationTransition,
	callbacks?: AnimationCallbacks
): AnimationOptions => {
	const options: Record<string, unknown> = {
		reduceMotion: prefersReducedMotion(),
		type: mercuryTransition?.type,
		duration: mercuryTransition?.duration,
		visualDuration: mercuryTransition?.visualDuration,
		bounce: mercuryTransition?.bounce,
		autoplay: mercuryTransition?.autoplay,
		delay: mercuryTransition?.delay,
		ease: mercuryTransition?.ease,
		times: mercuryTransition?.times,
		repeat: mercuryTransition?.repeat,
		repeatType: mercuryTransition?.repeatType,
		repeatDelay: mercuryTransition?.repeatDelay,
		stiffness: mercuryTransition?.stiffness,
		damping: mercuryTransition?.damping,
		mass: mercuryTransition?.mass,
		velocity: mercuryTransition?.velocity,
		restSpeed: mercuryTransition?.restSpeed,
		restDelta: mercuryTransition?.restDelta,
		onPlay: callbacks?.onPlay,
		onComplete: callbacks?.onComplete,
		onUpdate: callbacks?.onUpdate,
		onRepeat: callbacks?.onRepeat,
		onStop: callbacks?.onStop
	};

	for (const key of Object.keys(options)) {
		if (options[key] === undefined) delete options[key];
	}

	if (options.reduceMotion) {
		options.type = 'keyframes';
		options.duration = Math.min(mercuryTransition?.duration ?? 0.2, 0.2);
		options.delay = 0;
		options.repeat = 0;
		options.repeatDelay = 0;
	}

	return options as AnimationOptions;
};

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}
