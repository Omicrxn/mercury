<script lang="ts">
	import { siteConfig } from "$lib/site-config";
	import "../app.css";
	import { useSiteConfig } from "@svecodocs/kit";

	let { children } = $props();

	useSiteConfig(() => siteConfig);
</script>
<svelte:head>
    <meta name="twitter:card" content={siteConfig.ogImage?.url}  />
</svelte:head>
{@render children?.()}
