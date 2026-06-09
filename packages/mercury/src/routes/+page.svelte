<script lang="ts">
	import { groupedTests, tests } from './tests/tests.js';
</script>

<div class="mx-auto max-w-5xl px-8 py-12">
	<header class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight">Mercury Playground</h1>
		<p class="mt-2 max-w-2xl text-gray-500">
			A living catalogue of {tests.length} animation tests. Pick one from the sidebar to run it in
			isolation, or browse by category below.
		</p>
	</header>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each groupedTests as group (group.category.id)}
			<section class="rounded-xl border border-gray-200 bg-white p-5">
				<div class="mb-4 flex items-baseline justify-between">
					<h2 class="text-lg font-semibold">{group.category.label}</h2>
					<span class="text-xs font-medium text-gray-400">{group.items.length}</span>
				</div>
				<p class="mb-4 text-sm text-gray-500">{group.category.description}</p>
				<ul class="flex flex-wrap gap-2">
					{#each group.items as test (test.slug)}
						<li>
							<a
								href="/tests/{test.slug}"
								class="inline-block rounded-md bg-gray-100 px-2.5 py-1 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
							>
								{test.name}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</div>
