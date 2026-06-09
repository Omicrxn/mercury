<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { groupedTests, tests } from './tests/tests.js';

	let { children } = $props();

	let query = $state('');
	let collapsed = $state(false);

	const pathname = $derived(page.url.pathname);

	const filteredGroups = $derived.by(() => {
		const term = query.trim().toLowerCase();
		if (!term) return groupedTests;
		return groupedTests
			.map((group) => ({
				...group,
				items: group.items.filter(
					(test) =>
						test.name.toLowerCase().includes(term) || test.slug.toLowerCase().includes(term)
				)
			}))
			.filter((group) => group.items.length > 0);
	});

	function isActive(slug: string) {
		return pathname === `/tests/${slug}`;
	}
</script>

<div class="flex h-dvh w-full overflow-hidden bg-gray-50 text-gray-900">
	{#if !collapsed}
		<aside class="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
			<div class="flex items-center justify-between gap-2 px-4 py-4">
				<a href="/" class="flex items-center gap-2 font-semibold">
					<span
						class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white"
					>
						M
					</span>
					<span>Mercury</span>
					<span class="text-xs font-normal text-gray-400">playground</span>
				</a>
				<button
					type="button"
					onclick={() => (collapsed = true)}
					class="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
					title="Collapse sidebar"
					aria-label="Collapse sidebar"
				>
					&#9776;
				</button>
			</div>

			<div class="px-4 pb-3">
				<input
					type="search"
					bind:value={query}
					placeholder="Search {tests.length} tests…"
					class="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-400 focus:bg-white"
				/>
			</div>

			<nav class="flex-1 overflow-y-auto px-2 pb-4">
				{#each filteredGroups as group (group.category.id)}
					<section class="mb-4">
						<h2
							class="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400"
						>
							{group.category.label}
						</h2>
						<ul class="flex flex-col gap-0.5">
							{#each group.items as test (test.slug)}
								<li>
									<a
										href="/tests/{test.slug}"
										class="block rounded-md px-2 py-1.5 text-sm transition-colors {isActive(
											test.slug
										)
											? 'bg-indigo-50 font-medium text-indigo-700'
											: 'text-gray-700 hover:bg-gray-100'}"
									>
										{test.name}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{:else}
					<p class="px-3 py-2 text-sm text-gray-400">No tests match “{query}”.</p>
				{/each}
			</nav>

			<div class="border-t border-gray-200 px-4 py-3">
				<a
					href="/playground"
					class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
				>
					Scratchpad
				</a>
			</div>
		</aside>
	{/if}

	<main class="relative flex-1 overflow-auto">
		{#if collapsed}
			<button
				type="button"
				onclick={() => (collapsed = false)}
				class="absolute left-3 top-3 z-50 rounded-md border border-gray-200 bg-white/90 p-1.5 text-gray-500 shadow-sm backdrop-blur transition-colors hover:bg-gray-100 hover:text-gray-800"
				title="Expand sidebar"
				aria-label="Expand sidebar"
			>
				&#9776;
			</button>
		{/if}
		{@render children()}
	</main>
</div>
