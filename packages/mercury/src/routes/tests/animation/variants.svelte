<script lang="ts">
	import { mercury, type Variants } from '$lib/index.js';

	let open = $state(false);

	const list: Variants = {
		open: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
		closed: { transition: { staggerChildren: 0.04, staggerDirection: -1 } }
	};
	const item: Variants = {
		open: { opacity: 1, y: 0, filter: 'blur(0px)' },
		closed: { opacity: 0, y: 12, filter: 'blur(4px)' }
	};
	const items = ['Inbox', 'Drafts', 'Sent', 'Archive'];
</script>

<div class="flex w-48 flex-col gap-3">
	<button
		type="button"
		aria-expanded={open}
		class="min-h-11 rounded-md border border-slate-500 bg-blue-200 px-4 text-sm font-medium text-slate-800"
		onclick={() => (open = !open)}
		{@attach mercury({ whileTap: { scale: 0.97 } })}
	>
		{open ? 'Close' : 'Open'} menu
	</button>
	<ul
		class="flex flex-col gap-2"
		{@attach mercury({
			initial: 'closed',
			animate: open ? 'open' : 'closed',
			variants: list,
			transition: { type: 'spring', duration: 0.35, bounce: 0 }
		})}
	>
		{#each items as label (label)}
			<li
				class="rounded-md border border-slate-500 px-3 py-2 text-sm"
				inert={!open}
				{@attach mercury({ variants: item })}
			>
				{label}
			</li>
		{/each}
	</ul>
</div>
