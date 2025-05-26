<script lang="ts">
	import { animate, onScroll } from 'animejs';
	import { onMount } from 'svelte';
	onMount(() => {
		animate('.box', {
			rotate: '1turn',
			x: 100,
			loop: true,
			autoplay: onScroll({
				container: '.scroll-test',
				debug: true,
				repeat: true,
				onEnter: () => {
					console.log('entered');
				},
				onLeave: () => {
					console.log('leave');
				}
			})
		});
	});
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Scroll Animation</h2>
	<div class="box w-16 h-16 bg-blue-200 rounded-md border border-slate-500"></div>
</div>
