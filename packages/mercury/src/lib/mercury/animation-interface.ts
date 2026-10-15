import type {
	AnimationPlaybackControls,
	BoundingBox,
	Easing,
	MotionNodeOptions,
	MotionValue,
	Point,
	ReducedMotionConfig,
	TargetAndTransition,
	Transition,
	VariantLabels,
	Variants
} from 'motion';
import type { DragControls } from './gestures/drag/drag-controls.js';

export type { Easing, TargetAndTransition, Transition, VariantLabels, Variants };

/** An element, or a `{ current }` ref to one (Motion's React ref shape). */
export type ElementRef = Element | { current: Element | null } | null | undefined;

/** Motion's `viewport` options. `root` also accepts an element directly (e.g. a `bind:this` reference). */
export interface ViewportOptions {
	root?: ElementRef;
	once?: boolean;
	margin?: string;
	amount?: 'some' | 'all' | number;
}

/**
 * Options for the `mercury()` attachment. These are Motion's `motion.*` component props
 * (`initial`, `animate`, `exit`, `variants`, `transition`, `whileHover`, `whileTap`,
 * `whileFocus`, `whileDrag`, `whileInView`, `drag*`, `onPan*`, `layout`, `layoutId`, …),
 * applied to the element the attachment is on.
 */
export interface MercuryOptions extends Omit<
	MotionNodeOptions,
	| 'viewport'
	| 'dragConstraints'
	| 'dragControls'
	| 'layoutDependency'
	| 'layoutAnchor'
	| 'ignoreStrict'
	| '_dragX'
	| '_dragY'
	| 'data-framer-portal-id'
	| 'data-framer-appear-id'
> {
	viewport?: ViewportOptions;
	/**
	 * Constrains dragging: pixel offsets from the element's position (`{ left, right, top, bottom }`),
	 * or an element (or `{ current }` ref) whose box the element must stay inside.
	 */
	dragConstraints?: false | Partial<BoundingBox> | ElementRef;
	/** Start drags from another element's pointer events, see `createDragControls()`. */
	dragControls?: DragControls;
	/**
	 * Mercury addition: move a focused draggable element with the arrow keys (Shift for
	 * 5× steps). `true` (default) steps 10px, a number sets the step, `false` turns it off.
	 */
	dragKeyboard?: boolean | number;
	/**
	 * Motion values to render on the element (Motion's `style` prop with motion values):
	 * `style: { x, opacity }`. Static styles belong in Svelte's `style` attribute.
	 */
	style?: Record<string, MotionValue<number> | MotionValue<string>>;
	/** A motion value rendered as the element's text (Motion's `children={motionValue}`). */
	text?: MotionValue<number> | MotionValue<string>;
	/** Playback controls for the animations each `animate` change starts. */
	instance?: (instance: AnimationInstance) => void;

	/** @deprecated Use `initial: false`. */
	animateOnMount?: boolean;
	/** @deprecated Use `drag: 'x' | 'y'`, `dragDirectionLock`, `dragConstraints` and `dragElastic`. */
	dragOptions?: DragOptions;
	/** @deprecated Use `whileInView` and `viewport`. */
	scroll?: ScrollInteractionAnimation;
	/** @deprecated Use `onAnimationStart`, `onAnimationComplete` and `onUpdate`. */
	callbacks?: AnimationCallbacks;
	/** @deprecated Use `onTap` (completed press) and `onTapCancel` (press released outside). */
	onTapEnd?: (event: PointerEvent) => void;
}

/** Motion's `<MotionConfig>` options, applied with the `motionConfig()` attachment. */
export interface MotionConfigOptions {
	/** Default transition for every Mercury element inside. */
	transition?: Transition;
	/** `'user'` follows the OS setting (default), `'always'` and `'never'` force it. */
	reducedMotion?: ReducedMotionConfig;
	/** Skip every animation inside, e.g. for visual regression tests. */
	skipAnimations?: boolean;
	/** Maps pointer coordinates for gestures inside transformed (e.g. scaled) containers. */
	transformPagePoint?: (point: Point) => Point;
}

export interface AnimationInstance {
	play: () => void;
	pause: () => void;
	stop: () => void;
	cancel: () => void;
	/** Resolves once every animation has finished. */
	finished: Promise<void>;
	/** Calls `onResolve` once every animation has finished. */
	onComplete: (onResolve: VoidFunction, onReject?: VoidFunction) => Promise<void>;
	/** Whether every animation has finished. */
	completed: boolean;
	/** The underlying Motion playback controls. */
	controls: AnimationPlaybackControls;
}

/** @deprecated Use `MercuryOptions`. */
export type AnimationParams = MercuryOptions;
/** @deprecated Use Motion's `Transition`. */
export type AnimationTransition = Transition;
/** @deprecated Use Motion's `TargetAndTransition`. */
export type AnimationAttributes = TargetAndTransition;
/** @deprecated Use Motion's `TargetAndTransition`. */
export type InteractionAnimation = TargetAndTransition;

/** @deprecated See `MercuryOptions.callbacks`. */
export interface AnimationCallbacks {
	onPlay?: () => void;
	onComplete?: () => void;
	onUpdate?: (latest: any) => void;
	onRepeat?: () => void;
	onStop?: () => void;
}

/** @deprecated See `MercuryOptions.scroll`. */
export interface ScrollInteractionAnimation {
	root?: HTMLElement;
	margin?: string;
	amount?: number | 'all' | 'some';
	enter?: TargetAndTransition;
	exit?: TargetAndTransition;
	transition?: Transition;
}

/** @deprecated See `MercuryOptions.dragOptions`. */
export interface DragOptions {
	axis?: 'x' | 'y' | 'lock';
	bounds?:
		| { left?: number; right?: number; top?: number; bottom?: number }
		| HTMLElement
		| { current: HTMLElement | null };
	rubberband?: boolean | number;
}

export type PresenceMode = 'sync' | 'wait' | 'popLayout';

/** One side of a presence animation (enter or exit). */
export type PresenceSpec = TargetAndTransition & { transition?: Transition };

export type PresenceAnimation = TargetAndTransition & {
	/** Shared transition for both directions; each spec can override it. */
	transition?: Transition;
	mode?: PresenceMode;
	/**
	 * The hidden state the element enters from (motion's `initial`). On enter it
	 * animates from these values to its settled CSS styles. Array values are
	 * treated as full keyframes.
	 */
	initial?: PresenceSpec;
	/** Exit spec (motion's `exit`): values the element animates to before removal. */
	exit?: PresenceSpec;
	/**
	 * Passed to the exit's dynamic variants, like `<AnimatePresence custom>`: lets an
	 * exiting element use data it no longer receives as a prop (e.g. the slide direction).
	 */
	custom?: unknown;
	/** Runs once the exit animation has finished and the element is about to be removed. */
	onExitComplete?: () => void;
};
