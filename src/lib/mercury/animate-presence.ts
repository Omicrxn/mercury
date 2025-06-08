import { animate } from 'motion';
import type { PresenceAnimation } from './animation-interface.js';
import { tick } from 'svelte';

export const presence = (
	element: HTMLElement,
	params: PresenceAnimation,
	options: { direction: 'in' | 'out' | 'both' }
) => {
	const { transition, mode, ...rest } = params;

	let animationMode = mode ?? 'sync';

	animate(element, rest, transition);
	let setMode = false;
	return {
		duration: (params.transition?.duration ?? 0.3) * 1000,
		delay: (params.transition?.delay ?? 0) * 1000,
		tick: (t) => {
			if (t < 1 && !setMode) {
				console.log('switch');
				if (mode === 'popLayout') {
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
