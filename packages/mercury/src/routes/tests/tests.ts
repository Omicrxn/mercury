import type { Component } from 'svelte';

const modules = import.meta.glob(['./*/*.svelte', '!./**/+*.svelte']);

export type TestEntry = {
	slug: string;
	category: string;
	name: string;
	load: () => Promise<{ default: Component }>;
};

function toTitle(slug: string): string {
	return slug
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

export const tests: TestEntry[] = Object.entries(modules)
	.map(([path, load]) => {
		const match = path.match(/^\.\/([^/]+)\/([^/]+)\.svelte$/);
		const category = match?.[1] ?? 'misc';
		const slug = match?.[2] ?? path;
		return {
			slug,
			category,
			name: toTitle(slug),
			load: load as TestEntry['load']
		};
	})
	.sort((a, b) => a.category.localeCompare(b.category) || a.slug.localeCompare(b.slug));

export function getTest(slug: string): TestEntry | undefined {
	return tests.find((test) => test.slug === slug);
}
