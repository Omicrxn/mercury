<script lang="ts">
	import BasicAnimation from './tests/javascript/basic-animation.svelte';
	import BouncingEasing from './tests/javascript/bouncing-easing.svelte';
	import ColorInterpolation from './tests/javascript/color-interpolation.svelte';
	import HtmlContent from './tests/javascript/html-content.svelte';
	import Rotate from './tests/javascript/rotate.svelte';
	import Spring from './tests/javascript/spring.svelte';
	import Stagger from './tests/javascript/stagger.svelte';
	import CssSpring from './tests/react/css-spring.svelte';
	import Drag from './tests/react/drag.svelte';
	import Flip from './tests/react/flip.svelte';
</script>

<div class="flex">
	<div class="flex flex-col gap-16 p-12">
		<BasicAnimation />
		<Rotate />
		<Spring />
		<Stagger />
		<ColorInterpolation />
		<BouncingEasing />
		<HtmlContent />
	</div>
	<div class="flex flex-col gap-16 p-12">
		<CssSpring />
		<Drag />
		<Flip />
	</div>
</div>
