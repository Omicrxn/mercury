import type { AnimationParams } from '../animation-interface.js';
import {
	hover,
	animate as motionAnimate,
	type AnimationOptions,
	type AnimationPlaybackControlsWithThen,
} from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleHover = (element: HTMLElement, params: AnimationParams | undefined) => {
	if (params?.whileHover || params?.onHoverStart || params?.onHoverEnd) {
		return hover(element, (element, startEvent) => {
			params.onHoverStart?.(startEvent);
			let animation: AnimationPlaybackControlsWithThen | undefined;
			if (params.whileHover) {
				const { transition, ...keyframes } = params.whileHover;
				animation = motionAnimate(
					element,
					keyframes,
					mapTransitionToMotion(transition) as AnimationOptions
				);
			}

			return (endEvent) => {
				params.onHoverEnd?.(endEvent);
				if (params.whileHover && animation) {
					animation.speed = -1;
					animation.play();
				}
			};
		});
	}
};
