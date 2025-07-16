<script lang="ts">
	import BasicAnimation from './tests/javascript/basic-animation.svelte';
	import BouncingEasing from './tests/javascript/bouncing-easing.svelte';
	import ColorInterpolation from './tests/javascript/color-interpolation.svelte';
	import Rotate from './tests/javascript/rotate.svelte';
	import Spring from './tests/javascript/spring.svelte';
	import Stagger from './tests/javascript/stagger.svelte';
	import CssSpring from './tests/advanced/css-spring.svelte';
	import Drag from './tests/advanced/drag.svelte';
	import FlipSize from './tests/advanced/flip-size.svelte';
	import Flip from './tests/advanced/flip.svelte';
	import LayoutId from './tests/advanced/layout-id.svelte';
</script>

<div class="flex">
	<div class="flex flex-col gap-16 p-12">
		<BasicAnimation />
		<Rotate />
		<Spring />
		<Stagger />
	</div>
	<div class="flex flex-col gap-16 p-12">
		<ColorInterpolation />
		<BouncingEasing />
		<Drag />
	</div>
	<div class="flex flex-col gap-16 p-12">
		<CssSpring />
		<Flip />
		<FlipSize />
	</div>
	<div class="flex flex-col gap-16 p-12">
		<LayoutId />
	</div>
</div>
