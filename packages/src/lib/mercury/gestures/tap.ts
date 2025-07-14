import type { AnimationParams, InteractionAnimation } from '../animation-interface.js';
import {
	hover,
	animate as motionAnimate,
	press,
	inView,
	motionValue,
	styleEffect,
	type AnimationPlaybackControlsWithThen,
	MotionValue
} from 'motion';
import { DragGesture } from '@use-gesture/vanilla';
import { mapTransitionToMotion } from '../utils.js';

export const handleTap = (element: HTMLElement, params: AnimationParams)=>{
  if (params.whileTap || params.onTapStart || params.onTapEnd) {
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
}
