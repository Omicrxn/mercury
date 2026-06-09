import type { AnimationParams } from '../animation-interface.js';
import {
	animate as motionAnimate,
	press,
	type AnimationOptions,
	type AnimationPlaybackControlsWithThen,
} from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleTap = (element: HTMLElement, params: AnimationParams | undefined) => {
	if (params?.whileTap || params?.onTapStart || params?.onTapEnd) {
		return press(element, (element, startEvent) => {
			params.onTapStart?.(startEvent);
			let animation: AnimationPlaybackControlsWithThen | undefined;
			if (params.whileTap) {
				const { transition, ...keyframes } = params.whileTap;
				animation = motionAnimate(
					element,
					keyframes,
					mapTransitionToMotion(transition) as AnimationOptions
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
