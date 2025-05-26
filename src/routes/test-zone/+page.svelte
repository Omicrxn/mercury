<script lang="ts">
	import Hover from '../tests/react/hover.svelte';
	import Scroll from '../tests/react/scroll.svelte';
	import Tap from '../tests/react/tap.svelte';
</script>

<div class="flex h-dvh w-full">
	<div class="flex flex-col gap-16 p-12 bg-red-500 w-full h-full overflow-auto">
		<div class="w-full min-h-[2000px] bg-blue-500"></div>
		<Scroll />
	</div>
</div>
