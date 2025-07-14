import type { AnimationParams } from '../animation-interface.js';
import { animate as motionAnimate, inView, styleEffect } from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleScroll = (element: HTMLElement, params: AnimationParams) => {
	if (params.scroll) {
		inView(
			element,
			(element) => {
				motionAnimate(
					element,
					params.scroll?.enter,
					mapTransitionToMotion(params.scroll?.transition)
				);
				return () =>
					motionAnimate(
						element,
						params.scroll?.exit ?? params.animate,
						mapTransitionToMotion(params.scroll?.transition)
					);
			},
			{ root: params.scroll.root, amount: params.scroll.amount }
		);
	}
};
