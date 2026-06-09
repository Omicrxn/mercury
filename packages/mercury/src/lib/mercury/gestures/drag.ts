import type { AnimationParams } from '../animation-interface.js';
import {
	animate as motionAnimate,
	motionValue,
	styleEffect,
	type MotionValue,
	type AnimationPlaybackControlsWithThen
} from 'motion';
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

export const handleDrag = (element: HTMLElement, params: AnimationParams | undefined) => {
	if (params?.drag === true) {
		const prevTouchAction = element.style.touchAction;
		const prevCursor = element.style.cursor;
		element.style.touchAction = 'none';
		element.style.cursor = 'pointer';

		const x = motionValue<number>(0);
		const y = motionValue<number>(0);

		styleEffect(element, { x, y });

		const { axis, bounds, rubberband } = params.whileDrag ?? {};
		let inertiaX: AnimationPlaybackControlsWithThen | undefined;
		let inertiaY: AnimationPlaybackControlsWithThen | undefined;

		const gesture = new DragGesture(
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
					inertiaX?.stop();
					inertiaY?.stop();
					params.onDragStart?.(event);
				}
				if (last) {
					params.onDragEnd?.(event);
					inertiaX = runInertia(x, ox, vx * dx * 100, _bounds?.[0]);
					inertiaY = runInertia(y, oy, vy * dy * 100, _bounds?.[1]);
				} else {
					x.jump(ox);
					y.jump(oy);
				}
			},
			{
				from: () => [x.get(), y.get()],
				axis,
				bounds,
				rubberband
			}
		);

		return () => {
			inertiaX?.stop();
			inertiaY?.stop();
			gesture.destroy();
			element.style.touchAction = prevTouchAction;
			element.style.cursor = prevCursor;
		};
	}
};
