import {
	addDomEvent,
	animate,
	frame,
	hover,
	inView,
	isElementKeyboardAccessible,
	press,
	type EventInfo,
	type PanInfo
} from 'motion';
import { ensureProjectionNode, releaseProjectionNode } from '../layout-engine.js';
import type { MercuryNode } from '../node.js';
import { VisualElementDragControls } from './drag/drag-controls.js';
import { addPointerEvent, extractEventInfo } from './events.js';
import { PanSession } from './pan/pan-session.js';

// Mercury's take on Motion's gesture features (framer-motion, MIT, Copyright (c)
// 2018 Framer B.V.): each one listens on the element and flips the matching
// `while*` state of the element's animation state, so Motion decides what animates.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = Record<string, any>;

export interface Feature {
	mount(): void;
	update(): void;
	unmount(): void;
}

interface FeatureDefinition {
	isEnabled: (props: Props, node: MercuryNode) => boolean;
	create: (node: MercuryNode) => Feature;
}

class HoverGesture implements Feature {
	private stop?: () => void;
	constructor(private node: MercuryNode) {}

	mount() {
		this.stop = hover(this.node.element, (_element, startEvent) => {
			this.handle(startEvent, 'Start');
			return (endEvent) => this.handle(endEvent, 'End');
		});
	}

	private handle(event: PointerEvent, lifecycle: 'Start' | 'End') {
		const { visualElement } = this.node;
		const props = visualElement.getProps();
		if (props.whileHover) {
			visualElement.animationState.setActive('whileHover', lifecycle === 'Start');
		}
		const callback = props[`onHover${lifecycle}`];
		if (callback) frame.postRender(() => callback(event, extractEventInfo(event)));
	}

	update() {}

	unmount() {
		this.stop?.();
	}
}

class PressGesture implements Feature {
	private stop?: () => void;
	private options?: string;
	private addedTabIndex = false;
	constructor(private node: MercuryNode) {}

	private getOptions() {
		const { globalTapTarget, propagate } = this.node.visualElement.getProps();
		return { useGlobalTarget: globalTapTarget, stopPropagation: propagate?.tap === false };
	}

	mount() {
		const options = this.getOptions();
		this.options = JSON.stringify(options);
		this.stop = press(
			this.node.element,
			(_element, startEvent) => {
				this.handle(startEvent, 'Start');
				return (endEvent, { success }) => this.handle(endEvent, success ? 'End' : 'Cancel');
			},
			options
		);

		// Like Motion, make tappable elements reachable by keyboard (press() handles Enter).
		const { element } = this.node;
		if (!element.hasAttribute('tabindex') && !isElementKeyboardAccessible(element)) {
			element.setAttribute('tabindex', '0');
			this.addedTabIndex = true;
		}
	}

	private handle(event: PointerEvent, lifecycle: 'Start' | 'End' | 'Cancel') {
		const { element, visualElement } = this.node;
		if (element instanceof HTMLButtonElement && element.disabled) return;

		const props = visualElement.getProps();
		if (props.whileTap) {
			visualElement.animationState.setActive('whileTap', lifecycle === 'Start');
		}
		const callback = props[`onTap${lifecycle === 'End' ? '' : lifecycle}`];
		const legacyEnd = lifecycle !== 'Start' ? this.node.legacy.onTapEnd : undefined;
		if (callback || legacyEnd) {
			frame.postRender(() => {
				callback?.(event, extractEventInfo(event));
				legacyEnd?.(event);
			});
		}
	}

	update() {
		if (JSON.stringify(this.getOptions()) === this.options) return;
		this.stop?.();
		this.mount();
	}

	unmount() {
		this.stop?.();
		if (this.addedTabIndex) this.node.element.removeAttribute('tabindex');
	}
}

class FocusGesture implements Feature {
	private isActive = false;
	private stop?: () => void;
	constructor(private node: MercuryNode) {}

	private onFocus() {
		let isFocusVisible = false;
		// whileFocus follows :focus-visible, so it matches the browser's own focus ring.
		try {
			isFocusVisible = this.node.element.matches(':focus-visible');
		} catch {
			isFocusVisible = true;
		}
		if (!isFocusVisible) return;
		this.node.visualElement.animationState.setActive('whileFocus', true);
		this.isActive = true;
	}

	private onBlur() {
		if (!this.isActive) return;
		this.node.visualElement.animationState.setActive('whileFocus', false);
		this.isActive = false;
	}

	mount() {
		const stopFocus = addDomEvent(this.node.element, 'focus', () => this.onFocus());
		const stopBlur = addDomEvent(this.node.element, 'blur', () => this.onBlur());
		this.stop = () => {
			stopFocus();
			stopBlur();
		};
	}

	update() {}

	unmount() {
		this.stop?.();
	}
}

const viewportKey = ({ viewport = {} }: Props) => [
	viewport.root?.current,
	viewport.margin,
	viewport.amount,
	viewport.once
];

class InViewFeature implements Feature {
	private stop?: () => void;
	private hasEnteredView = false;
	private isInView = false;
	private key: unknown[] = [];
	constructor(private node: MercuryNode) {}

	private start() {
		this.stop?.();
		const props = this.node.visualElement.getProps();
		this.key = viewportKey(props);
		const { root, margin, amount = 'some' } = props.viewport ?? {};
		this.stop = inView(
			this.node.element,
			(_element, entry) => {
				this.change(true, entry);
				return (leaveEntry) => this.change(false, leaveEntry);
			},
			{ root: root?.current ?? undefined, margin, amount }
		);
	}

	private change(isIntersecting: boolean, entry: IntersectionObserverEntry) {
		if (this.isInView === isIntersecting) return;
		this.isInView = isIntersecting;

		const props = this.node.visualElement.getProps();
		// With `once`, stay in the in-view state after the first entry.
		if (props.viewport?.once && !isIntersecting && this.hasEnteredView) return;
		if (isIntersecting) this.hasEnteredView = true;

		this.node.visualElement.animationState.setActive('whileInView', isIntersecting);

		const callback = isIntersecting ? props.onViewportEnter : props.onViewportLeave;
		callback?.(entry);

		const legacyExit = this.node.legacy.scrollExit;
		if (!isIntersecting && legacyExit) {
			frame.postRender(() => animate(this.node.element, legacyExit.target, legacyExit.transition));
		}
	}

	mount() {
		this.start();
	}

	update() {
		const next = viewportKey(this.node.visualElement.getProps());
		if (next.some((value, i) => value !== this.key[i])) this.start();
	}

	unmount() {
		this.stop?.();
		this.hasEnteredView = false;
		this.isInView = false;
	}
}

class PanGesture implements Feature {
	private session?: PanSession;
	private stop?: () => void;
	constructor(private node: MercuryNode) {}

	private createHandlers() {
		const { onPanSessionStart, onPanStart, onPan, onPanEnd } = this.node.visualElement.getProps();
		const asyncHandler =
			(handler?: (event: PointerEvent, info: PanInfo) => void) =>
			(event: PointerEvent, info: PanInfo) => {
				if (handler) frame.update(() => handler(event, info), false, true);
			};
		return {
			onSessionStart: asyncHandler(onPanSessionStart),
			onStart: asyncHandler(onPanStart),
			onMove: asyncHandler(onPan),
			onEnd: (event: PointerEvent, info: PanInfo) => {
				delete this.session;
				if (onPanEnd) frame.postRender(() => onPanEnd(event, info));
			}
		};
	}

	mount() {
		const { element, visualElement } = this.node;
		this.stop = addPointerEvent(element, 'pointerdown', (event: PointerEvent) => {
			this.session = new PanSession(event, this.createHandlers(), {
				transformPagePoint: visualElement.getTransformPagePoint(),
				contextWindow: element.ownerDocument.defaultView as Window & typeof globalThis
			});
		});
	}

	update() {
		this.session?.updateHandlers(this.createHandlers());
	}

	unmount() {
		this.stop?.();
		this.session?.end();
	}
}

const DRAG_STYLES = [
	'userSelect',
	'webkitUserSelect',
	'webkitTouchCallout',
	'touchAction'
] as const;

class DragGesture implements Feature {
	private controls: VisualElementDragControls;
	private removeGroupControls = () => {};
	private removeListeners = () => {};
	private dragControls: unknown;
	private savedStyles?: Record<string, string>;
	private ownsProjection = false;
	constructor(private node: MercuryNode) {
		this.controls = new VisualElementDragControls(node.visualElement);
	}

	private subscribeControls() {
		const { dragControls } = this.node.visualElement.getProps();
		if (dragControls === this.dragControls) return;
		this.removeGroupControls();
		this.removeGroupControls = () => {};
		this.dragControls = dragControls;
		if (dragControls) this.removeGroupControls = dragControls.subscribe(this.controls);
	}

	/** What Motion's `useHTMLProps` sets on draggable elements, so touch drags don't scroll or select. */
	private applyStyles() {
		const { drag, dragListener } = this.node.visualElement.getProps();
		const style = (this.node.element as HTMLElement).style as unknown as Record<string, string>;
		if (drag && dragListener !== false) {
			this.savedStyles ??= Object.fromEntries(DRAG_STYLES.map((key) => [key, style[key] ?? '']));
			style.userSelect = style.webkitUserSelect = style.webkitTouchCallout = 'none';
			style.touchAction = drag === true ? 'none' : `pan-${drag === 'x' ? 'y' : 'x'}`;
		} else {
			this.restoreStyles();
		}
	}

	private restoreStyles() {
		if (!this.savedStyles) return;
		const style = (this.node.element as HTMLElement).style as unknown as Record<string, string>;
		for (const key of DRAG_STYLES) style[key] = this.savedStyles[key];
		this.savedStyles = undefined;
	}

	mount() {
		// Drag measures its constraints and layout through a projection node.
		this.ownsProjection = ensureProjectionNode(this.node.element, this.node.visualElement);
		this.subscribeControls();
		this.removeListeners = this.controls.addListeners() || (() => {});
		this.applyStyles();
	}

	update() {
		this.subscribeControls();
		this.applyStyles();
	}

	unmount() {
		this.removeGroupControls();
		this.removeListeners();
		if (!this.controls.isDragging) this.controls.endPanSession();
		this.restoreStyles();
		if (this.ownsProjection) releaseProjectionNode(this.node.element, this.node.visualElement);
	}
}

export const featureDefinitions: Record<string, FeatureDefinition> = {
	hover: {
		isEnabled: (p) => Boolean(p.whileHover || p.onHoverStart || p.onHoverEnd),
		create: (node) => new HoverGesture(node)
	},
	press: {
		isEnabled: (p, node) =>
			Boolean(p.whileTap || p.onTap || p.onTapStart || p.onTapCancel || node.legacy.onTapEnd),
		create: (node) => new PressGesture(node)
	},
	focus: {
		isEnabled: (p) => Boolean(p.whileFocus),
		create: (node) => new FocusGesture(node)
	},
	inView: {
		isEnabled: (p) => Boolean(p.whileInView || p.onViewportEnter || p.onViewportLeave),
		create: (node) => new InViewFeature(node)
	},
	pan: {
		isEnabled: (p) => Boolean(p.onPan || p.onPanStart || p.onPanEnd || p.onPanSessionStart),
		create: (node) => new PanGesture(node)
	},
	drag: {
		isEnabled: (p) => Boolean(p.drag || p.dragControls),
		create: (node) => new DragGesture(node)
	}
};

export type { EventInfo };
