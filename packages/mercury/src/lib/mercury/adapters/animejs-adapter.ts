import type { AnimationEngine } from '../animation-interface.js';
import { mapTransitionToAnimeJS } from '../utils.js';

let animeModule: typeof import('animejs') | null = null;
let loadPromise: Promise<typeof import('animejs')> | null = null;

async function loadAnime(): Promise<typeof import('animejs')> {
	if (animeModule) return animeModule!;

	if (typeof window !== 'undefined' && (window as any).anime) {
		animeModule = (window as any).anime as typeof import('animejs');
		return animeModule;
	}

	if (!loadPromise) {
		loadPromise = import('animejs').then(
			(mod) => {
				animeModule = mod.default ?? mod;
				return animeModule;
			},
			() => {
				throw new Error('Please install AnimeJS: npm install animejs');
			}
		);
	}

	return loadPromise!;
}

export const AnimeEngine: AnimationEngine = {
	animate(element, params) {
		const { animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
		let animation: any = null;
		let animeReady = false;
		let pendingOperations: Array<() => void> = [];


		// Load AnimeJS in background
		loadAnime().then(anime => {
			animeReady = true;

			//Mapping animation to motion
			const animationOptions = mercuryAnimation;
			//Mapping transition to motion
			const transitionOptions = mapTransitionToAnimeJS(mercuryTransition, callbacks);
			transitionOptions.ease =
				mercuryTransition?.type === 'spring'
					? anime.createSpring({
							stiffness: mercuryTransition?.stiffness,
							damping: mercuryTransition?.damping,
							mass: mercuryTransition?.mass,
							velocity: mercuryTransition?.velocity
						})
					: mercuryTransition?.ease;

			animation = anime.animate(element, { ...animationOptions, ...transitionOptions });

			// Execute queued operations
			pendingOperations.forEach(op => op());
			pendingOperations = [];
		}).catch(error => {
			console.error('Failed to load AnimeJS:', error);
		});

		const instance = {
			completed: false,
			play: () => {
				if (animeReady && animation) {
					animation.restart();
				} else {
					pendingOperations.push(() => animation?.restart());
				}
			},
			pause: () => {
				if (animeReady && animation) {
					animation.pause();
				} else {
					pendingOperations.push(() => animation?.pause());
				}
			},
			cancel: () => {
				if (animeReady && animation) {
					animation.cancel();
				} else {
					pendingOperations.push(() => animation?.cancel());
				}
			},
			onComplete: (onResolve: VoidFunction) => {
				if (animeReady && animation) {
					return animation.then(() => {
						onResolve();
						instance.completed = true;
					});
				} else {
					pendingOperations.push(() => {
						animation?.then(() => {
							onResolve();
							instance.completed = true;
						});
					});
				}
			}
		};

		return instance;
	}
};
