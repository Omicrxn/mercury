import type { DraggableParams } from 'animejs';

// src/animationInterface.ts
export interface AnimationEngine {
	animate(element: HTMLElement, params: AnimationParams): AnimationInstance;
}
export type EasingFunction =
	| readonly [number, number, number, number]
	| 'linear'
	| 'easeIn'
	| 'easeOut'
	| 'easeInOut'
	| 'circIn'
	| 'circOut'
	| 'circInOut'
	| 'backIn'
	| 'backOut'
	| 'backInOut'
	| 'anticipate'
	| string;

export interface AnimationTransition {
	duration?: number;
	autoplay?: boolean;
	delay?: number;
	ease?: EasingFunction | EasingFunction[];
	repeat?: number;
	repeatType?: 'loop' | 'reverse' | 'mirror';
	repeatDelay?: number;
	type?: 'decay' | 'spring' | 'keyframes' | 'tween' | 'inertia';
	stiffness?: number;
	damping?: number;
	velocity?: number;
	mass?: number;
}
export interface AnimationCallbacks {
	onBegin?: () => void;
	onComplete?: () => void;
	onUpdate?: (value: any) => void;
	onRender?: () => void;
	onLoop?: () => void;
}
export interface AnimationAttributes {
	// Add other common animation parameters
	[key: string]: any;
}
export interface InteractionAnimation extends AnimationAttributes {
	transition?: AnimationTransition;
}
export interface ScrollInteractionAnimation extends InteractionAnimation {
	root?: HTMLElement;
	margin?: string;
	amount?: number | 'all' | 'some' | undefined;
	enter?: AnimationAttributes;
	exit?: AnimationAttributes;
}

export interface AnimationParams {
	instance?: (instance: AnimationInstance) => void;
	layoutId?: string;
	layout?: boolean;
	animate?: AnimationAttributes;
	transition?: AnimationTransition;
	onHoverStart?: (event: PointerEvent) => void;
	onHoverEnd?: (event: PointerEvent) => void;
	whileHover?: InteractionAnimation;
	onTapStart?: (event: PointerEvent) => void;
	onTapEnd?: (event: PointerEvent) => void;
	whileTap?: InteractionAnimation;
	drag?: DraggableParams;
	scroll?: ScrollInteractionAnimation;
	engine?: AnimationEngine;
	callbacks?: AnimationCallbacks;
}
export interface AnimationInstance {
	play: () => any | void;
	pause: () => any | void;
	cancel: () => any | void;
	then: (onResolve: VoidFunction, onReject?: VoidFunction) => Promise<any>;
	completed: boolean;
	// Add other necessary methods
}
