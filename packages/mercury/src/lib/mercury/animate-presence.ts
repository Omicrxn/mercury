import { animate, type AnimationOptions } from 'motion';
import type { PresenceAnimation } from './animation-interface.js';
import { mapTransitionToMotion } from './utils.js';

export const presence = (
	element: HTMLElement,
	params: PresenceAnimation,
	options: { direction: 'in' | 'out' | 'both' }
) => {
	if (options.direction !== 'out') {
		throw new Error('presence must be used as out transition');
	}
	const { transition, popLayout, ...rest } = params;

	animate(element, rest, mapTransitionToMotion(transition) as AnimationOptions);
	let setMode = false;
	return {
		duration: (params.transition?.duration ?? 0.3) * 1000,
		delay: (params.transition?.delay ?? 0) * 1000,
		tick: (t: number) => {
			if (t < 1 && !setMode) {
				if (popLayout) {
					if (element.parentElement) {
						element.parentElement.style.position = 'relative';
						element.style.position = 'absolute';
					}
				}
				setMode = true;
			}
		}
	};
};
