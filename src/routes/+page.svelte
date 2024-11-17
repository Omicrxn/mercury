<script lang="ts">
	import { mercury } from '$lib/index.js';
	import { AnimeAdapter } from '$lib/mercury/adapters/animejs-adapter.js';
	const params = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { duration: 1, delay: 5 }
	};
	const paramsMotion = {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		transition: { duration: 1, delay: 5 },
		engine: AnimeAdapter
	};
</script>

<div class="flex flex-col w-full h-screen bg-red-400 p-12">
	<div use:mercury={params} class="min-w-16 min-h-16 bg-blue-200 max-h-16 max-w-16 rounded-md">
		<!-- Content -->
	</div>
	<div
		use:mercury={paramsMotion}
		class="min-w-16 min-h-16 bg-green-200 max-h-16 max-w-16 rounded-md"
	>
		<!-- Content -->
	</div>
</div>
