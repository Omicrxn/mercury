import type { AnimationOptions, Transition } from 'motion';

/**
 * Maps a transition onto Motion's `animate()` options for the animations Mercury runs
 * outside a `mercury()` node (`presence`'s shorthand and layout animations), applying
 * reduced motion: transforms and layout jump, other values keep a short fade.
 */
export const mapTransitionToMotion = (transition?: Transition): AnimationOptions => {
	const options: Record<string, unknown> = { ...transition, reduceMotion: prefersReducedMotion() };

	if (options.reduceMotion) {
		options.type = 'keyframes';
		options.duration = Math.min((transition as { duration?: number })?.duration ?? 0.2, 0.2);
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
