// src/animationInterface.ts
export interface AnimationEngine {
	animate(targets: HTMLElement | HTMLElement[], params: AnimationParams): AnimationInstance;
}

export interface AnimationControls {
	duration?: number;
	delay?: number;
	ease?: (string & {}) | Function;
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
  engine?: AnimationEngine;
}

export interface AnimationInstance {
	play(): void;
	pause(): void;
	then(callback: () => void): void;
	cancel(): void;
	// Add other necessary methods
}
