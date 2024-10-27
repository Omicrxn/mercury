import {
	engine,
	animate,
	type TargetsParam,
	type Animation,
	createDraggable,
	type AnimationParams
} from '@juliangarnierorg/anime-beta';
import type { Action } from 'svelte/action';
import { setupProjection } from './layout.svelte.js';
import createEventListeners from './utils.js';
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

export type MercuryParams = {
	initial?: AnimationParams;
	animate: AnimationParams;
	transition?: AnimationParams;
	play?: boolean;
	whileHover?: AnimationParams;
	whileTap?: AnimationParams;
};

export type MercuryExitParams = AnimationParams & {
	mode?: ExitMode;
	duration?: number;
	delay?: number;
};

// Singleton Animation Manager
class AnimationManager {
	private static instance: AnimationManager;
	private animations = new Set<Animation>();
	private exitingNodes = new Set<HTMLElement>();

	static getInstance() {
		return (this.instance ??= new AnimationManager());
	}

	addAnimation(animation: Animation) {
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

// Helper Functions
function mergeTransitionParams({
	initial = {},
	animate,
	transition = {}
}: MercuryParams): AnimationParams {
	const properties = new Set([...Object.keys(initial), ...Object.keys(animate)]);
	const result = {} as AnimationParams;

	for (const prop of properties) {
		const initialValue = initial[prop];
		const animateValue = animate[prop];

		result[prop] =
			initialValue === undefined
				? animateValue
				: Array.isArray(animateValue)
					? [initialValue, ...animateValue]
					: [initialValue, animateValue];
	}

	return { ...result, ...transition };
}

// Mercury Action
export const mercury: Action<
	HTMLElement,
	(() => MercuryParams) | MercuryParams | undefined,
	MercuryAttributes
> = (node, params) => {
	engine.timeUnit = 's';
	const manager = AnimationManager.getInstance();
	let currentAnimation: Animation | null = null;
	const cleanup: (() => void) | null = null;

	function initializeNode() {
		const layoutId = node.getAttribute('layout');
		let projectionCleanup = null;

		if (node.hasAttribute('layout') || layoutId) {
			projectionCleanup = setupProjection(node, layoutId)?.destroy;
		}

		if (node.hasAttribute('draggable')) {
			createDraggable(node);
		}

		return projectionCleanup;
	}

	function updateAnimation(node: HTMLElement, params: AnimationParams) {
		if (currentAnimation) {
			currentAnimation.pause();
		}
		currentAnimation = animate(node, params);
		manager.addAnimation(currentAnimation);
	}

	const projectionCleanup = initializeNode();

	$effect(() => {
		try {
			let eventListeners: { remove: () => void } | undefined;
			const resolvedParams = typeof params === 'function' ? params() : params;
			if (resolvedParams) {
				eventListeners = createEventListeners(node, resolvedParams, updateAnimation);
			}

			if (!resolvedParams?.animate) {
				return () => {
					projectionCleanup?.();
				};
			}

			const mergedParams = mergeTransitionParams(resolvedParams);
			updateAnimation(node, mergedParams);

			return () => {
				currentAnimation?.pause();
				projectionCleanup?.();
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
		private params: MercuryExitParams = {}
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
		const animation = animate(this.node, { duration, delay, ...animationParams });

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

export const animateExit = (node: HTMLElement, params: MercuryExitParams = {}) =>
	new ExitAnimationHandler(node, params).getTransition();
