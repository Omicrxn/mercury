import type { MercuryParams } from './mercury.svelte.js';
import { type AnimationParams, Scope, type ScopeParams, type DOMTargetSelector  } from '@juliangarnierorg/anime-beta';
import { untrack } from 'svelte';

export default function createEventListeners(
	node: Node,
	params: MercuryParams,
	updateAnimation: (node: HTMLElement, params: AnimationParams) => void
) {
	const { whileHover, whileTap, initial, animate } = params;
	// Store handler functions as named functions
	const handleEnter = (enterParams: MercuryParams | undefined) => {
		if (!enterParams) {
			return;
		}
		updateAnimation(node as HTMLElement, enterParams);
	};

	const handleOut = () => {
		if (initial) {
			updateAnimation(node as HTMLElement, animate);
		}
	};

	// Add the listeners
	if (whileHover) {
		node.addEventListener('mouseover', () => handleEnter(whileHover));
		node.addEventListener('mouseout', handleOut);
	}
	if (whileTap) {
		node.addEventListener('mousedown', () => handleEnter(whileTap));
		node.addEventListener('mouseup', handleOut);
	}

	// Return the handlers so they can be used to remove listeners
	return {
		remove: () => {
			node.removeEventListener('mouseover', () => handleEnter(whileHover));
			node.removeEventListener('mouseout', handleOut);
		}
	};
}

export function useScope(params: ScopeParams = {}) {
	let root = $state<DOMTargetSelector | undefined>(params.root);
	let scope = $state<Scope>();

	$effect(() => {
		if (!root) return;
		return untrack(() => {
			scope = new Scope({ ...params, root });
			return () => {
				scope?.revert();
				scope = undefined;
			};
		});
	});

	return {
		get root() {
			return root;
		},
		set root(value) {
			root = value;
		},
		get scope() {
			return scope;
		},
		add(...props: Parameters<Scope['add']>) {
			$effect(() => {
				if (!scope) return;
				return untrack(() => {
					scope?.add(...props);
				});
			});
			return this;
		},
		refresh() {
			scope?.refresh();
		}
	};
}
