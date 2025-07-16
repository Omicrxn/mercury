<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
	import { stagger } from 'motion';


</script>

<div class="flex flex-col gap-4">
	<div class="flex gap-2">
		{#each { length: 3 }, i}
			<div
				class="box opacity-0 "
				{@attach mercury({
					animate: { opacity: 1, y: [64, 0] },
					transition: { delay: i * 0.05 }
				})}
			></div>
		{/each}
	</div>
</div>
