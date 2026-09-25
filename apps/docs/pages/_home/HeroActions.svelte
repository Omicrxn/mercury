<script lang="ts">
	import { mercury } from '@omicrxn/mercury';

	const command = 'npm i @omicrxn/mercury';
	let copied = $state(false);

	const press = mercury({
		whileHover: { scale: 1.04 },
		whileTap: { scale: 0.96 },
		transition: { type: 'spring', bounce: 0.4, duration: 0.35 }
	});

	async function copy() {
		await navigator.clipboard.writeText(command);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<div class="flex flex-col items-center gap-5">
	<div class="flex flex-wrap items-center justify-center gap-3">
		<a
			href="/docs"
			class="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
			{@attach press}
		>
			Read the docs
		</a>
		<a
			href="/docs/examples"
			class="rounded-full border border-white/40 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-sm hover:border-white/70"
			{@attach press}
		>
			Browse examples
		</a>
	</div>

	<button
		type="button"
		onclick={copy}
		class="flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-4 py-2 font-mono text-xs text-white/80 backdrop-blur-sm hover:text-white"
		aria-label="Copy install command"
	>
		<span class="text-white/40">$</span>
		<span>{command}</span>
		<span class="w-12 text-right text-white/50">{copied ? 'Copied' : 'Copy'}</span>
	</button>
</div>
