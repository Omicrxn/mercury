import { Previous, useMutationObserver } from 'runed';
import { tick } from 'svelte';

interface AnimationParameters {
	duration?: number;
	delay?: number;
	easing?: string;
}

function measure(node: HTMLElement): DOMRect {
	return node.getBoundingClientRect();
}

function createAnimation(
	node: HTMLElement,
	from: DOMRect,
	to: DOMRect,
	params: AnimationParameters
): Animation {
	const dx = from.left - to.left;
	const dy = from.top - to.top;
	return node.animate(
		[
			{
				width: `${from.width}px`,
				height: `${from.height}px`,
				transform: `translate(${dx}px, ${dy}px)`
			},
			{
				width: `${to.width}px`,
				height: `${to.height}px`,
				transform: 'translate(0, 0)'
			}
		],
		{
			duration: params.duration ?? 500,
			easing: params.easing ?? 'ease-out',
			delay: params.delay ?? 0,
			fill: 'backwards'
		}
	);
}

export default function flip(node: HTMLElement, params: AnimationParameters = {}): () => void {
	let current = $state<DOMRect>(measure(node));
	const previous = new Previous<DOMRect>(() => current);

	function update() {
		const next = measure(node);
		if (current) {
			if (previous.current) {
				createAnimation(node, previous.current, next, params);
			}
		}
		current = next;
	}

	// Observe the parent element instead of the node itself
	const parentNode = node.parentElement;

	const observer = useMutationObserver(
		() => parentNode,
		(mutations) => {
			for (const mutation of mutations) {
				if (
					(mutation.type === 'attributes' && mutation.attributeName === 'class') ||
					mutation.type === 'childList'
				) {
					requestAnimationFrame(() => {
						current = measure(node);
						tick().then(update);
					});
					break;
				}
			}
		},
		{ attributes: true, subtree: true, childList: true }
	);

	// Initial measurement and animation
	requestAnimationFrame(() => {
		current = measure(node);
		tick().then(update);
	});

	return () => {
		observer.stop();
	};
}
