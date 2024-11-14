<script lang="ts">
	import { mercury, useScope } from '$lib/index.js';
	let parentIsSmall = $state(false);

	const scope = useScope({
		mediaQueries: {
			isSmall: '(max-width: 200px)',
			reduceMotion: '(prefers-reduced-motion)'
		}
	}).add((self) => {
		const { isSmall, reduceMotion } = self.matches;
		parentIsSmall = isSmall;
	});
</script>

<div class="p-32 h-screen w-full grid grid-cols-4 gap-16">
	<div bind:this={scope.root} class="border w-96 h-96">
		<div
			use:mercury={{
				animate: {
					x: parentIsSmall ? 0 : ['-350px', '350px'],
					y: parentIsSmall ? ['-400px', '400px'] : 0,
					loop: true,
					alternate: true,
					duration: parentIsSmall ? 7 : 12
				}
			}}
			class="rounded-md min-w-16 min-h-16 max-w-16 max-h-16 bg-blue-200"
		></div>
	</div>
</div>
