import type { AnimationPlaybackControls } from 'motion';

interface ScopeState {
	count: number;
	listeners: Set<() => void>;
}

const scopes = new WeakMap<HTMLElement, ScopeState>();

const MERCURY_CONTROLS = Symbol('mercury:controls');

type WithMercury = HTMLElement & { [MERCURY_CONTROLS]?: AnimationPlaybackControls };

/** Parent element used to coordinate enter/exit timing within a slot. */
export const getPresenceScope = (element: HTMLElement): HTMLElement =>
	element.parentElement ?? document.documentElement;

const getScopeState = (scope: HTMLElement): ScopeState => {
	const state = scopes.get(scope) ?? { count: 0, listeners: new Set<() => void>() };
	scopes.set(scope, state);
	return state;
};

/** Whether a wait-mode exit is still running in this scope. */
export const hasPendingWaitExit = (element: HTMLElement): boolean =>
	(scopes.get(getPresenceScope(element))?.count ?? 0) > 0;

/** Register a wait-mode exit so subsequent enters in the same scope defer. */
export const registerWaitExit = (element: HTMLElement): void => {
	getScopeState(getPresenceScope(element)).count += 1;
};

/** Call when a wait-mode exit animation finishes or is cancelled. */
export const completeWaitExit = (element: HTMLElement): void => {
	const scope = getPresenceScope(element);
	const state = scopes.get(scope);
	if (!state) return;

	state.count -= 1;

	if (state.count > 0) return;

	const listeners = [...state.listeners];
	scopes.delete(scope);
	for (const listener of listeners) listener();
};

/**
 * Run `fn` once any active wait-mode exit in this scope has finished.
 * Waits one macrotask so out:presence can register in the same commit.
 */
export const runAfterPendingExit = (element: HTMLElement, fn: () => void): void => {
	setTimeout(() => {
		if (!hasPendingWaitExit(element)) {
			fn();
			return;
		}
		getScopeState(getPresenceScope(element)).listeners.add(fn);
	}, 0);
};

export const registerMercuryControls = (
	element: HTMLElement,
	controls: AnimationPlaybackControls
): void => {
	(element as WithMercury)[MERCURY_CONTROLS] = controls;
};

export const stopMercury = (element: HTMLElement): void => {
	const el = element as WithMercury;
	el[MERCURY_CONTROLS]?.stop();
	el[MERCURY_CONTROLS] = undefined;
};
