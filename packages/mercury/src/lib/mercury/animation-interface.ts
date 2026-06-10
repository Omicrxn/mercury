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
/** One side of a presence animation (enter or exit). */
export interface PresenceSpec extends AnimationAttributes {
	/** Overrides the shared `transition` for this direction. */
	transition?: AnimationTransition;
}
export interface PresenceAnimation extends AnimationAttributes {
	transition?: AnimationTransition;
	mode?: PresenceMode;
	/**
	 * The hidden state the element enters from (motion's `initial`). On enter it
	 * animates from these values to its settled CSS styles. Array values are
	 * treated as full keyframes.
	 */
	initial?: PresenceSpec;
	/** Exit spec (motion's `exit`): values the element animates to before removal. */
	exit?: PresenceSpec;
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
	/**
	 * Whether `animate` plays the first time the attachment is applied to an element.
	 * Defaults to `true`. Set to `false` (Motion's `initial={false}`) to render the
	 * element directly in its `animate` state on mount — keyframe arrays snap to their
	 * last frame — and only animate on subsequent updates.
	 *
	 * Note: this is NOT a from-state. The attachment runs after the element is already
	 * in the DOM, so it cannot paint a hidden starting style before the first frame.
	 * For "enter from a hidden state" use `initial` on `transition:presence` instead.
	 */
	animateOnMount?: boolean;
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
