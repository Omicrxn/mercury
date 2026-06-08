import { tick } from 'svelte';
import type { AutoLayout, LayoutAnimationParams, Timeline } from 'animejs';
import {
	DEFAULT_LAYOUT_CHILDREN,
	loadAnime,
	mapTransitionToAnimeLayout,
	prefersReducedMotion,
	type LayoutStates
} from './layout-anime.js';
import type { AnimationCallbacks, AnimationTransition } from './animation-interface.js';

export type LayoutScopeOptions = {
	transition?: AnimationTransition;
	states?: LayoutStates;
	children?: string;
	callbacks?: AnimationCallbacks;
};

async function flushDom() {
	await tick();
	await new Promise<void>((resolve) => queueMicrotask(() => resolve()));
	await tick();
	await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

	if (typeof requestAnimationFrame !== 'undefined') {
		await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	}
}

export class LayoutScopeController {
	#instance: AutoLayout | null = null;
	#pending: Timeline | null = null;
	#options: LayoutScopeOptions;

	constructor(options: LayoutScopeOptions) {
		this.#options = options;
	}

	setOptions(options: LayoutScopeOptions) {
		this.#options = options;
	}

	async mount(element: HTMLElement) {
		const anime = await loadAnime();
		const { states, children, transition, callbacks } = this.#options;

		this.#instance = anime.createLayout(element, {
			children: children ?? DEFAULT_LAYOUT_CHILDREN,
			...mapTransitionToAnimeLayout(transition, callbacks, anime),
			...states
		});

		this.#instance.record();
	}

	record() {
		this.#instance?.record();
	}

	async animate() {
		if (!this.#instance) return;

		if (prefersReducedMotion()) {
			this.#instance.record();
			return;
		}

		this.#pending?.cancel();
		await flushDom();

		if (!this.#instance) return;

		const anime = await loadAnime();
		const baseCallbacks = this.#options.callbacks ?? {};
		const params = mapTransitionToAnimeLayout(
			this.#options.transition,
			{
				...baseCallbacks,
				onComplete: () => {
					baseCallbacks.onComplete?.();
					this.#instance?.record();
				}
			},
			anime
		) as LayoutAnimationParams;

		this.#pending = this.#instance.animate(params);
	}

	dispose() {
		this.#pending?.cancel();
		this.#instance?.revert();
		this.#instance = null;
		this.#pending = null;
	}
}

if (typeof window !== 'undefined') {
	void loadAnime();
}
