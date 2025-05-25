import { Flip } from 'gsap/Flip';
import { gsap } from 'gsap';
import { v4 as uuid } from 'uuid';
import { tick } from 'svelte';
gsap.registerPlugin(Flip);

const flipLayout = (layoutId: string) => {
	let previousState: Flip.FlipState | null = null;
	const elements = `[data-flip-id="${CSS.escape(layoutId)}"]`;
	const captureState = () => {
		previousState = Flip.getState(elements);
		return previousState;
	};

	const animate = () => {
		if (previousState) {
			let timeline = Flip.from(previousState, {
				targets: elements,
				duration: 0.6,
				ease: 'power1.inOut'
			});
		}
	};

	return { captureState, animate };
};

export const layout = ({ layoutId = uuid(), track }: { layoutId?: string; track: () => any }) => {
	let flipController = flipLayout(layoutId);
	flipController.captureState();
	return (element: HTMLElement) => {
		element.setAttribute('data-flip-id', layoutId);
		let isFirstEffectRun = true;
		$effect.pre(() => {
			// For layout changes (not conditional rendering), we need to capture
			// state before each change, but not on the first run
			if (!isFirstEffectRun) {
				flipController.captureState();
			}
			isFirstEffectRun = false;

			track();
			tick().then(() => {
				flipController.animate();
			});
		});
	};
};
