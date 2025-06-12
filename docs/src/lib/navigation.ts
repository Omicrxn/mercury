import { defineNavigation } from "@svecodocs/kit";
import ChalkboardTeacher from "phosphor-svelte/lib/ChalkboardTeacher";
import RocketLaunch from "phosphor-svelte/lib/RocketLaunch";
import Tag from "phosphor-svelte/lib/Tag";
import { getAllDocs } from "./utils.js";

const allDocs = getAllDocs();

const api = allDocs
  .filter((doc) => doc.section === "API")
  .map((doc) => ({
    title: doc.title,
    href: `/docs/${doc.slug}`,
  }));

export const navigation = defineNavigation({
  anchors: [
    // {
    // 	title: "Introduction",
    // 	href: "/docs",
    // 	icon: ChalkboardTeacher,
    // },
    {
      title: "Getting Started",
      href: "/docs/getting-started",
      icon: RocketLaunch,
    },
    // {
    // 	title: "Releases",
    // 	href: "https://github.com/svecosystem/svecodocs/releases",
    // 	icon: Tag,
    // },
  ],
  sections: [
    {
      title: "API",
      items: api,
    },
  ],
});
