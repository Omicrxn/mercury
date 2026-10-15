import BasicAnimation from '../../../../examples/basic-animation.svelte';
import BouncingEasing from '../../../../examples/bouncing-easing.svelte';
import ColorInterpolation from '../../../../examples/color-interpolation.svelte';
import ExitAnimation from '../../../../examples/exit-animation.svelte';
import Stagger from '../../../../examples/stagger.svelte';
import AdvancedDialogue from '../../../../examples/advanced-dialogue.svelte';
import AnimatedNavbar from '../../../../examples/animated-navbar.svelte';
import CopyButton from '../../../../examples/copy-button.svelte';
import CssSpring from '../../../../examples/css-spring.svelte';
import Drag from '../../../../examples/drag.svelte';
import FeedbackPopover from '../../../../examples/feedback-popover.svelte';
import Flip from '../../../../examples/flip.svelte';
import FlipSize from '../../../../examples/flip-size.svelte';
import GooeyButton from '../../../../examples/gooey-button.svelte';
import Hover from '../../../../examples/hover.svelte';
import InteractiveGraph from '../../../../examples/interactive-graph.svelte';
import LayoutAnimate from '../../../../examples/layout-animate.svelte';
import LayoutPosition from '../../../../examples/layout-position.svelte';
import FlipArray from '../../../../examples/flip-array.svelte';
import LayoutId from '../../../../examples/layout-id.svelte';
import LayoutIdCards from '../../../../examples/layout-id-cards.svelte';
import Scroll from '../../../../examples/scroll.svelte';
import Tap from '../../../../examples/tap.svelte';
import Variants from '../../../../examples/variants.svelte';
import Slideshow from '../../../../examples/slideshow.svelte';
import DragControls from '../../../../examples/drag-controls.svelte';
import ScrollProgress from '../../../../examples/scroll-progress.svelte';
import Focus from '../../../../examples/focus.svelte';

export const examples = {
	'basic-animation': { component: BasicAnimation, isPremium: false },
	'bouncing-easing': { component: BouncingEasing, isPremium: false },
	'color-interpolation': { component: ColorInterpolation, isPremium: false },
	'exit-animation': { component: ExitAnimation, isPremium: false },
	stagger: { component: Stagger, isPremium: false },
	'advanced-dialogue': { component: AdvancedDialogue, isPremium: true },
	'animated-navbar': { component: AnimatedNavbar, isPremium: true },
	'copy-button': { component: CopyButton, isPremium: true },
	'css-spring': { component: CssSpring, isPremium: false },
	drag: { component: Drag, isPremium: false },
	'feedback-popover': { component: FeedbackPopover, isPremium: true },
	flip: { component: Flip, isPremium: false },
	'flip-size': { component: FlipSize, isPremium: false },
	'gooey-button': { component: GooeyButton, isPremium: true },
	hover: { component: Hover, isPremium: false },
	'interactive-graph': { component: InteractiveGraph, isPremium: true },
	'layout-animate': { component: LayoutAnimate, isPremium: false },
	'layout-position': { component: LayoutPosition, isPremium: false },
	'flip-array': { component: FlipArray, isPremium: false },
	'layout-id': { component: LayoutId, isPremium: false },
	'layout-id-cards': { component: LayoutIdCards, isPremium: true },
	scroll: { component: Scroll, isPremium: false },
	tap: { component: Tap, isPremium: false },
	variants: { component: Variants, isPremium: false },
	slideshow: { component: Slideshow, isPremium: false },
	'drag-controls': { component: DragControls, isPremium: false },
	'scroll-progress': { component: ScrollProgress, isPremium: false },
	focus: { component: Focus, isPremium: false }
};

export type ExampleSlug = keyof typeof examples;

const ACRONYMS: Record<string, string> = { css: 'CSS', id: 'ID' };

export function exampleTitle(slug: string) {
	return slug
		.split('-')
		.map((word) => ACRONYMS[word] ?? word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}
