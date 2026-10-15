<script lang="ts">
	import { mercury, scrollValues } from '$lib/index.js';
	import { springValue, transformValue } from 'motion';

	let container = $state<HTMLElement>();
	const { scrollYProgress } = scrollValues({ container: () => container });
	// Motion's useSpring / useTransform: smooth the progress and derive a label from it.
	const progress = springValue(scrollYProgress, { stiffness: 300, damping: 40 });
	const percent = transformValue(() => `${Math.round(scrollYProgress.get() * 100)}%`);
</script>

<div class="flex w-full max-w-[400px] flex-col gap-2">
	<div class="flex items-center gap-3">
		<div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
			<div
				class="h-full origin-left rounded-full bg-blue-500"
				style="transform: scaleX(0)"
				{@attach mercury({ style: { scaleX: progress } })}
			></div>
		</div>
		<span class="w-10 text-right text-sm tabular-nums" {@attach mercury({ text: percent })}>0%</span
		>
	</div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The scroll region needs keyboard focus to scroll.) -->
	<div
		bind:this={container}
		role="region"
		aria-label="Scrollable article"
		tabindex="0"
		class="h-56 overflow-y-auto overscroll-contain rounded-md border border-slate-300 p-4 text-sm leading-relaxed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
	>
		{#each { length: 8 }, i}
			<p class="mb-4">
				Paragraph {i + 1}. Mercury's <code>scrollValues()</code> exposes Motion's scroll position
				and progress as motion values, which <code>style</code> renders without re-running any Svelte
				code.
			</p>
		{/each}
	</div>
</div>
