interface ScopeState {
	count: number;
	listeners: Set<() => void>;
}

const scopes = new WeakMap<Element, ScopeState>();

/** Parent element used to coordinate enter/exit timing within a slot. */
export const getPresenceScope = (element: Element): Element =>
	element.parentElement ?? document.documentElement;

const getScopeState = (scope: Element): ScopeState => {
	const state = scopes.get(scope) ?? { count: 0, listeners: new Set<() => void>() };
	scopes.set(scope, state);
	return state;
};

/** Whether a wait-mode exit is still running in this scope. */
export const hasPendingWaitExit = (element: Element): boolean =>
	(scopes.get(getPresenceScope(element))?.count ?? 0) > 0;

/** Register a wait-mode exit so subsequent enters in the same scope defer. */
export const registerWaitExit = (element: Element): void => {
	getScopeState(getPresenceScope(element)).count += 1;
};

/** Call when a wait-mode exit animation finishes or is cancelled. */
export const completeWaitExit = (element: Element): void => {
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
export const runAfterPendingExit = (element: Element, fn: () => void): void => {
	setTimeout(() => {
		if (!hasPendingWaitExit(element)) {
			fn();
			return;
		}
		getScopeState(getPresenceScope(element)).listeners.add(fn);
	}, 0);
};
