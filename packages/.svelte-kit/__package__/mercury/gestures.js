import { hover, animate as motionAnimate, press, inView } from 'motion';
import { createDraggable } from 'animejs';
import { mapTransitionToMotion } from './utils.js';
export const handleGestures = (element, params) => {
    if (params.drag) {
        createDraggable(element, params.drag);
    }
    if (params.whileTap || params.onTapStart || params.onTapEnd) {
        press(element, (element, startEvent) => {
            params.onTapStart?.(startEvent);
            let animation;
            if (params.whileTap) {
                animation = motionAnimate(element, params.whileTap, mapTransitionToMotion(params.whileTap?.transition));
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
    if (params.whileHover || params.onHoverStart || params.onHoverEnd) {
        hover(element, (element, startEvent) => {
            params.onHoverStart?.(startEvent);
            let animation;
            if (params.whileHover) {
                animation = motionAnimate(element, params.whileHover, mapTransitionToMotion(params.whileHover?.transition));
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
    if (params.scroll) {
        inView(element, (element) => {
            motionAnimate(element, params.scroll?.enter, mapTransitionToMotion(params.scroll?.transition));
            return () => motionAnimate(element, params.scroll?.exit ?? params.animate, mapTransitionToMotion(params.scroll?.transition));
        }, { root: params.scroll.root, amount: params.scroll.amount });
    }
};
