import type { AnimationParams } from '../animation-interface.js';

import { handleDrag } from './drag.js';
import { handleScroll } from './scroll.js';
import { handleHover } from './hover.js';
import { handleTap } from './tap.js';

export const handleGestures = (element: HTMLElement, params: AnimationParams | undefined) => {
  
	let dragGesture = handleDrag(element, params);
	handleTap(element, params);
	handleHover(element, params);
	handleScroll(element, params);
	return () => {
		dragGesture?.destroy();
	};
};
