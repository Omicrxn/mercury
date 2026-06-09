import type { Easing } from 'motion';

export type { Easing };

export interface AnimationTransition {
	type?: 'decay' | 'spring' | 'keyframes' | 'tween' | 'inertia';
	duration?: number;
	/** Visual duration (seconds) for springs. Overrides `duration` when set. */
	visualDuration?: number;
	autoplay?: boolean;
	delay?: number;
	ease?: Easing | Easing[];
	/** Keyframe positions (0-1), one per animated keyframe. */
	times?: number[];
	repeat?: number;
	repeatType?: 'loop' | 'reverse' | 'mirror';
	repeatDelay?: number;
	/**
	 * Spring bounciness (0 = no bounce, 1 = very bouncy) for duration-based springs.
	 * Ignored by Motion if `stiffness`/`damping`/`mass` are set.
	 */
	bounce?: number;
	stiffness?: number;
	damping?: number;
	mass?: number;
	velocity?: number;
	restSpeed?: number;
	restDelta?: number;
}
/** Mirrors Motion's animation playback lifecycle callbacks. */
export interface AnimationCallbacks {
	onPlay?: () => void;
	onComplete?: () => void;
	onUpdate?: (latest: any) => void;
	onRepeat?: () => void;
	onStop?: () => void;
}
export interface AnimationAttributes {
	// Add other common animation parameters
	[key: string]: any;
}
export interface InteractionAnimation extends AnimationAttributes {
	transition?: AnimationTransition;
}
export type PresenceMode = 'sync' | 'wait' | 'popLayout';
export interface PresenceAnimation extends AnimationAttributes {
	transition?: AnimationTransition;
	mode?: PresenceMode;
}
export interface ScrollInteractionAnimation extends InteractionAnimation {
	root?: HTMLElement;
	margin?: string;
	amount?: number | 'all' | 'some' | undefined;
	enter?: AnimationAttributes;
	exit?: AnimationAttributes;
}
export interface DraggableParams {
	axis?: 'x' | 'y' | 'lock' | undefined;
	bounds?:
		| {
				left?: number;
				right?: number;
				top?: number;
				bottom?: number;
		  }
		| HTMLElement
		| { current: HTMLElement | null };
	rubberband?: boolean | number;
}
export interface AnimationParams {
	instance?: (instance: AnimationInstance) => void;
	animate?: AnimationAttributes;
	transition?: AnimationTransition;
	onHoverStart?: (event: PointerEvent) => void;
	onHoverEnd?: (event: PointerEvent) => void;
	whileHover?: InteractionAnimation;
	onTapStart?: (event: PointerEvent) => void;
	onTapEnd?: (event: PointerEvent) => void;
	whileTap?: InteractionAnimation;
	drag?: boolean;
	whileDrag?: DraggableParams;
	onDragStart?: (event: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent) => void;
	onDragEnd?: (event: PointerEvent | MouseEvent | TouchEvent | KeyboardEvent) => void;
	scroll?: ScrollInteractionAnimation;
	callbacks?: AnimationCallbacks;
}
export interface AnimationInstance {
	play: () => any | void;
	pause: () => any | void;
	stop: () => any | void;
	cancel: () => any | void;
	onComplete: (onResolve: VoidFunction, onReject?: VoidFunction) => Promise<any>;
	completed: boolean;
	// Add other necessary methods
}
