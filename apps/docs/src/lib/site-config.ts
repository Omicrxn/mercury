import { defineSiteConfig } from "@svecodocs/kit";

export const siteConfig = defineSiteConfig({
	name: "Mercury",
	url: "https://mercury.uialchemy.com",
	ogImage: {
		url: "https://mercury.uialchemy.com/og.png",
		height: "600",
		width: "1200",
	},
	description: "Documentation for Mercury, a Svelte UI animation library.",
	author: "Omicrxn",
	keywords: ["mercury", "sveltekit", "motion", "animation", "svelte", "ui"],
	license: {
		name: "MIT",
		url: "https://github.com/Omicrxn/mercury/blob/master/LICENSE",
	},
	links: {
		x: "https://x.com/OmicrxnDev",
		github: "https://github.com/Omicrxn/mercury",
	},
});
