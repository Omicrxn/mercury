import type { AnimationParams } from '../animation-interface.js';
import { animate as motionAnimate, inView, type AnimationOptions } from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleScroll = (element: HTMLElement, params: AnimationParams | undefined) => {
	if (params?.scroll) {
		const scroll = params.scroll;
		const transitionOptions = mapTransitionToMotion(scroll.transition) as AnimationOptions;
		return inView(
			element,
			(element) => {
				motionAnimate(element, scroll.enter ?? {}, transitionOptions);
				return () =>
					motionAnimate(element, scroll.exit ?? params.animate ?? {}, transitionOptions);
			},
			{
				root: scroll.root,
				amount: scroll.amount,
				margin: scroll.margin
			} as Parameters<typeof inView>[2]
		);
	}
};
