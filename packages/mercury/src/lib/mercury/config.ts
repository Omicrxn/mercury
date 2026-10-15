import type { MotionConfigOptions } from './animation-interface.js';
import { setMotionConfig } from './node.js';

/**
 * Motion's `<MotionConfig>` as an attachment: `{@attach motionConfig({ transition, reducedMotion })}`
 * sets defaults for every `mercury()` element inside the element it's on. The nearest one wins,
 * and an element's own `transition` overrides the default.
 */
export const motionConfig = (options: MotionConfigOptions) => (element: Element) => {
	setMotionConfig(element, options);
	return () => setMotionConfig(element, undefined);
};
