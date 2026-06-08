import type { AnimationCallbacks, AnimationTransition } from './animation-interface.js';
import { mapTransitionToAnimeJS } from './utils.js';

export type AnimeModule = typeof import('animejs');

let animeModule: AnimeModule | null = null;
let loadPromise: Promise<AnimeModule> | null = null;

export async function loadAnime(): Promise<AnimeModule> {
	if (animeModule) return animeModule;

	const globalAnime =
		typeof window !== 'undefined'
			? (window as unknown as { anime?: AnimeModule }).anime
			: undefined;

	if (globalAnime) {
		animeModule = globalAnime;
		return animeModule;
	}

	if (!loadPromise) {
		loadPromise = import('animejs').then(
			(mod) => {
				animeModule = mod as AnimeModule;
				return animeModule;
			},
			() => {
				throw new Error('Please install AnimeJS: npm install animejs');
			}
		);
	}

	return loadPromise;
}

export type LayoutStates = {
	enterFrom?: import('animejs').LayoutStateParams;
	leaveTo?: import('animejs').LayoutStateParams;
	swapAt?: import('animejs').LayoutStateParams;
};

export const DEFAULT_LAYOUT_CHILDREN =
	'[data-layout], [data-layout-id], [data-layout=""]';

export function mapTransitionToAnimeLayout(
	transition?: AnimationTransition,
	callbacks?: AnimationCallbacks,
	anime?: AnimeModule
) {
	const mapped = mapTransitionToAnimeJS(transition, callbacks) as Record<string, unknown>;

	if (transition?.type === 'spring' && anime?.createSpring) {
		mapped.ease = anime.createSpring({
			stiffness: transition.stiffness,
			damping: transition.damping,
			mass: transition.mass,
			velocity: transition.velocity
		});
	}

	return mapped;
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}
