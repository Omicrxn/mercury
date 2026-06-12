import {
	LayoutScopeController,
	type LayoutScopeOptions
} from './layout-coordinator.js';

export type LayoutProps = Record<string, string>;

export type { LayoutScopeOptions as LayoutOptions } from './layout-coordinator.js';
export type { LayoutStates } from './layout-anime.js';

type LayoutAttachment = (element: HTMLElement) => (() => void) | void;

export function layoutProps(id?: string): LayoutProps {
	const props: LayoutProps = { 'data-layout': '' };

	if (id) {
		props['data-layout-id'] = id;
	}

	return props;
}

function createLayout(
	trigger: () => unknown,
	optionsOrGetter?: LayoutScopeOptions | (() => LayoutScopeOptions)
): LayoutAttachment {
	const getOptions =
		typeof optionsOrGetter === 'function'
			? optionsOrGetter
			: () => optionsOrGetter ?? {};

	const controller = new LayoutScopeController(getOptions());
	let mounted = $state(false);
	let isFirst = true;

	// Effects must register when layout() is called in <script>, not inside the
	// attachment callback. Attachments run in a nested effect after DOM updates, which
	// is too late for record() before {#if}/{#each} commits.
	$effect.pre(() => {
		trigger();
		const options = getOptions();
		if (!mounted) return;

		controller.setOptions(options);

		if (!isFirst) {
			controller.record();
		}
	});

	$effect(() => {
		trigger();
		const options = getOptions();
		if (!mounted) return;

		controller.setOptions(options);

		if (isFirst) {
			isFirst = false;
			return;
		}

		void controller.animate();
	});

	return (element: HTMLElement) => {
		controller.mount(element).then(() => {
			mounted = true;
		});

		return () => {
			controller.dispose();
		};
	};
}

export const layout = Object.assign(createLayout, {
	props: layoutProps
});
