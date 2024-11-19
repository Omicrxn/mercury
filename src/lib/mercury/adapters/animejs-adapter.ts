
// This works but waiting for V4 to be released so that people don't need to be a sponsor


// // src/adapters/animeAdapter.ts
// import type {
//   AnimationEngine,
//   EasingFunction,
// } from '../animation-interface.js';
// import {
//     Animation,
//     engine,
// 	animate as animeAnimate,
// 	type AnimationParams
// } from '@juliangarnierorg/anime-beta';
// import { mergeParams } from '../utils.svelte.js';

// function mapEasing(easing?: EasingFunction): string | ((...args: any[]) => number) | undefined {
//   if (!easing) return undefined;

//   if (typeof easing === 'string') {
//     // Directly use the easing string if it's one of Anime.js's built-in easings
//     return easing;
//   } else if (typeof easing === 'object') {
//     // Handle complex easing types
//     if (easing.type === 'spring') {
//       // Anime.js doesn't have a spring easing, but you can mimic it or return a default
//       // Alternatively, you could throw an error or warning
//       return 'spring(1, 100, 10, 0)';
//     } else if (easing.type === 'cubic-bezier') {
//       return `cubicBezier(${easing.x1}, ${easing.y1}, ${easing.x2}, ${easing.y2})`;
//     } else if (easing.type === 'steps') {
//       return `steps(${easing.steps})`;
//     } else {
//       // Handle other custom types or return a default
//       return 'linear';
//     }
//   }

//   // Default easing
//   return 'linear';
// }

// export const AnimeAdapter: AnimationEngine = {
//   animate(targets, params) {
//     // Map common parameters to Anime.js parameters
//     const { initial, animate: animateAttrs, transition } = params;
//     const mergedParams = mergeParams({ initial, animate: animateAttrs})
//     const mappedEasing = mapEasing(transition?.easing);

//     const animeParams: AnimationParams = {
//       ...mergedParams,
//       duration: transition?.duration ? transition.duration : undefined,
//       delay: transition?.delay ? transition.delay : undefined,
//       ease:mappedEasing,
//       ...transition,
//     };

//     const animation: Animation = animeAnimate(targets,animeParams);
//     engine.timeUnit = 's'
//     return {
//       play: () => animation.play(),
//       pause: () => animation.pause(),
//       cancel: () => animation.restart(), // Anime.js doesn't have a cancel method, so we can restart
//       then: (callback) => animation.then(callback),
//       completed: animation.completed,
//     };
//   },
// };
