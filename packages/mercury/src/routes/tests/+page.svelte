<script lang="ts">
	import { tests } from './tests.js';

	const grouped = $derived.by(() => {
		const map = new Map<string, typeof tests>();
		for (const test of tests) {
			const list = map.get(test.category) ?? [];
			list.push(test);
			map.set(test.category, list);
		}
		return [...map.entries()];
	});
</script>

<div class="mx-auto max-w-3xl p-12">
	<h1 class="mb-8 text-3xl font-bold">Tests</h1>
	{#each grouped as [category, items] (category)}
		<section class="mb-10">
			<h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
				{category}
			</h2>
			<ul class="flex flex-col gap-1">
				{#each items as test (test.slug)}
					<li>
						<a
							href="/tests/{test.slug}"
							class="block rounded-md px-3 py-2 text-gray-800 transition-colors hover:bg-gray-100"
						>
							{test.name}
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
