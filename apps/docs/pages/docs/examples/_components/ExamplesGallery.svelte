<script lang="ts">
	import { examples, exampleTitle } from './registry';
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each Object.entries(examples) as [slug, example] (slug)}
		{@const Example = example.component}
		<a
			href="/docs/examples/{slug}"
			class="card flex aspect-square max-h-64 flex-col items-center gap-4 rounded-xl border border-border bg-background px-5 py-4 transition-colors hover:border-muted-foreground"
		>
			<span class="text-base font-semibold text-foreground">{exampleTitle(slug)}</span>
			<div
				class="pointer-events-none relative flex w-full flex-1 flex-col items-center justify-center gap-8 overflow-hidden"
			>
				<Example />
			</div>
		</a>
	{/each}
</div>

<style>
	/* Blume's prose link styles don't honour not-prose; keep the cards plain. */
	a.card {
		color: inherit;
		text-decoration: none;
		font-weight: inherit;
	}
</style>
