import { defineConfig } from "blume";

export default defineConfig({
  title: "Mercury",
  description: "Documentation for Mercury, a Svelte UI animation library.",
  logo: {
    image: "/logo.svg",
    text: "",
  },

  // Docs live under /docs; the site root is the custom landing page in
  // pages/index.astro. Links, nav entries, and redirects are written as if
  // mounted at root and Blume prefixes them.
  basePath: "/docs",

  github: {
    owner: "Omicrxn",
    repo: "mercury",
    branch: "master",
    dir: "apps/docs",
  },

  navigation: {
    featured: [{ label: "Examples", href: "/examples", icon: "sparkles" }],
    actions: [
      { label: "Docs", href: "/" },
      { label: "Examples", href: "/examples" },
    ],
  },

  theme: {
    accent: "#f43f5e",
  },

  // Svelte demos rendered by <Component path="…" />. The shared demo classes
  // (.box, .circle, …) live in theme.css so both the preview frames and the
  // examples gallery pick them up.
  examples: {
    source: "examples",
    css: "theme.css",
  },

  integrations: [
    {
      // These packages ship uncompiled .svelte / .svelte.js files, so the
      // prerender step has to bundle (and compile) them instead of importing
      // them from node_modules.
      name: "mercury-svelte-deps",
      hooks: {
        "astro:config:setup": ({ updateConfig }) => {
          const noExternal = ["@lucide/svelte", "phosphor-svelte", "runed", "@omicrxn/mercury"];
          updateConfig({
            vite: {
              ssr: { noExternal },
              environments: { prerender: { resolve: { noExternal } } },
            },
          });
        },
      },
    },
  ],

  deployment: {
    site: "https://mercury.uialchemy.com",
  },
});
