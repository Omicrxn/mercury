import type { AnimationParams } from '../animation-interface.js';
import {
	hover,
	animate as motionAnimate,
	type AnimationPlaybackControlsWithThen,
} from 'motion';
import { mapTransitionToMotion } from '../utils.js';

export const handleHover = (element: HTMLElement, params: AnimationParams)=>{
  if (params.whileHover || params.onHoverStart || params.onHoverEnd) {
		hover(element, (element, startEvent) => {
			params.onHoverStart?.(startEvent);
			let animation: AnimationPlaybackControlsWithThen | undefined;
			if (params.whileHover) {
				animation = motionAnimate(
					element,
					params.whileHover,
					mapTransitionToMotion(params.whileHover?.transition)
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
}
