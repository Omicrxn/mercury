<script lang="ts">
	import Logo from "$lib/components/logos/logo.svelte";
	import LogoDark from "$lib/components/logos/logo-dark.svelte";
	// import SvecosystemLight from "$lib/components/logos/svecosystem-light.svelte";
	import { DocsLayout } from "@svecodocs/kit";
	import { navigation } from "$lib/navigation";

	let { children } = $props();
</script>

<DocsLayout {navigation}>
	{#snippet logo()}
		<LogoDark class="hidden p-8  dark:flex" />
		<Logo class="flex p-8  dark:hidden " />
		<span class="sr-only">Mercury</span>
	{/snippet}

	{@render children?.()}
</DocsLayout>
