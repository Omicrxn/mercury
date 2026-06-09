import type { Component } from 'svelte';

const modules = import.meta.glob(['./*/*.svelte', '!./**/+*.svelte']);

export type TestEntry = {
	slug: string;
	category: string;
	name: string;
	load: () => Promise<{ default: Component }>;
};

export type Category = {
	id: string;
	label: string;
	description: string;
};

export const categories: Category[] = [
	{
		id: 'animation',
		label: 'Animation',
		description: 'Springs, tweens, easing & keyframe primitives'
	},
	{
		id: 'layout',
		label: 'Layout',
		description: 'FLIP, shared element & reordering transitions'
	},
	{
		id: 'gestures',
		label: 'Gestures',
		description: 'Drag, tap, hover & scroll interactions'
	},
	{
		id: 'components',
		label: 'Components',
		description: 'Real-world UI built with Mercury'
	}
];

const categoryOrder = new Map(categories.map((category, index) => [category.id, index]));

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
	.sort(
		(a, b) =>
			(categoryOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER) -
				(categoryOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER) ||
			a.slug.localeCompare(b.slug)
	);

export type TestGroup = {
	category: Category;
	items: TestEntry[];
};

export const groupedTests: TestGroup[] = categories
	.map((category) => ({
		category,
		items: tests.filter((test) => test.category === category.id)
	}))
	.filter((group) => group.items.length > 0);

export function getTest(slug: string): TestEntry | undefined {
	return tests.find((test) => test.slug === slug);
}

export function getCategory(id: string): Category | undefined {
	return categories.find((category) => category.id === id);
}
