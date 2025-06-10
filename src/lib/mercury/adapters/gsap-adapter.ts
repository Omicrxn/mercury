import type { AnimationEngine } from '../animation-interface.js';
import { mapTransitionToGSAP } from '../utils.js';

// Use a dynamic import with a constant to prevent static analysis
let gsap: any = null;
let gsapLoadError: Error | null = null;

// Try to load GSAP synchronously if available globally (UMD builds)
if (typeof window !== 'undefined' && (window as any).gsap) {
  gsap = (window as any).gsap;
}

export const GSAPEngine: AnimationEngine = {
  animate(element, params) {
    // If GSAP is already loaded, use it
    if (gsap) {
      return createAnimation(element, params);
    }

    // If we already tried and failed, throw the error
    if (gsapLoadError) {
      throw gsapLoadError;
    }

    // Try dynamic import as a fallback
    // Note: This makes the first animation async, but subsequent ones will be sync
    const pendingAnimation = import('gsap').then(
      (module) => {
        gsap = module.default || module;
        return createAnimation(element, params);
      },
      (error) => {
        gsapLoadError = new Error(
          'GSAP is not installed. Please install it: npm install gsap'
        );
        throw gsapLoadError;
      }
    );

    // Return a proxy object that forwards calls after GSAP loads
    return {
      completed: false,
      play: () => pendingAnimation.then(anim => anim.play()),
      pause: () => pendingAnimation.then(anim => anim.pause()),
      cancel: () => pendingAnimation.then(anim => anim.cancel()),
      then: (onResolve: VoidFunction) =>
        pendingAnimation.then(anim => anim.then(onResolve))
    };

    function createAnimation(el: any, params: any) {
      const { animate: mercuryAnimation, transition: mercuryTransition, callbacks } = params;
      const animationOptions = mercuryAnimation;
      const transitionOptions = mapTransitionToGSAP(mercuryTransition, callbacks);

      const animation = gsap.to(el, {
        ...animationOptions,
        ...transitionOptions
      });

      const instance = {
        completed: false,
        play: () => animation.restart(),
        pause: () => animation.pause(),
        cancel: () => animation.kill(),
        then: (onResolve: VoidFunction) => {
          return animation.then(() => {
            onResolve();
            instance.completed = true;
          });
        }
      };

      return instance;
    }
  }
};
