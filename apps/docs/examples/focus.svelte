<script lang="ts">
	import { mercury } from '@omicrxn/mercury';
</script>

<div class="flex flex-col items-center gap-4">
	<p class="text-sm text-muted-foreground">Press Tab to move focus between the buttons.</p>
	<div class="flex gap-3">
		{#each ['One', 'Two', 'Three'] as label (label)}
			<button
				type="button"
				class="min-h-11 rounded-md border border-demo-stroke bg-demo-fill px-4 text-sm font-medium text-demo-fill-foreground outline-none"
				{@attach mercury({
					whileFocus: { scale: 1.08, boxShadow: '0 0 0 3px var(--demo-accent)' },
					whileTap: { scale: 0.95 },
					transition: { type: 'spring', duration: 0.25, bounce: 0.3 }
				})}
			>
				{label}
			</button>
		{/each}
	</div>
</div>
