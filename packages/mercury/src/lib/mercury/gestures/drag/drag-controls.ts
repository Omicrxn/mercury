import {
	addDomEvent,
	addValueToWillChange,
	animateMotionValue,
	calcLength,
	convertBoundingBoxToBox,
	convertBoxToBoundingBox,
	createBox,
	eachAxis,
	frame,
	isElementTextInput,
	measurePageBox,
	mixNumber,
	percent,
	resize,
	setDragLock,
	type InertiaOptions,
	type MotionValue,
	type PanInfo,
	type Point
} from 'motion';
import { addPointerEvent, isRefObject } from '../events.js';
import { PanSession } from '../pan/pan-session.js';
import {
	applyConstraints,
	calcOrigin,
	calcRelativeConstraints,
	calcViewportConstraints,
	defaultElastic,
	rebaseAxisConstraints,
	resolveDragElastic,
	type ResolvedConstraints,
	type ResolvedElastic
} from './constraints.js';

// Ported from framer-motion (MIT, Copyright (c) 2018 Framer B.V.): the drag
// gesture of `<motion.div drag>`, driving the element's VisualElement.

type DragAxis = 'x' | 'y';
type StartOptions = { snapToCursor?: boolean; distanceThreshold?: number };

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyVisualElement = any;

export class VisualElementDragControls {
	private visualElement: AnyVisualElement;
	private panSession?: PanSession;
	private openDragLock: (() => void) | null = null;
	isDragging = false;
	private currentDirection: DragAxis | null = null;
	private originPoint: Point = { x: 0, y: 0 };
	/** The permitted boundaries of travel, in pixels. */
	private constraints: ResolvedConstraints | false = false;
	private hasMutatedConstraints = false;
	/** The per-axis resolved elastic values. */
	private elastic: ResolvedElastic = createBox();
	/** The latest pointer event. Used as fallback when `cancel` and `stop` are called without arguments. */
	private latestPointerEvent: PointerEvent | null = null;
	/** The latest pan info. Used as fallback when `cancel` and `stop` are called without arguments. */
	private latestPanInfo: PanInfo | null = null;

	constructor(visualElement: AnyVisualElement) {
		this.visualElement = visualElement;
	}

	start(originEvent: PointerEvent, { snapToCursor = false, distanceThreshold }: StartOptions = {}) {
		// Don't start dragging if this component is exiting
		const { presenceContext } = this.visualElement;
		if (presenceContext && presenceContext.isPresent === false) return;

		const onSessionStart = (event: PointerEvent) => {
			if (snapToCursor) this.snapToCursor(event);
			this.stopAnimation();
		};

		const onStart = (event: PointerEvent, info: PanInfo) => {
			// Attempt to grab the global drag gesture lock
			const { drag, dragPropagation, onDragStart } = this.getProps();
			if (drag && !dragPropagation) {
				if (this.openDragLock) this.openDragLock();
				this.openDragLock = setDragLock(drag);
				// If we don't have the lock, don't start dragging
				if (!this.openDragLock) return;
			}

			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			this.isDragging = true;
			this.currentDirection = null;

			// Svelte doesn't re-measure on every update the way Motion's React
			// components do, so measure the layout the constraints are relative to now.
			this.refreshLayout();
			this.resolveConstraints();

			if (this.visualElement.projection) {
				this.visualElement.projection.isAnimationBlocked = true;
				this.visualElement.projection.target = undefined;
			}

			// Record gesture origin and pointer offset
			eachAxis((axis: DragAxis) => {
				let current = this.getAxisMotionValue(axis).get() || 0;
				// If the MotionValue is a percentage value convert to px
				if (percent.test(current)) {
					const { projection } = this.visualElement;
					if (projection && projection.layout) {
						const measuredAxis = projection.layout.layoutBox[axis];
						if (measuredAxis) {
							const length = calcLength(measuredAxis);
							current = length * (parseFloat(current) / 100);
						}
					}
				}
				this.originPoint[axis] = current;
			});

			if (onDragStart) frame.update(() => onDragStart(event, info), false, true);

			addValueToWillChange(this.visualElement, 'transform');
			const { animationState } = this.visualElement;
			animationState?.setActive('whileDrag', true);
		};

		const onMove = (event: PointerEvent, info: PanInfo) => {
			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			const { dragPropagation, dragDirectionLock, onDirectionLock, onDrag } = this.getProps();
			// If we didn't successfully receive the gesture lock, early return.
			if (!dragPropagation && !this.openDragLock) return;

			const { offset } = info;
			// Attempt to detect drag direction if directionLock is true
			if (dragDirectionLock && this.currentDirection === null) {
				this.currentDirection = getCurrentDirection(offset);
				if (this.currentDirection !== null) {
					onDirectionLock?.(this.currentDirection);
				}
				return;
			}

			this.updateAxis('x', info.point, offset);
			this.updateAxis('y', info.point, offset);

			// Render now so a layout change triggered by onDrag reads the latest box.
			this.visualElement.render();

			if (onDrag) frame.update(() => onDrag(event, info), false, true);
		};

		const onSessionEnd = (event: PointerEvent, info: PanInfo) => {
			this.latestPointerEvent = event;
			this.latestPanInfo = info;
			this.stop(event, info);
			this.latestPointerEvent = null;
			this.latestPanInfo = null;
		};

		const resumeAnimation = () => {
			const { dragSnapToOrigin: snap } = this.getProps();
			if (snap || this.constraints) {
				this.startAnimation({ x: 0, y: 0 });
			}
		};

		const { dragSnapToOrigin } = this.getProps();
		this.panSession = new PanSession(
			originEvent,
			{ onSessionStart, onStart, onMove, onSessionEnd, resumeAnimation },
			{
				transformPagePoint: this.visualElement.getTransformPagePoint(),
				dragSnapToOrigin,
				distanceThreshold,
				contextWindow: getContextWindow(this.visualElement),
				element: this.visualElement.current
			}
		);
	}

	stop(event?: PointerEvent, panInfo?: PanInfo) {
		const finalEvent = event || this.latestPointerEvent;
		const finalPanInfo = panInfo || this.latestPanInfo;
		const isDragging = this.isDragging;
		this.cancel();
		if (!isDragging || !finalPanInfo || !finalEvent) return;

		const { velocity } = finalPanInfo;
		this.startAnimation(velocity);

		const { onDragEnd } = this.getProps();
		if (onDragEnd) frame.postRender(() => onDragEnd(finalEvent, finalPanInfo));
	}

	cancel() {
		this.isDragging = false;
		const { projection, animationState } = this.visualElement;
		if (projection) projection.isAnimationBlocked = false;
		this.endPanSession();

		const { dragPropagation } = this.getProps();
		if (!dragPropagation && this.openDragLock) {
			this.openDragLock();
			this.openDragLock = null;
		}
		animationState?.setActive('whileDrag', false);
	}

	/** Clean up the pan session without modifying other drag state. */
	endPanSession() {
		this.panSession?.end();
		this.panSession = undefined;
	}

	private updateAxis(axis: DragAxis, _point: Point, offset?: Point) {
		const { drag } = this.getProps();
		// If we're not dragging this axis, do an early return.
		if (!offset || !shouldDrag(axis, drag, this.currentDirection)) return;

		const axisValue = this.getAxisMotionValue(axis);
		let next = this.originPoint[axis] + offset[axis];
		if (this.constraints && this.constraints[axis]) {
			next = applyConstraints(next, this.constraints[axis], this.elastic[axis]);
		}
		axisValue.set(next);
	}

	private refreshLayout() {
		const { projection } = this.visualElement;
		if (!projection || projection.currentAnimation) return;
		projection.root?.updateScroll();
		projection.updateLayout();
		if (isRefObject(this.getProps().dragConstraints)) this.constraints = false;
	}

	private resolveConstraints() {
		const { dragConstraints, dragElastic } = this.getProps();
		const layout =
			this.visualElement.projection && !this.visualElement.projection.layout
				? this.visualElement.projection.measure(false)
				: this.visualElement.projection?.layout;
		const prevConstraints = this.constraints;

		if (dragConstraints && isRefObject(dragConstraints)) {
			if (!this.constraints) this.constraints = this.resolveRefConstraints();
		} else if (dragConstraints && layout) {
			this.constraints = calcRelativeConstraints(layout.layoutBox, dragConstraints);
		} else {
			this.constraints = false;
		}

		this.elastic = resolveDragElastic(dragElastic);

		// Rebase relative (non-ref) constraints from viewport-relative to component-relative.
		if (
			prevConstraints !== this.constraints &&
			!isRefObject(dragConstraints) &&
			layout &&
			this.constraints &&
			!this.hasMutatedConstraints
		) {
			eachAxis((axis: DragAxis) => {
				if (this.constraints !== false && this.getAxisMotionValue(axis)) {
					this.constraints[axis] = rebaseAxisConstraints(
						layout.layoutBox[axis],
						this.constraints[axis]
					);
				}
			});
		}
	}

	private resolveRefConstraints(): ResolvedConstraints | false {
		const { dragConstraints: constraints, onMeasureDragConstraints } = this.getProps();
		if (!constraints || !isRefObject(constraints)) return false;

		const constraintsElement = constraints.current;
		if (!constraintsElement) return false;

		const { projection } = this.visualElement;
		if (!projection || !projection.layout) return false;

		// Refresh the root scroll offset so the constraint's viewport box translates
		// to correct page coordinates.
		if (projection.root) {
			projection.root.scroll = undefined;
			projection.root.updateScroll();
		}

		const constraintsBox = measurePageBox(
			constraintsElement as HTMLElement,
			projection.root,
			this.visualElement.getTransformPagePoint()
		);
		let measuredConstraints = calcViewportConstraints(projection.layout.layoutBox, constraintsBox);

		if (onMeasureDragConstraints) {
			const userConstraints = onMeasureDragConstraints(
				convertBoxToBoundingBox(measuredConstraints as any)
			);
			this.hasMutatedConstraints = !!userConstraints;
			if (userConstraints) {
				measuredConstraints = convertBoundingBoxToBox(userConstraints);
			}
		}
		return measuredConstraints;
	}

	private startAnimation(velocity: Point) {
		const {
			drag,
			dragMomentum,
			dragElastic,
			dragTransition,
			dragSnapToOrigin,
			onDragTransitionEnd
		} = this.getProps();
		const constraints = this.constraints || ({} as Partial<ResolvedConstraints>);

		const momentumAnimations = eachAxis((axis: DragAxis) => {
			if (!shouldDrag(axis, drag, this.currentDirection)) return;

			let transition: InertiaOptions = (constraints && constraints[axis]) || {};
			if (dragSnapToOrigin === true || dragSnapToOrigin === axis) transition = { min: 0, max: 0 };

			// Overdamp the boundary spring if `dragElastic` is disabled.
			const bounceStiffness = dragElastic ? 200 : 1000000;
			const bounceDamping = dragElastic ? 40 : 10000000;

			const inertia = {
				type: 'inertia',
				velocity: dragMomentum ? velocity[axis] : 0,
				bounceStiffness,
				bounceDamping,
				timeConstant: 750,
				restDelta: 1,
				restSpeed: 10,
				...dragTransition,
				...transition
			};
			return this.startAxisValueAnimation(axis, inertia);
		});

		return Promise.all(momentumAnimations).then(onDragTransitionEnd);
	}

	private startAxisValueAnimation(axis: DragAxis, transition: object) {
		const axisValue = this.getAxisMotionValue(axis);
		addValueToWillChange(this.visualElement, axis);
		return axisValue.start(
			animateMotionValue(axis, axisValue, 0, transition as any, this.visualElement, false)
		);
	}

	private stopAnimation() {
		eachAxis((axis: DragAxis) => this.getAxisMotionValue(axis).stop());
	}

	private getAxisMotionValue(axis: DragAxis): MotionValue<any> {
		const props = this.visualElement.getProps();
		const externalMotionValue = props[`_drag${axis.toUpperCase()}`];
		return externalMotionValue
			? externalMotionValue
			: this.visualElement.getValue(axis, this.visualElement.latestValues[axis] ?? 0);
	}

	private snapToCursor({ clientX, clientY }: PointerEvent) {
		const { drag } = this.getProps();
		const point = { x: clientX, y: clientY };
		const cursor = this.visualElement.getTransformPagePoint()?.(point) || point;
		const box = this.visualElement.measureViewportBox();
		eachAxis((axis: DragAxis) => {
			if (!shouldDrag(axis, drag, this.currentDirection)) return;
			const axisValue = this.getAxisMotionValue(axis);
			const { min, max } = box[axis];
			axisValue.set((axisValue.get() || 0) + cursor[axis] - mixNumber(min, max, 0.5));
		});
	}

	/**
	 * When the viewport resizes, reposition the element within the new constraints
	 * relative to where it was before the resize.
	 */
	private scalePositionWithinConstraints() {
		if (!this.visualElement.current) return;
		const { drag, dragConstraints } = this.getProps();
		const { projection } = this.visualElement;
		if (!isRefObject(dragConstraints) || !projection || !this.constraints) return;

		this.stopAnimation();

		const constraints = this.constraints;
		const boxProgress = { x: 0, y: 0 };
		eachAxis((axis: DragAxis) => {
			const latest = this.getAxisMotionValue(axis).get();
			boxProgress[axis] = calcOrigin({ min: latest, max: latest }, constraints[axis]);
		});

		const { transformTemplate } = this.visualElement.getProps();
		this.visualElement.current.style.transform = transformTemplate
			? transformTemplate({}, '')
			: 'none';
		projection.root?.updateScroll();
		projection.updateLayout();

		this.constraints = false;
		this.resolveConstraints();

		eachAxis((axis: DragAxis) => {
			const axisValue = this.getAxisMotionValue(axis);
			if (!shouldDrag(axis, drag, null) || !axisValue.get()) return;
			const { min, max } = (this.constraints as ResolvedConstraints)[axis];
			axisValue.set(mixNumber(min!, max!, boxProgress[axis]));
		});

		this.visualElement.render();
	}

	addListeners() {
		if (!this.visualElement.current) return;
		const element = this.visualElement.current as HTMLElement;

		// Attach a pointerdown event listener on this DOM element to initiate drag tracking.
		const stopPointerListener = addPointerEvent(element, 'pointerdown', (event) => {
			const { drag, dragListener = true } = this.getProps();
			const target = event.target as Element;
			// Only block drag if clicking on a text input child element where users
			// might want to select text or interact with the control.
			const isClickingTextInputChild = target !== element && isElementTextInput(target);
			if (drag && dragListener && !isClickingTextInputChild) this.start(event);
		});

		const stopKeyListener = addDomEvent(
			element,
			'keydown',
			((event: KeyboardEvent) => this.onKeyDown(event)) as EventListener,
			{ passive: false }
		);

		let stopResizeObservers: (() => void) | undefined;
		const measureDragConstraints = () => {
			const { dragConstraints } = this.getProps();
			if (isRefObject(dragConstraints) && dragConstraints.current) {
				this.constraints = this.resolveRefConstraints();
				if (!stopResizeObservers) {
					stopResizeObservers = startResizeObservers(element, dragConstraints.current, () =>
						this.scalePositionWithinConstraints()
					);
				}
			}
		};

		const { projection } = this.visualElement;
		// Elements without a projection node (SVG) drag without measured constraints.
		if (!projection) {
			return () => {
				stopPointerListener();
				stopKeyListener();
			};
		}
		const stopMeasureLayoutListener = projection.addEventListener(
			'measure',
			measureDragConstraints
		);
		if (projection && !projection.layout) {
			projection.root?.updateScroll();
			projection.updateLayout();
		}
		frame.read(measureDragConstraints);

		const stopResizeListener = addDomEvent(window, 'resize', () =>
			this.scalePositionWithinConstraints()
		);

		// If the element's layout changes, apply the delta to the drag gesture's origin point.
		const stopLayoutUpdateListener = projection.addEventListener(
			'didUpdate',
			({ delta, hasLayoutChanged }: { delta: any; hasLayoutChanged: boolean }) => {
				if (this.isDragging && hasLayoutChanged) {
					eachAxis((axis: DragAxis) => {
						const motionValue = this.getAxisMotionValue(axis);
						if (!motionValue) return;
						this.originPoint[axis] += delta[axis].translate;
						motionValue.set(motionValue.get() + delta[axis].translate);
					});
					this.visualElement.render();
				}
			}
		);

		return () => {
			stopResizeListener();
			stopPointerListener();
			stopKeyListener();
			stopMeasureLayoutListener();
			stopLayoutUpdateListener?.();
			stopResizeObservers?.();
		};
	}

	/**
	 * Mercury addition: a focused draggable element moves with the arrow keys
	 * (Shift for bigger steps), within its constraints, so drag isn't pointer-only.
	 */
	private onKeyDown(event: KeyboardEvent) {
		const { drag, dragKeyboard = true } = this.getProps();
		const direction = ARROW_KEYS[event.key];
		if (
			!drag ||
			dragKeyboard === false ||
			!direction ||
			event.target !== this.visualElement.current
		) {
			return;
		}
		event.preventDefault();
		const step = (typeof dragKeyboard === 'number' ? dragKeyboard : 10) * (event.shiftKey ? 5 : 1);

		this.refreshLayout();
		this.resolveConstraints();
		eachAxis((axis: DragAxis) => {
			if (!direction[axis] || !shouldDrag(axis, drag, null)) return;
			const axisValue = this.getAxisMotionValue(axis);
			let next = (axisValue.get() || 0) + direction[axis] * step;
			if (this.constraints && this.constraints[axis]) {
				next = applyConstraints(next, this.constraints[axis]);
			}
			axisValue.stop();
			axisValue.set(next);
		});
		this.visualElement.render();
	}

	private getProps() {
		const props = this.visualElement.getProps();
		const {
			drag = false,
			dragDirectionLock = false,
			dragPropagation = false,
			dragConstraints = false,
			dragElastic = defaultElastic,
			dragMomentum = true
		} = props;
		return {
			...props,
			drag,
			dragDirectionLock,
			dragPropagation,
			dragConstraints,
			dragElastic,
			dragMomentum
		};
	}
}

/**
 * Lets another element start a drag, e.g. a handle: pass the controls to the
 * draggable element's `dragControls` and call `controls.start(event)` from the
 * handle's `onpointerdown`. Motion's `useDragControls()`.
 */
export class DragControls {
	private componentControls = new Set<VisualElementDragControls>();

	/** @internal */
	subscribe(controls: VisualElementDragControls) {
		this.componentControls.add(controls);
		return () => {
			this.componentControls.delete(controls);
		};
	}

	start(event: PointerEvent, options?: StartOptions) {
		this.componentControls.forEach((controls) => controls.start(event, options));
	}

	cancel() {
		this.componentControls.forEach((controls) => controls.cancel());
	}

	stop() {
		this.componentControls.forEach((controls) => controls.stop());
	}
}

export const createDragControls = () => new DragControls();

const ARROW_KEYS: Record<string, Point> = {
	ArrowLeft: { x: -1, y: 0 },
	ArrowRight: { x: 1, y: 0 },
	ArrowUp: { x: 0, y: -1 },
	ArrowDown: { x: 0, y: 1 }
};

function skipFirstCall(callback: () => void) {
	let isFirst = true;
	return () => {
		if (isFirst) {
			isFirst = false;
			return;
		}
		callback();
	};
}

function startResizeObservers(element: Element, constraintsElement: Element, onResize: () => void) {
	const stopElement = resize(element, skipFirstCall(onResize));
	const stopContainer = resize(constraintsElement, skipFirstCall(onResize));
	return () => {
		stopElement();
		stopContainer();
	};
}

function shouldDrag(
	direction: DragAxis,
	drag: boolean | DragAxis,
	currentDirection: DragAxis | null
) {
	return (
		(drag === true || drag === direction) &&
		(currentDirection === null || currentDirection === direction)
	);
}

/**
 * Based on an x/y offset determine the current drag direction. If both axis' offsets are lower
 * than the provided threshold, return `null`.
 */
function getCurrentDirection(offset: Point, lockThreshold = 10): DragAxis | null {
	let direction: DragAxis | null = null;
	if (Math.abs(offset.y) > lockThreshold) {
		direction = 'y';
	} else if (Math.abs(offset.x) > lockThreshold) {
		direction = 'x';
	}
	return direction;
}

const getContextWindow = ({ current }: { current: Element | null }) =>
	current ? (current.ownerDocument.defaultView as Window & typeof globalThis) : null;
