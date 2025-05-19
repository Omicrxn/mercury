import type { Action } from 'svelte/action';
import type { AnimationEngine, AnimationParams, AnimationInstance } from './animation-interface.js';
import { MotionAdapter } from './adapters/motion-adapter.js';

import { setupProjection } from './layout.svelte.js';
// Constants and Types
export enum ExitMode {
	SYNC = 'sync',
	WAIT = 'wait',
	POP_LAYOUT = 'popLayout'
}

export interface MercuryAttributes {
	layout?: string | boolean;
	draggable?: boolean;
}

export type MercuryExitParams = AnimationParams & {
	mode?: ExitMode;
	duration?: number;
	delay?: number;
};
interface Interaction {
	name: string;
	startEvents: string[];
	endEvents: string[];
	params: AnimationParams;
}

// Singleton Animation Manager
class AnimationManager {
	private static instance: AnimationManager;
	private animations = new Set<AnimationInstance>();
	private exitingNodes = new Set<HTMLElement>();

	static getInstance() {
		return (this.instance ??= new AnimationManager());
	}

	addAnimation(animation: AnimationInstance) {
		this.animations.add(animation);
		animation.then(() => this.animations.delete(animation));
	}

	addExitingNode(node: HTMLElement) {
		this.exitingNodes.add(node);
	}

	removeExitingNode(node: HTMLElement) {
		this.exitingNodes.delete(node);
	}

	get activeAnimations() {
		return Array.from(this.animations);
	}

	get hasExitingNodes() {
		return this.exitingNodes.size > 0;
	}
}

// Mercury Action
export const mercury: Action<
	HTMLElement,
	(() => AnimationParams) | AnimationParams | undefined,
	MercuryAttributes
> = (node, params) => {
	const manager = AnimationManager.getInstance();
	let currentAnimation: AnimationInstance | null = null;

	const removeEventListeners: (() => void)[] = [];
	const cleanup: (() => void) | null = null;

	let resolvedParams: AnimationParams | undefined;
	if (typeof params === 'function') {
		resolvedParams = params();
	} else {
		resolvedParams = params;
	}
	const engine: AnimationEngine = resolvedParams?.engine ?? MotionAdapter;

	function initializeNode() {
		const layoutId = node.getAttribute('layout');
		let projection = null;

		if (node.hasAttribute('layout') || layoutId) {
			projection = setupProjection(node, layoutId);
		}
		//TODO: Implement draggable
		// if (node.hasAttribute('draggable')) {
		// 	createDraggable(node);
		// }

		return projection;
	}

	function updateAnimation(node: HTMLElement, params: AnimationParams) {
		if (currentAnimation) {
			currentAnimation.pause();
		}
		currentAnimation = engine.animate(node, params);
		manager.addAnimation(currentAnimation);
	}

	const projection = initializeNode();
	$effect(() => {
		try {
			if (!resolvedParams?.animate) {
				return () => {
					projection?.destroy?.();
				};
			}
			const interactions: Interaction[] = [];

			if (resolvedParams?.whileHover) {
				interactions.push({
					name: 'whileHover',
					startEvents: ['mouseover'],
					endEvents: ['mouseout'],
					params: resolvedParams.whileHover
				});
			}

			if (resolvedParams?.whileTap) {
				interactions.push({
					name: 'whileTap',
					startEvents: ['pointerdown'],
					endEvents: ['pointerup', 'pointercancel', 'pointerleave'],
					params: resolvedParams.whileTap
				});
			}

			if (resolvedParams?.whileFocus) {
				interactions.push({
					name: 'whileFocus',
					startEvents: ['focus'],
					endEvents: ['blur-sm'],
					params: resolvedParams.whileFocus
				});
			}

			if (resolvedParams?.whileDrag) {
				interactions.push({
					name: 'whileDrag',
					startEvents: ['dragstart'],
					endEvents: ['dragend'],
					params: resolvedParams.whileDrag
				});
			}

			updateAnimation(node, resolvedParams);
			//Set Up interactions
			interactions.forEach((interaction) => {
				const { startEvents, endEvents, params } = interaction;

				let animationInstance: AnimationInstance | null = null;

				const onStart = () => {
					if (animationInstance) {
						animationInstance.pause();
					}
					const startInteractionParams = {
						animate: {
							...params
						},
						transition: {
							...resolvedParams.transition
						}
					};

					animationInstance = engine.animate(node, startInteractionParams);
					manager.addAnimation(animationInstance);
				};

				const onEnd = () => {
					if (animationInstance) {
						animationInstance.pause();
					}
					const endInteractionParams = {
						animate: {
							...resolvedParams.animate
						},
						transition: {
							...resolvedParams.transition
						}
					};

					animationInstance = engine.animate(node, endInteractionParams);
					manager.addAnimation(animationInstance);
				};

				startEvents.forEach((event) => {
					node.addEventListener(event, onStart);
					removeEventListeners.push(() => {
						node.removeEventListener(event, onStart);
					});
				});

				endEvents.forEach((event) => {
					node.addEventListener(event, onEnd);
					removeEventListeners.push(() => {
						node.removeEventListener(event, onEnd);
					});
				});
			});

			return () => {
				currentAnimation?.pause();
				projection?.destroy?.();
				removeEventListeners.forEach((remove) => remove());
			};
		} catch (error) {
			console.error('Mercury animation error:', error);
		}
	});
};

// Exit Animation Handler
export class ExitAnimationHandler {
	private static readonly DEFAULT_DURATION = 1;
	private static readonly DEFAULT_DELAY = 0;

	constructor(
		private node: HTMLElement,
		private params: MercuryExitParams = {},
		private engine: AnimationEngine = MotionAdapter
	) {
		this.params = {
			mode: ExitMode.SYNC,
			...params,
			transition: {
				...{
					duration: ExitAnimationHandler.DEFAULT_DURATION,
					delay: ExitAnimationHandler.DEFAULT_DELAY
				},
				...params.transition
			}
		};
	}

	private async startAnimation() {
		const manager = AnimationManager.getInstance();
		const animation = this.engine.animate(this.node, this.params);

		manager.addAnimation(animation);
		manager.addExitingNode(this.node);

		animation.then(() => {
			manager.removeExitingNode(this.node);
		});
	}

	async handleExit() {
		const { mode } = this.params;
		const manager = AnimationManager.getInstance();

		switch (mode) {
			case ExitMode.WAIT:
				await Promise.all(manager.activeAnimations.map((anim) => anim.completed));
				await this.startAnimation();
				break;

			case ExitMode.POP_LAYOUT:
				if (this.node.parentElement) {
					this.node.parentElement.style.position = 'relative';
					this.node.style.position = 'absolute';
				}
				await this.startAnimation();
				await new Promise((resolve) =>
					setTimeout(resolve, this.params.transition!.duration! * 1000)
				);
				break;

			default:
				await this.startAnimation();
		}
	}

	getTransition() {
		let isExiting = false;
		return {
			duration: this.params.transition!.duration! * 1000,
			delay: this.params.transition!.delay! * 1000,
			css: (t: number, u: number) => {
				if (!isExiting && t <= u) {
					isExiting = true;
					this.handleExit();
				}
				return '';
			}
		};
	}
}

export const animateExit = (node: HTMLElement, params: MercuryExitParams = {}) =>
	new ExitAnimationHandler(node, params).getTransition();
