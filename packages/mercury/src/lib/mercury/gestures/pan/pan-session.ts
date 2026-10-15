import {
	cancelFrame,
	distance2D,
	frame,
	frameData,
	isPrimaryPointer,
	millisecondsToSeconds,
	pipe,
	secondsToMilliseconds,
	time,
	type EventInfo,
	type PanInfo,
	type Point
} from 'motion';
import { addPointerEvent, extractEventInfo } from '../events.js';

// Ported from framer-motion (MIT, Copyright (c) 2018 Framer B.V.): the pointer
// session that tracks offset and velocity for pan and drag gestures.

type TimestampedPoint = Point & { timestamp: number };
type TransformPoint = ((point: Point) => Point) | undefined;

export interface PanSessionHandlers {
	onSessionStart?: (event: PointerEvent, info: PanInfo) => void;
	onStart?: (event: PointerEvent, info: PanInfo) => void;
	onMove?: (event: PointerEvent, info: PanInfo) => void;
	onEnd?: (event: PointerEvent, info: PanInfo) => void;
	onSessionEnd?: (event: PointerEvent, info: PanInfo) => void;
	resumeAnimation?: () => void;
}

interface PanSessionOptions {
	transformPagePoint?: TransformPoint;
	contextWindow?: (Window & typeof globalThis) | null;
	dragSnapToOrigin?: boolean | 'x' | 'y';
	distanceThreshold?: number;
	element?: Element | null;
}

const overflowStyles = new Set(['auto', 'scroll']);

export class PanSession {
	private startEvent: PointerEvent | null = null;
	private lastMoveEvent: PointerEvent | null = null;
	private lastMoveEventInfo: EventInfo | null = null;
	/** Raw (untransformed) event info, re-transformed each frame so transformPagePoint sees the current parent matrix. */
	private lastRawMoveEventInfo: EventInfo | null = null;
	private handlers: PanSessionHandlers = {};
	private transformPagePoint: TransformPoint;
	private history: TimestampedPoint[] = [];
	private removeListeners?: () => void;
	private contextWindow: Window & typeof globalThis = window;
	private dragSnapToOrigin: boolean | 'x' | 'y' = false;
	private distanceThreshold = 3;
	private hasPendingMove = false;
	/** Scroll positions of scrollable ancestors and window. */
	private scrollPositions = new Map<Element | Window, Point>();
	private removeScrollListeners: (() => void) | null = null;

	constructor(
		event: PointerEvent,
		handlers: PanSessionHandlers,
		{
			transformPagePoint,
			contextWindow = window,
			dragSnapToOrigin = false,
			distanceThreshold = 3,
			element
		}: PanSessionOptions = {}
	) {
		// If we have more than one touch, don't start detecting this gesture
		if (!isPrimaryPointer(event)) return;

		this.dragSnapToOrigin = dragSnapToOrigin;
		this.handlers = handlers;
		this.transformPagePoint = transformPagePoint;
		this.distanceThreshold = distanceThreshold;
		this.contextWindow = contextWindow || window;

		const info = extractEventInfo(event);
		const initialInfo = transformPoint(info, this.transformPagePoint);
		const { point } = initialInfo;
		const { timestamp } = frameData;
		this.history = [{ ...point, timestamp }];

		const { onSessionStart } = handlers;
		onSessionStart?.(event, getPanInfo(initialInfo, this.history));

		// Listen in the capture phase so a descendant calling stopPropagation()
		// (e.g. in its own pointerup handler) can't prevent the gesture from ending.
		const eventOptions = { passive: true, capture: true };
		this.removeListeners = pipe(
			addPointerEvent(this.contextWindow, 'pointermove', this.handlePointerMove, eventOptions),
			addPointerEvent(this.contextWindow, 'pointerup', this.handlePointerUp, eventOptions),
			addPointerEvent(this.contextWindow, 'pointercancel', this.handlePointerUp, eventOptions)
		) as () => void;

		if (element) this.startScrollTracking(element);
	}

	private onElementScroll = (event: Event) => {
		this.handleScroll(event.target as Element);
	};

	private onWindowScroll = () => {
		this.handleScroll(window);
	};

	private updatePoint = () => {
		if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;
		this.hasPendingMove = false;
		// Re-transform raw point through current transformPagePoint so animated
		// parent transforms (e.g. rotation) are picked up each frame
		if (this.lastRawMoveEventInfo) {
			this.lastMoveEventInfo = transformPoint(this.lastRawMoveEventInfo, this.transformPagePoint);
		}
		const info = getPanInfo(this.lastMoveEventInfo, this.history);
		const isPanStarted = this.startEvent !== null;
		// Only start panning if the offset is larger than the threshold.
		const isDistancePastThreshold =
			distance2D(info.offset, { x: 0, y: 0 }) >= this.distanceThreshold;
		if (!isPanStarted && !isDistancePastThreshold) return;

		const { point } = info;
		this.history.push({ ...point, timestamp: time.now() });
		const { onStart, onMove } = this.handlers;
		if (!isPanStarted) {
			onStart?.(this.lastMoveEvent, info);
			this.startEvent = this.lastMoveEvent;
		}
		onMove?.(this.lastMoveEvent, info);
	};

	private handlePointerMove = (event: PointerEvent, info: EventInfo) => {
		this.lastMoveEvent = event;
		this.lastRawMoveEventInfo = info;
		this.lastMoveEventInfo = transformPoint(info, this.transformPagePoint);
		this.hasPendingMove = true;
		// Throttle mouse move event to once per frame
		frame.update(this.updatePoint, true);
	};

	private handlePointerUp = (event: PointerEvent, info: EventInfo) => {
		// Browsers flush a coalesced pointermove immediately before pointerup,
		// so the final move can still be waiting for a frame.
		if (this.hasPendingMove) this.updatePoint();
		this.end();

		const { onEnd, onSessionEnd, resumeAnimation } = this.handlers;
		// Resume animation if dragSnapToOrigin is set OR if no drag started (user just clicked)
		if (this.dragSnapToOrigin || !this.startEvent) {
			resumeAnimation?.();
		}
		if (!(this.lastMoveEvent && this.lastMoveEventInfo)) return;

		const panInfo = getPanInfo(
			event.type === 'pointercancel'
				? this.lastMoveEventInfo
				: transformPoint(info, this.transformPagePoint),
			this.history
		);
		if (this.startEvent && onEnd) onEnd(event, panInfo);
		onSessionEnd?.(event, panInfo);
	};

	/** Start tracking scroll on ancestors and window. */
	private startScrollTracking(element: Element) {
		let current = element.parentElement;
		while (current) {
			const style = getComputedStyle(current);
			if (overflowStyles.has(style.overflowX) || overflowStyles.has(style.overflowY)) {
				this.scrollPositions.set(current, { x: current.scrollLeft, y: current.scrollTop });
			}
			current = current.parentElement;
		}
		this.scrollPositions.set(window, { x: window.scrollX, y: window.scrollY });
		// Capture listener catches element scroll events as they bubble
		window.addEventListener('scroll', this.onElementScroll, { capture: true });
		// Direct window scroll listener (window scroll doesn't bubble)
		window.addEventListener('scroll', this.onWindowScroll);
		this.removeScrollListeners = () => {
			window.removeEventListener('scroll', this.onElementScroll, { capture: true });
			window.removeEventListener('scroll', this.onWindowScroll);
		};
	}

	/**
	 * Handle scroll compensation during drag.
	 *
	 * For element scroll: adjusts history origin since pageX/pageY doesn't change.
	 * For window scroll: adjusts lastMoveEventInfo since pageX/pageY would change.
	 */
	private handleScroll(target: Element | Window) {
		const initial = this.scrollPositions.get(target);
		if (!initial) return;
		const isWindow = target === window;
		const current = isWindow
			? { x: window.scrollX, y: window.scrollY }
			: { x: (target as Element).scrollLeft, y: (target as Element).scrollTop };
		const delta = { x: current.x - initial.x, y: current.y - initial.y };
		if (delta.x === 0 && delta.y === 0) return;

		if (isWindow) {
			if (this.lastMoveEventInfo) {
				this.lastMoveEventInfo.point.x += delta.x;
				this.lastMoveEventInfo.point.y += delta.y;
			}
		} else if (this.history.length > 0) {
			this.history[0].x -= delta.x;
			this.history[0].y -= delta.y;
		}
		this.scrollPositions.set(target, current);
		frame.update(this.updatePoint, true);
	}

	updateHandlers(handlers: PanSessionHandlers) {
		this.handlers = handlers;
	}

	end() {
		this.removeListeners?.();
		this.removeScrollListeners?.();
		this.scrollPositions.clear();
		cancelFrame(this.updatePoint);
	}
}

function transformPoint(info: EventInfo, transformPagePoint: TransformPoint): EventInfo {
	return transformPagePoint ? { point: transformPagePoint(info.point) } : info;
}

function subtractPoint(a: Point, b: Point): Point {
	return { x: a.x - b.x, y: a.y - b.y };
}

function getPanInfo({ point }: EventInfo, history: TimestampedPoint[]): PanInfo {
	return {
		point,
		delta: subtractPoint(point, history[history.length - 1]),
		offset: subtractPoint(point, history[0]),
		velocity: getVelocity(history, 0.1)
	};
}

function getVelocity(history: TimestampedPoint[], timeDelta: number): Point {
	if (history.length < 2) return { x: 0, y: 0 };

	let i = history.length - 1;
	let timestampedPoint: TimestampedPoint | null = null;
	const lastPoint = history[history.length - 1];
	while (i >= 0) {
		timestampedPoint = history[i];
		if (lastPoint.timestamp - timestampedPoint.timestamp > secondsToMilliseconds(timeDelta)) {
			break;
		}
		i--;
	}
	if (!timestampedPoint) return { x: 0, y: 0 };

	// If the selected point is the pointer-down origin (history[0]), there are better
	// movement points available, and the time gap is suspiciously large (>2x timeDelta),
	// use the next point instead. This prevents stale pointer-down points from diluting
	// velocity in hold-then-flick gestures.
	if (
		timestampedPoint === history[0] &&
		history.length > 2 &&
		lastPoint.timestamp - timestampedPoint.timestamp > secondsToMilliseconds(timeDelta) * 2
	) {
		timestampedPoint = history[1];
	}

	const seconds = millisecondsToSeconds(lastPoint.timestamp - timestampedPoint.timestamp);
	if (seconds === 0) return { x: 0, y: 0 };

	const currentVelocity = {
		x: (lastPoint.x - timestampedPoint.x) / seconds,
		y: (lastPoint.y - timestampedPoint.y) / seconds
	};
	if (currentVelocity.x === Infinity) currentVelocity.x = 0;
	if (currentVelocity.y === Infinity) currentVelocity.y = 0;
	return currentVelocity;
}
