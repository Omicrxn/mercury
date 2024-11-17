// src/adapters/animeAdapter.ts
import type {
  AnimationEngine,
} from '../animation-interface.js';
import {
    Animation,
    engine,
	animate as animeAnimate,
	type AnimationParams
} from '@juliangarnierorg/anime-beta';
import { mergeParams } from '../utils.svelte.js';

export const AnimeAdapter: AnimationEngine = {
  animate(targets, params) {
    // Map common parameters to Anime.js parameters
    const { initial, animate: animateAttrs, transition } = params;
    const mergedParams = mergeParams({ initial, animate: animateAttrs})
    const animeParams: AnimationParams = {
      ...mergedParams,
      duration: transition?.duration ? transition.duration : undefined,
      delay: transition?.delay ? transition.delay : undefined,
      // ease: transition?.ease,
      ...transition,
    };

    const animation: Animation = animeAnimate(targets,animeParams);
    engine.timeUnit = 's'
    return {
      play: () => animation.play(),
      pause: () => animation.pause(),
      cancel: () => animation.restart(), // Anime.js doesn't have a cancel method, so we can restart
      then: (callback) => animation.then(callback),
      completed: animation.completed,
    };
  },
};
