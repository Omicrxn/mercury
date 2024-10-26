import type { MercuryParams } from './mercury.svelte.js';
import type { TargetsParam } from '@juliangarnierorg/anime-beta';
export function createEventListeners(
	node: Node,
	params: MercuryParams,
	updateAnimation: (node: HTMLElement, params: MercuryParams) => void
) {
	const { whileHover, whileTap, ...restParams } = params;
	// Store handler functions as named functions
	const handleEnter = (enterParams: MercuryParams | undefined) => {
		if (!enterParams) {
			return;
		}
		console.log('mouseOver', enterParams);
		updateAnimation(node as HTMLElement, enterParams);
	};

	const handleOut = () => {
		console.log('mouseOver', restParams);

		updateAnimation(node as HTMLElement, restParams);
	};

	// Add the listeners
	node.addEventListener('mouseover', () => handleEnter(whileHover));
	node.addEventListener('mouseout', handleOut);
	node.addEventListener('mousedown', () => handleEnter(whileTap));
	node.addEventListener('mouseup', handleOut);

	// Return the handlers so they can be used to remove listeners
	return {
		remove: () => {
			node.removeEventListener('mouseover', () => handleEnter(whileHover));
			node.removeEventListener('mouseout', handleOut);
		}
	};
}
