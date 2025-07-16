import type { AnimationEngine } from '../animation-interface.js';
import { mapTransitionToGSAP } from '../utils.js';

let gsapModule: typeof import('gsap') | null = null;
let loadPromise: Promise<typeof import('gsap')> | null = null;

async function loadGSAP(): Promise<typeof import('gsap')> {
	if (gsapModule) return gsapModule!;
	if (typeof window !== 'undefined' && (window as any).gsap) {
	gsapModule = (window as any).gsap as typeof import('gsap');
		return gsapModule;
	}
	if (!loadPromise) {
		loadPromise = import(
			'gsap'
		).then(
			(mod) => {
				gsapModule = mod.default ?? mod;
				return gsapModule;
			},
			() => {
				throw new Error('Please install GSAP: npm install gsap');
			}
		);
	}
	return loadPromise!;
}

export const GSAPEngine: AnimationEngine = {
  animate(element, params) {
        const { animate: props, transition, callbacks } = params;
        let tween: any = null;
        let gsapReady = false;
        let pendingOperations: Array<() => void> = [];

        // Load GSAP in background
        loadGSAP().then(gsap => {
            gsapReady = true;
            tween = gsap.to(element, {
                ...props,
                ...mapTransitionToGSAP(transition, callbacks)
            });

            // Execute queued operations
            pendingOperations.forEach(op => op());
            pendingOperations = [];
        }).catch(error => {
            console.error('Failed to load GSAP:', error);
        });

        const instance = {
            completed: false,
            play: () => {
                if (gsapReady && tween) {
                    tween.restart();
                } else {
                    pendingOperations.push(() => tween?.restart());
                }
            },
            pause: () => {
                if (gsapReady && tween) {
                    tween.pause();
                } else {
                    pendingOperations.push(() => tween?.pause());
                }
            },
            cancel: () => {
                if (gsapReady && tween) {
                    tween.kill();
                } else {
                    pendingOperations.push(() => tween?.kill());
                }
            },
            onComplete: (onResolve: VoidFunction) => {
                if (gsapReady && tween) {
                    return tween.then(() => {
                        onResolve();
                        instance.completed = true;
                    });
                } else {
                    pendingOperations.push(() => {
                        tween?.then(() => {
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
