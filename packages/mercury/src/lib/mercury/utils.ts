import type {
	AnimationCallbacks,
	AnimationTransition,
	EasingFunction
} from './animation-interface.js';

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
	loop: mercuryTransition?.repeat,
	alternate: mercuryTransition?.repeatType === 'reverse',
	reversed: mercuryTransition?.repeatType === 'mirror',
	loopDelay: (mercuryTransition?.repeatDelay ?? 0) * 1000,
	...callbacks
});

export const mapTransitionToGSAP = (
	mercuryTransition?: AnimationTransition,
	callbacks?: AnimationCallbacks
) => ({
	duration: mercuryTransition?.duration ?? 0.5,
	delay: mercuryTransition?.delay ?? 0,
	ease: mapToGSAPEasing(mercuryTransition?.ease),
	repeat: mercuryTransition?.repeat,
	reversed: mercuryTransition?.repeatType === 'reverse',
	yoyo: mercuryTransition?.repeatType === 'mirror',
	repeatDelay: mercuryTransition?.repeatDelay,

	...callbacks
});

export function mapToGSAPEasing(easing?: EasingFunction | EasingFunction[]): string | undefined {
	if (!easing) return easing;
	// Handle cubic bezier arrays
	if (Array.isArray(easing)) {
		const [x1, y1, x2, y2] = easing;
		return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
	}

	// Handle string easing functions
	switch (easing) {
		case 'linear':
			return 'none';
		case 'easeIn':
			return 'power1.in';
		case 'easeOut':
			return 'power1.out';
		case 'easeInOut':
			return 'power1.inOut';
		case 'circIn':
			return 'circ.in';
		case 'circOut':
			return 'circ.out';
		case 'circInOut':
			return 'circ.inOut';
		case 'backIn':
			return 'back.in';
		case 'backOut':
			return 'back.out';
		case 'backInOut':
			return 'back.inOut';
		case 'anticipate':
			return 'back.out(1.7)'; // Approximation of anticipate easing
		default:
			return easing.toString();
	}
}
