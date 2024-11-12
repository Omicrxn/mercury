import type { MercuryParams } from './mercury.svelte.js';
import type { AnimationParams } from '@juliangarnierorg/anime-beta';
export default function createEventListeners(
	node: Node,
	params: MercuryParams,
	updateAnimation: (node: HTMLElement, params: AnimationParams) => void
) {
	const { whileHover, whileTap, initial } = params;
	// Store handler functions as named functions
	const handleEnter = (enterParams: MercuryParams | undefined) => {
		if (!enterParams) {
			return;
		}
		updateAnimation(node as HTMLElement, enterParams);
	};

	const handleOut = () => {
		if (initial) {
			updateAnimation(node as HTMLElement, initial);
		}
	};

	// Add the listeners
	if (whileHover) {
		node.addEventListener('mouseover', () => handleEnter(whileHover));
		node.addEventListener('mouseout', handleOut);
	}
	if (whileTap) {
		node.addEventListener('mousedown', () => handleEnter(whileTap));
		node.addEventListener('mouseup', handleOut);
	}

	// Return the handlers so they can be used to remove listeners
	return {
		remove: () => {
			node.removeEventListener('mouseover', () => handleEnter(whileHover));
			node.removeEventListener('mouseout', handleOut);
		}
	};
}
