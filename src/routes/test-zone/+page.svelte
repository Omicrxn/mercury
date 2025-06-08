<script lang="ts">
	import { nodeMap } from '$lib/mercury/layout.svelte.js';
	import AdvancedDialogue from '../tests/advanced/advanced-dialogue.svelte';
	import FlipSize from '../tests/advanced/flip-size.svelte';
	import Flip from '../tests/advanced/flip.svelte';
	import InteractiveTextarea from '../tests/advanced/interactive-textarea.svelte';
	import LayoutIdCards from '../tests/advanced/layout-id-cards.svelte';
	import LayoutId from '../tests/advanced/layout-id.svelte';
</script>

<div class=" flex h-dvh w-full">
	<div class="scroll-test flex flex-col gap-16 p-12 w-full h-full overflow-auto">
		<!-- <InteractiveTextarea /> -->
		<!-- <Flip />
		<FlipSize />
		<LayoutId /> -->
		<!-- <LayoutIdCards /> -->
		<AdvancedDialogue />
	</div>
</div>
