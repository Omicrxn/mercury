<script lang="ts">
	import type { AnimationInstance } from '@omicrxn/mercury';
	import { examples, type ExampleSlug } from './registry';

	let { slug }: { slug: ExampleSlug } = $props();

	let animation = $state<AnimationInstance>();
	const Example = $derived(examples[slug].component);
</script>

<div class="relative flex min-h-[420px] w-full flex-col items-center justify-center rounded-xl border border-border p-8">
	{#if animation}
		<button
			type="button"
			class="absolute top-3 right-3 rounded-md border border-border px-3 py-1 text-sm font-medium text-foreground hover:bg-muted"
			onclick={() => animation?.play()}
		>
			Replay
		</button>
	{/if}
	<Example bind:animation />
</div>
