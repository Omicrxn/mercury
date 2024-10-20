import { engine, animate, type TargetsParam, type Animation } from '@juliangarnierorg/anime-beta';
import type { ActionReturn } from 'svelte/action';

interface MercuryAttributes {
  layout?: boolean;
}

type MercuryParams = TargetsParam & {
  play?: boolean;
};

type MercuryExitParams = TargetsParam & {
  mode?: 'sync' | 'wait' | 'popLayout';
};

const activeAnimations: Set<Animation> = new Set();
const exitingNodes: Set<HTMLElement> = new Set();

// Mercury action definition
export function mercury(
  node: HTMLElement,
  params: MercuryParams = {}
): ActionReturn<MercuryParams, MercuryAttributes> {
  engine.timeUnit = 's'; // Change the time unit globally to seconds
  let currentAnimation: Animation | null = null;
  let animationParams: MercuryParams = { ...params };
  const layout = node.hasAttribute('layout');

  function updateAnimation(node: HTMLElement, animationParams: MercuryParams, isExit = false) {
    if (currentAnimation) {
      currentAnimation.pause();
      activeAnimations.delete(currentAnimation);
    }
    currentAnimation = animate(node, animationParams);
    activeAnimations.add(currentAnimation);
  }

  if(layout){
    // TODO: Add layout animation (Need to choose between: FLIP, Layout Projection or ViewTransition API)
  }

  // Initialize animation for this node
  updateAnimation(node, animationParams);

  return {
    update(newParams: MercuryParams) {
      animationParams = { ...newParams };
      updateAnimation(node, animationParams);
    },
    destroy() {
      if (currentAnimation) {
        activeAnimations.delete(currentAnimation);
        currentAnimation.pause();
      }
    }
  };
}

// Function to handle exit animations
export function useExit(outNode: HTMLElement, params: MercuryExitParams = {}) {
  const { duration = 1, delay = 0, mode = 'sync', ...restParams } = params;
  let isExiting = false;

  function startAnimation() {
    const exitAnimation = animate(outNode, { duration, delay, ...restParams });
    activeAnimations.add(exitAnimation);
    exitingNodes.add(outNode);
    exitAnimation.then(() => {
      activeAnimations.delete(exitAnimation);
      exitingNodes.delete(outNode);
    });
  }

  function handleExitAnimation() {
    switch (mode) {
      case 'wait':
        Promise.all(Array.from(activeAnimations).map((anim) => anim.completed)).then(startAnimation);
        break;
      case 'popLayout':
        if (outNode.parentNode) {
          (outNode.parentNode as HTMLElement).style.position = 'relative';
        }
        outNode.style.position = 'absolute';
        startAnimation();
        return new Promise((resolve) => setTimeout(resolve, duration * 1000));
      default: // 'sync' mode
        startAnimation();
    }
  }

  return {
    duration: duration * 1000,
    delay: delay * 1000,
    css: (t: number, u: number) => {
      if (!isExiting && t <= u) {
        isExiting = true;
        handleExitAnimation();
      }
      return '';
    }
  };
}

// Helper function to check if layout animations should be blocked
export function shouldBlockLayout(): boolean {
  return exitingNodes.size > 0;
}
