import type {
	AnimationCallbacks,
	AnimationTransition,
	Easing
} from './animation-interface.js';
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

// Mercury's `ease` follows Motion's naming. AnimeJS uses different names
// ('inOutCirc') and no longer parses bezier strings, so translate explicitly.
const MOTION_EASE_TO_ANIME: Record<string, string | [number, number, number, number]> = {
	linear: 'linear',
	easeIn: [0.42, 0, 1, 1],
	easeOut: [0, 0, 0.58, 1],
	easeInOut: [0.42, 0, 0.58, 1],
	circIn: 'inCirc',
	circOut: 'outCirc',
	circInOut: 'inOutCirc',
	backIn: 'inBack',
	backOut: 'outBack',
	backInOut: 'inOutBack',
	anticipate: 'inBack'
};

function mapEaseToAnime(
	ease: Easing | Easing[],
	anime?: AnimeModule
): unknown {
	if (typeof ease === 'function') return ease;

	if (Array.isArray(ease)) {
		if (typeof ease[0] === 'number') {
			const [x1, y1, x2, y2] = ease as [number, number, number, number];
			return anime?.cubicBezier ? anime.cubicBezier(x1, y1, x2, y2) : undefined;
		}
		// Per-keyframe easing lists aren't supported by layout animations; use the first.
		return mapEaseToAnime(ease[0] as Easing, anime);
	}

	if (typeof ease === 'string') {
		const mapped = MOTION_EASE_TO_ANIME[ease];
		if (Array.isArray(mapped)) {
			return anime?.cubicBezier ? anime.cubicBezier(...mapped) : undefined;
		}
		// Unknown names pass through so AnimeJS-native eases ('inOutQuad') keep working.
		return mapped ?? ease;
	}

	return undefined;
}

export function mapTransitionToAnimeLayout(
	transition?: AnimationTransition,
	callbacks?: AnimationCallbacks,
	anime?: AnimeModule
) {
	const mapped = mapTransitionToAnimeJS(transition, callbacks) as Record<string, unknown>;


	if (transition?.ease !== undefined) {
		const ease = mapEaseToAnime(transition.ease, anime);
		if (ease !== undefined) mapped.ease = ease;
	}

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
