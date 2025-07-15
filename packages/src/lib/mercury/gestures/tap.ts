import type { AnimationParams } from '../animation-interface.js';
import {
	animate as motionAnimate,
	press,
	type AnimationPlaybackControlsWithThen,
} from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleTap = (element: HTMLElement, params: AnimationParams | undefined) => {
	if (params?.whileTap || params?.onTapStart || params?.onTapEnd) {
		press(element, (element, startEvent) => {
			params.onTapStart?.(startEvent);
			let animation: AnimationPlaybackControlsWithThen | undefined;
			if (params.whileTap) {
				animation = motionAnimate(
					element,
					params.whileTap,
					mapTransitionToMotion(params.whileTap?.transition)
				);
			}

			return (endEvent) => {
				params.onTapEnd?.(endEvent);
				if (params.whileTap && animation) {
					animation.speed = -1;
					animation.play();
				}
			};
		});
	}
};
