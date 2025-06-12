import { MotionEngine } from './adapters/index.js';
import { handleGestures } from './gestures.js';
export const mercury = (options) => {
    const engine = options?.engine ?? MotionEngine;
    return (element) => {
        if (options) {
            let animation = engine.animate(element, options);
            options.instance?.(animation);
        }
        handleGestures(element, options);
        return () => { };
    };
};
