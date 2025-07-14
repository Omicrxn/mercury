import type { AnimationParams } from '../animation-interface.js';
import { animate as motionAnimate, motionValue, styleEffect, MotionValue } from 'motion';
import { DragGesture } from '@use-gesture/vanilla';

function runInertia(
	mv: MotionValue<number>,
	to: number,
	velocity: number,
	bounds?: [number, number]
) {
	return motionAnimate(mv, to, {
		type: 'inertia',
		velocity,
		...(bounds ? { min: bounds[0], max: bounds[1] } : {})
	});
}
export const handleDrag = (element: HTMLElement, params: AnimationParams) => {
	if (params.drag === true) {
		element.style.touchAction = 'none';
		element.style.cursor = 'pointer';
		let x = motionValue<number>(0);
		let y = motionValue<number>(0);

		styleEffect(element, { x, y });
		let numericBounds: { left: number; right: number; top: number; bottom: number } | undefined;
		const { bounds } = params.whileDrag || {};

		return new DragGesture(
			element,
			({
				_bounds,
				event,
				first,
				last,
				offset: [ox, oy],
				velocity: [vx, vy],
				direction: [dx, dy]
			}) => {
				if (first) {
					params.onDragStart?.(event);
				}
				if (last) {
					params.onDragEnd?.(event);
				}
				if (last) {
					runInertia(x, ox, vx * dx * 100, _bounds?.[0]);
					runInertia(y, oy, vy * dy * 100, _bounds?.[1]);
				} else {
					x.jump(ox);
					y.jump(oy);
				}
			},
			{
				from: () => [x.get(), y.get()],
				bounds: bounds,
				...params.whileDrag
			}
		);
	}
};
