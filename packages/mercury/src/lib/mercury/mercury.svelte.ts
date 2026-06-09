import {
	animate as motionAnimate,
	type AnimationOptions,
	type DOMKeyframesDefinition
} from 'motion';
import type { AnimationInstance, AnimationParams } from './animation-interface.js';
import { handleGestures } from './gestures/index.js';
import {
	hasPendingWaitExit,
	registerMercuryControls,
	runAfterPendingExit,
	stopMercury
} from './presence-coordinator.js';
import { mapTransitionToMotion } from './utils.js';
import { clearPresence } from './animate-presence.js';

/** Elements that have had a mercury `animate` applied at least once (for `initial: false`). */
const initialized = new WeakSet<HTMLElement>();

export const mercury = (options?: AnimationParams) => {
	return (element: HTMLElement) => {
		let animation: AnimationInstance | undefined;
		let disposed = false;

		clearPresence(element);

		if (options?.animate && options.initial === false && !initialized.has(element)) {
			initialized.add(element);
			// motion's `initial={false}`: render the settled `animate` state on first
			// application (keyframe arrays snap to their last frame), animate on updates.
			motionAnimate(element, options.animate as DOMKeyframesDefinition, { duration: 0 });
		} else if (options?.animate) {
			initialized.add(element);
			const { animate, transition, callbacks } = options;

			const startAnimation = () => {
				if (disposed) return;

				const controls = motionAnimate(
					element,
					animate,
					mapTransitionToMotion(transition, callbacks) as AnimationOptions
				);

				registerMercuryControls(element, controls);

				const instance: AnimationInstance = {
					completed: false,
					play: () => controls.play(),
					pause: () => controls.pause(),
					stop: () => controls.stop(),
					cancel: () => controls.cancel(),
					onComplete: (onResolve, onReject) =>
						controls.then(() => {
							onResolve();
							instance.completed = true;
						}, onReject)
				};

				animation = instance;
				options.instance?.(instance);
			};

			const scheduleEnter = () => {
				if (disposed) return;
				if (hasPendingWaitExit(element)) {
					runAfterPendingExit(element, startAnimation);
				} else {
					startAnimation();
				}
			};

			// One microtask so out:presence can register wait in the same commit.
			queueMicrotask(scheduleEnter);
		}

		const cleanupGestures = handleGestures(element, options);

		return () => {
			disposed = true;
			stopMercury(element);
			animation?.stop();
			cleanupGestures();
		};
	};
};
