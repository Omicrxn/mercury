import {
	engine,
	animate,
	type TargetsParam,
	type Animation,
	createDraggable,
	type AnimationParams
} from '@juliangarnierorg/anime-beta';
import type { Action } from 'svelte/action';
import { setupProjection } from './layout.js';

// Constants
const DEFAULT_DURATION = 1;
const DEFAULT_DELAY = 0;

// Enums
export enum ExitMode {
	SYNC = 'sync',
	WAIT = 'wait',
	POP_LAYOUT = 'popLayout'
}

// Interfaces
export interface MercuryAttributes {
	layout?: string | boolean;
	draggable?: boolean;
}

export type MercuryParams = TargetsParam & {
	play?: boolean;
};

export type MercuryExitParams = TargetsParam & {
	mode?: ExitMode;
	duration?: number;
	delay?: number;
};

// State management
class AnimationState {
	private static instance: AnimationState;
	private activeAnimations: Set<Animation>;
	private exitingNodes: Set<HTMLElement>;

	private constructor() {
		this.activeAnimations = new Set();
		this.exitingNodes = new Set();
	}

	static getInstance(): AnimationState {
		if (!AnimationState.instance) {
			AnimationState.instance = new AnimationState();
		}
		return AnimationState.instance;
	}

	addAnimation(animation: Animation): void {
		this.activeAnimations.add(animation);
	}

	removeAnimation(animation: Animation): void {
		this.activeAnimations.delete(animation);
	}

	addExitingNode(node: HTMLElement): void {
		this.exitingNodes.add(node);
	}

	removeExitingNode(node: HTMLElement): void {
		this.exitingNodes.delete(node);
	}

	get hasExitingNodes(): boolean {
		return this.exitingNodes.size > 0;
	}

	get allActiveAnimations(): Animation[] {
		return Array.from(this.activeAnimations);
	}
}

// Mercury action
export const mercury: Action<
	HTMLElement,
	(() => MercuryParams) | MercuryParams | undefined,
	MercuryAttributes
> = (node, params) => {
	engine.timeUnit = 's';
	const state = AnimationState.getInstance();
	let currentAnimation: Animation | null = null;
	let animationParams: MercuryParams;
	let layoutProjection: {
		destroy: () => void;
	} | null = null;
	const initializeNode = () => {
		const layout = node.hasAttribute('layout');
		const layoutId = node.getAttribute('layout');
		const draggable = node.hasAttribute('draggable');

		if (layout || layoutId) {
			try {
				layoutProjection = setupProjection(node, layoutId);
			} catch (error) {
				console.error('Error setting up layout projection:', error);
			}
		}

		if (draggable) {
			try {
				createDraggable(node);
			} catch (error) {
				console.error('Error setting up draggable:', error);
			}
		}
	};

	const updateAnimation = (node: HTMLElement, params: MercuryParams): void => {
		if (currentAnimation) {
			currentAnimation.pause();
			state.removeAnimation(currentAnimation);
		}

		currentAnimation = animate(node, params as AnimationParams);
		state.addAnimation(currentAnimation);
	};

	// Initialize
	initializeNode();

	$effect(() => {
		try {
			animationParams = { ...(typeof params === 'function' ? params() : params || {}) };
			updateAnimation(node, animationParams);

			return () => {
				if (currentAnimation) {
					state.removeAnimation(currentAnimation);
					currentAnimation.pause();
				}
				layoutProjection?.destroy();
			};
		} catch (error) {
			console.error('Error in mercury animation effect:', error);
		}
	});
};

// Exit animation handler
export class ExitAnimationHandler {
	private node: HTMLElement;
	private params: MercuryExitParams;
	private state: AnimationState;
	private isExiting: boolean;

	constructor(node: HTMLElement, params: MercuryExitParams = {}) {
		this.node = node;
		this.params = {
			duration: DEFAULT_DURATION,
			delay: DEFAULT_DELAY,
			mode: ExitMode.SYNC,
			...params
		};
		this.state = AnimationState.getInstance();
		this.isExiting = false;
	}

	private async startAnimation() {
		const { duration, delay, mode, ...restParams } = this.params;
		const exitAnimation = animate(this.node, { duration, delay, ...restParams });

		this.state.addAnimation(exitAnimation);
		this.state.addExitingNode(this.node);

		exitAnimation.then(() => {
			this.state.removeAnimation(exitAnimation);
			this.state.removeExitingNode(this.node);
		});
	}

	async handleExit(): Promise<void> {
		const { mode, duration = DEFAULT_DURATION } = this.params;
		switch (mode) {
			case ExitMode.WAIT:
				await Promise.all(this.state.allActiveAnimations.map((anim) => anim.completed));
				await this.startAnimation();
				break;

			case ExitMode.POP_LAYOUT:
				if (this.node.parentNode) {
					(this.node.parentNode as HTMLElement).style.position = 'relative';
				}
				this.node.style.position = 'absolute';
				await this.startAnimation();
				await new Promise((resolve) => setTimeout(resolve, duration * 1000));
				break;

			default:
				await this.startAnimation();
		}
	}

	getTransition(): { duration: number; delay: number; css: (t: number, u: number) => string } {
		const { duration = DEFAULT_DURATION, delay = DEFAULT_DELAY } = this.params;

		return {
			duration: duration * 1000,
			delay: delay * 1000,
			css: (t: number, u: number) => {
				if (!this.isExiting && t <= u) {
					this.isExiting = true;
					this.handleExit();
				}
				return '';
			}
		};
	}
}

// Helper functions
export function useExit(
	node: HTMLElement,
	params: MercuryExitParams = {}
): ReturnType<ExitAnimationHandler['getTransition']> {
	const handler = new ExitAnimationHandler(node, params);
	return handler.getTransition();
}
