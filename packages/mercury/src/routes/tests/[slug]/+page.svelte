<script lang="ts">
	import { page } from '$app/state';
	import { getTest } from '../tests.js';

	const slug = $derived(page.params.slug ?? '');
	const test = $derived(getTest(slug));
</script>

{#if test}
	<div class="flex min-h-dvh w-full flex-col">
		<header class="flex items-center gap-3 border-b border-gray-200 px-4 py-2">
			<a href="/tests" class="text-sm text-gray-500 hover:text-gray-900">&larr; Tests</a>
			<span class="text-sm text-gray-400">/</span>
			<span class="text-sm font-medium">{test.name}</span>
		</header>
		<div class="flex w-full flex-1 items-center justify-center p-12">
			{#await test.load() then module}
				{@const Test = module.default}
				<Test />
			{/await}
		</div>
	</div>
{:else}
	<div class="flex min-h-dvh flex-col items-center justify-center gap-4">
		<p class="text-lg text-gray-600">Test "{slug}" not found.</p>
		<a href="/tests" class="text-blue-600 hover:underline">Back to all tests</a>
	</div>
{/if}
