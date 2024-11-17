import type { Action } from 'svelte/action';
import type { AnimationEngine, AnimationParams, AnimationInstance } from './animation-interface.js';
import { MotionAdapter } from './adapters/motion-adapter.js';

import { setupProjection } from './layout.svelte.js';
import createEventListeners from './utils.svelte.js';
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
	const cleanup: (() => void) | null = null;
	let resolvedParams: AnimationParams | undefined;
	if (typeof params === 'function') {
		resolvedParams = params();
	} else {
		resolvedParams = params;
	}
	const engine:AnimationEngine = resolvedParams?.engine ?? MotionAdapter;
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
			let eventListeners: { remove: () => void } | undefined;
			if (resolvedParams) {
				//TODO: Implement event listeners
				// eventListeners = createEventListeners(node, params, updateAnimation);
			}

			if (!resolvedParams?.animate) {
				return () => {
					projection?.destroy?.();
				};
			}

			updateAnimation(node, resolvedParams);

			return () => {
				currentAnimation?.pause();
				projection?.destroy?.();
				eventListeners?.remove();
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
		private engine: AnimationEngine
	) {
		this.params = {
			duration: ExitAnimationHandler.DEFAULT_DURATION,
			delay: ExitAnimationHandler.DEFAULT_DELAY,
			mode: ExitMode.SYNC,
			...params
		};
	}

	private async startAnimation() {
		const { duration, delay, mode, ...animationParams } = this.params;
		const manager = AnimationManager.getInstance();
		const animation = this.engine.animate(this.node, {
			animate: animationParams,
			transition: { duration, delay }
		});

		manager.addAnimation(animation);
		manager.addExitingNode(this.node);

		animation.then(() => {
			manager.removeExitingNode(this.node);
		});
	}

	async handleExit() {
		const { mode, duration = ExitAnimationHandler.DEFAULT_DURATION } = this.params;
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
				await new Promise((resolve) => setTimeout(resolve, duration * 1000));
				break;

			default:
				await this.startAnimation();
		}
	}

	getTransition() {
		const {
			duration = ExitAnimationHandler.DEFAULT_DURATION,
			delay = ExitAnimationHandler.DEFAULT_DELAY
		} = this.params;
		let isExiting = false;

		return {
			duration: duration * 1000,
			delay: delay * 1000,
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

export const animateExit = (
	node: HTMLElement,
	params: MercuryExitParams = {},
	engine: AnimationEngine
) => new ExitAnimationHandler(node, params, engine).getTransition();
