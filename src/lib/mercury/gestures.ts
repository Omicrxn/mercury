import type { AnimationParams } from './animation-interface.js';
import { hover, animate as motionAnimate, press, inView } from 'motion';
import {createDraggable} from 'animejs'
import { mapTransitionToMotion } from './utils.js';

export const handleGestures = (element: HTMLElement, params: AnimationParams) => {
  if(params.drag){
    createDraggable(element, params.drag);
  }
  if (params.whileTap) {
			press(element, () => {
				motionAnimate(
					element,
					params.whileTap?.enter,
					mapTransitionToMotion(params.whileTap?.transition)
				);
				return () =>
					motionAnimate(
						element,
						params.whileTap?.exit ?? params.animate,
						mapTransitionToMotion(params.whileTap?.transition)
					);
			});
		}
		if (params.whileHover) {
			hover(element, () => {
				motionAnimate(
					element,
					params.whileHover?.enter,
					mapTransitionToMotion(params.whileHover?.transition)
				);
				return () =>
					motionAnimate(
						element,
						params.whileHover?.exit ?? params.animate,
						mapTransitionToMotion(params.whileHover?.transition)
					);
			});
		}
		if (params.scroll) {
			inView(
				element,
				(element) => {
					console.log('enter');
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
