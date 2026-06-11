<script lang="ts">
	import { page } from '$app/state';
	import { getCategory, getTest } from '../tests.js';

	const slug = $derived(page.params.slug ?? '');
	const test = $derived(getTest(slug));
	const category = $derived(test ? getCategory(test.category) : undefined);
</script>

{#if test}
	<div class="flex min-h-full w-full flex-col">
		<header
			class="sticky top-0 z-10 flex items-center gap-2 border-b border-gray-200 bg-white/80 px-4 py-2.5 pl-14 backdrop-blur-sm"
		>
			<a href="/" class="text-sm text-gray-400 transition-colors hover:text-gray-700">Playground</a>
			<span class="text-sm text-gray-300">/</span>
			<span class="text-sm text-gray-400">{category?.label ?? test.category}</span>
			<span class="text-sm text-gray-300">/</span>
			<span class="text-sm font-medium text-gray-900">{test.name}</span>
		</header>
		<div class="flex w-full flex-1 items-center justify-center p-12">
			{#await test.load() then module}
				{@const Test = module.default}
				<Test />
			{/await}
		</div>
	</div>
{:else}
	<div class="flex min-h-full flex-col items-center justify-center gap-4">
		<p class="text-lg text-gray-600">Test "{slug}" not found.</p>
		<a href="/" class="text-indigo-600 hover:underline">Back to the playground</a>
	</div>
{/if}
