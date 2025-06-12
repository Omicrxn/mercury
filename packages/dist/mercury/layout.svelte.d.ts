import { ProjectionNode } from '@layout-projection/core';
import { type AnimationConfig } from '@layout-projection/animation';
/**
 * Map of DOM elements to their projection nodes.
 */
export declare const nodeMap: WeakMap<HTMLElement, ProjectionNode>;
export declare const layout: ({ layoutId, track, animationConfig }: {
    layoutId?: string;
    track: () => any;
    animationConfig: AnimationConfig;
}) => (element: HTMLElement) => () => void;
