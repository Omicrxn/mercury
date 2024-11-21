<script lang="ts">
	import { mercury } from '$lib/index.js';
	import LoadingButton from './components/loading-button.svelte';
</script>

<div class="flex flex-col w-full h-screen bg-red-400 p-12 gap-12">
	<LoadingButton />
	<div
		use:mercury={{
			initial: { x: 0 },
			animate: {
				x: 500
			},
			transition: {
				duration: 1,
				ease: { type: 'spring' }
			}
		}}
		class="w-16 h-16 bg-blue-200 rounded-md"
	></div>
	<div
		class="w-16 h-16 bg-green-200 rounded-md"
		use:mercury={{
			animate: {
				scale: 0.5
			},
			whileHover: {
				scale: 1.5
			},
			whileTap: {
				scale: 2
			}
		}}
	></div>
</div>
