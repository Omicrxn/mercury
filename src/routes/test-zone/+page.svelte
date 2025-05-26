<script lang="ts">
	import BouncingEasing from '../tests/javascript/bouncing-easing.svelte';
	import Spring from '../tests/javascript/spring.svelte';
	import Drag from '../tests/react/drag.svelte';
</script>

<div class=" flex h-dvh w-full">
	<div class="scroll-test flex flex-col gap-16 p-12 bg-red-500 w-full h-full overflow-auto">
		<Spring />
	</div>
</div>
