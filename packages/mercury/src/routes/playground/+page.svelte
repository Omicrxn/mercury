<script lang="ts">
	import AdvancedDialogue from '../tests/components/advanced-dialogue.svelte';
	import AnimatedNavbar from '../tests/components/animated-navbar.svelte';
	import ExitAnimation from '../tests/animation/exit-animation.svelte';
	import FlipSize from '../tests/layout/flip-size.svelte';
	import Flip from '../tests/layout/flip.svelte';
	import InteractiveTextarea from '../tests/components/interactive-textarea.svelte';
	import LayoutIdCards from '../tests/layout/layout-id-cards.svelte';
	import LayoutId from '../tests/layout/layout-id.svelte';
	import CopyButton from '../tests/components/copy-button.svelte';
	import StatefulButton from '../tests/components/stateful-button.svelte';
	import FeedbackPopover from '../tests/components/feedback-popover.svelte';
	import BasicAnimation from '../tests/animation/basic-animation.svelte';
	import InteractiveGraph from '../tests/components/interactive-graph.svelte';
	import GooeyButton from '../tests/components/gooey-button.svelte';
	import FlipArray from '../tests/layout/flip-array.svelte';
	import ReorderingLayout from '../tests/layout/reordering-layout.svelte';
	import Drag from '../tests/gestures/drag.svelte';
	import Scroll from '../tests/gestures/scroll.svelte';
	import Tap from '../tests/gestures/tap.svelte';
</script>

<div class=" flex h-dvh w-full">
	<div class="scroll-test flex flex-col gap-16 p-12 w-full h-full overflow-auto">
		<!-- <BasicAnimation /> -->
		<!-- <InteractiveTextarea />  -->
		<Drag />
		<!-- <Tap /> -->
		<!-- <Scroll /> -->
		<!-- <Flip /> -->
		<!-- <FlipArray /> -->
		<!-- <ReorderingLayout /> -->
		<!-- <FlipSize /> -->
		<!-- <LayoutId /> -->
		<!-- <LayoutIdCards /> -->
		<!-- <AdvancedDialogue /> -->
		<!-- <AnimatedNavbar /> -->
		<!-- <ExitAnimation /> -->
		<!-- <CopyButton /> -->
		<!-- <StatefulButton /> -->
		<!-- <FeedbackPopover/> -->
		<!-- <InteractiveGraph /> -->
		<!-- <GooeyButton /> -->
	</div>
</div>
