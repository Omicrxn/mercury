import { motionValue, scroll, type MotionValue } from 'motion';
import type { ElementRef } from './animation-interface.js';

type Getter<T> = T | (() => T);

export interface ScrollValuesOptions {
	/** The scrollable element to track. Defaults to the page. */
	container?: Getter<ElementRef>;
	/** Track this element's progress through the container instead of the container's scroll. */
	target?: Getter<ElementRef>;
	axis?: 'x' | 'y';
	/** Motion's scroll offsets, e.g. `['start end', 'end start']`. */
	offset?: NonNullable<Parameters<typeof scroll>[1]>['offset'];
}

export interface ScrollValues {
	scrollX: MotionValue<number>;
	scrollY: MotionValue<number>;
	scrollXProgress: MotionValue<number>;
	scrollYProgress: MotionValue<number>;
}

const resolve = (value: Getter<ElementRef>): Element | null | undefined => {
	const ref = typeof value === 'function' ? value() : value;
	if (!ref) return undefined;
	return ref instanceof Element ? ref : ref.current;
};

/**
 * Motion's `useScroll()`: motion values for scroll position and progress, to pass to
 * `mercury({ style })` or derive from with Motion's `transformValue` / `mapValue` /
 * `springValue`. Call it in a component's `<script>`; it stops tracking when the
 * component is destroyed. `container` and `target` accept getters, so they can point
 * at elements bound with `bind:this`.
 */
export function scrollValues(options: ScrollValuesOptions = {}): ScrollValues {
	const values: ScrollValues = {
		scrollX: motionValue(0),
		scrollY: motionValue(0),
		scrollXProgress: motionValue(0),
		scrollYProgress: motionValue(0)
	};

	$effect(() => {
		const container = options.container ? resolve(options.container) : undefined;
		const target = options.target ? resolve(options.target) : undefined;
		// Wait for bound elements.
		if ((options.container && !container) || (options.target && !target)) return;

		return scroll(
			(_progress: number, info: any) => {
				values.scrollX.set(info.x.current);
				values.scrollXProgress.set(info.x.progress);
				values.scrollY.set(info.y.current);
				values.scrollYProgress.set(info.y.progress);
			},
			{
				container: (container ?? undefined) as HTMLElement | undefined,
				target: target ?? undefined,
				axis: options.axis,
				offset: options.offset
			}
		);
	});

	return values;
}
