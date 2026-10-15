<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex flex-col gap-4">
	<h2 class="text-xl font-bold">Stagger</h2>
	<div class="flex gap-2">
		{#each { length: 3 }, i}
			<div
				class="box w-16 h-16 bg-demo-fill rounded-md opacity-0 border border-demo-stroke"
				{@attach mercury({
					animate: { opacity: 1, y: [16, 0] },
					transition: { delay: i * 0.05, duration: 0.25, ease: [0.19, 1, 0.22, 1] }
				})}
			></div>
		{/each}
	</div>
</div>
