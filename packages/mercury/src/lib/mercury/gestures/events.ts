import { addDomEvent, isPrimaryPointer, type EventInfo } from 'motion';

// Ported from framer-motion (MIT, Copyright (c) 2018 Framer B.V.): the
// framework-agnostic pointer helpers behind its gesture features.

export function extractEventInfo(event: PointerEvent): EventInfo {
	return { point: { x: event.pageX, y: event.pageY } };
}

export function addPointerEvent(
	target: EventTarget,
	eventName: string,
	handler: (event: PointerEvent, info: EventInfo) => void,
	options?: AddEventListenerOptions
) {
	return addDomEvent(
		target,
		eventName,
		((event: PointerEvent) =>
			isPrimaryPointer(event) && handler(event, extractEventInfo(event))) as EventListener,
		options
	);
}

export const isRefObject = (ref: unknown): ref is { current: Element | null } =>
	Boolean(ref) && typeof ref === 'object' && Object.prototype.hasOwnProperty.call(ref, 'current');

/** Normalizes an element or `{ current }` ref to a ref. */
export const toRef = (value: unknown): { current: Element | null } | undefined => {
	if (!value) return undefined;
	if (typeof Element !== 'undefined' && value instanceof Element) return { current: value };
	return isRefObject(value) ? value : undefined;
};
