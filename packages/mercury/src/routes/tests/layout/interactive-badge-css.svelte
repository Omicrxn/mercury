<script lang="ts">
	import { Folder } from '@lucide/svelte';

	const path = ['Mango', 'Jackets', 'Winter bla bla bla bal bla bla bla bla bla bla', '2026'];
	const leafDepth = path.length - 1;
	const indents = ['pl-0', 'pl-3', 'pl-6', 'pl-9'] as const;
</script>

<div class="relative h-64 w-80 rounded-lg border border-dashed border-gray-300 overflow-visible">
	<div class="group/badge absolute top-4 left-4 w-fit cursor-default" role="group" aria-label="Folder path">
		<div
			class="badge-shell flex w-fit flex-col gap-0 overflow-hidden rounded-[3rem] bg-black px-2 py-1 text-sm text-white group-hover/badge:gap-0.5 group-hover/badge:rounded-2xl group-hover/badge:px-3 group-hover/badge:py-1.5"
		>
			{#each path as segment, i (segment)}
				{#if i < leafDepth}
					<div
						class="badge-branch grid min-h-0 w-0 min-w-0 grid-rows-[0fr] overflow-hidden opacity-0 transition-[grid-template-rows,opacity,width] duration-300 ease-out group-hover/badge:w-auto group-hover/badge:grid-rows-[1fr] group-hover/badge:opacity-100"
					>
						<div class="overflow-hidden">
							<div class="flex items-center gap-1.5 {indents[i]}">
								<Folder size={12} class="shrink-0 opacity-80" />
								<span class="opacity-80">{segment}</span>
							</div>
						</div>
					</div>
				{:else}
					<div
						class="badge-leaf flex items-center gap-1.5 pl-0 transition-[padding-left] duration-300 ease-out group-hover/badge:pl-9"
					>
						<Folder size={12} class="shrink-0" />
						<span>{segment}</span>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.badge-shell {
		transition-property: border-radius, padding, gap;
		transition-duration: 300ms;
		/* Spring-ish ease — not available as a Tailwind built-in */
		transition-timing-function: cubic-bezier(0.34, 1.25, 0.64, 1);
	}

	.badge-branch,
	.badge-leaf {
		transition-timing-function: cubic-bezier(0.34, 1.25, 0.64, 1);
	}
</style>
