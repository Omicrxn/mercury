// src/animationInterface.ts
export interface AnimationEngine {
	animate(targets: HTMLElement | HTMLElement[], params: AnimationParams): AnimationInstance;
}
export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeOutIn'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  // Add other common easing functions
  | { type: 'spring'; stiffness?: number; damping?: number; mass?: number; bounce?: number; restSpeed:number; restDelta:number }
  | { type: 'cubic-bezier'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'steps'; steps: number }
  | string; // For any custom easing strings

export interface AnimationControls {
	duration?: number;
	delay?: number;
	ease?: EasingFunction;
	repeat?: number;
	repeatType?: 'loop' | 'reverse' | 'mirror';
	repeatDelay?: number;
}
export interface AnimationCallbacks {
	onBegin?: () => void;
	onComplete?: () => void;
	onUpdate?: (animation: AnimationInstance | number) => void;
	onRender?: () => void;
	onLoop?: () => void;
}
export interface AnimationAttributes {

	// Add other common animation parameters
	[key: string]: any;
}
export interface AnimationParams{
  initial?: AnimationAttributes;
  animate?: AnimationAttributes;
  transition?: AnimationControls;
  whileHover?: AnimationAttributes;
  whileTap?: AnimationAttributes;
  whileFocus?: AnimationAttributes;
  whileDrag?: AnimationAttributes;
  engine?: AnimationEngine;
}
export interface AnimationInstance {
	play(): void;
	pause(): void;
	then(callback: () => void): void;
	cancel(): void;
	completed: boolean;
	// Add other necessary methods
}
