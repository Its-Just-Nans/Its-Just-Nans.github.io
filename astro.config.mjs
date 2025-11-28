import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import { websiteUrl } from "./src/scripts/pages";

// https://astro.build/config
export default defineConfig({
    site: websiteUrl,
    integrations: [
        mdx({
            remarkPlugins: [remarkMath, remarkToc],
            rehypePlugins: [[rehypeExternalLinks, { target: "_blank" }]],
            shikiConfig: {
                theme: "github-dark",
                // Enable word wrap to prevent horizontal scrolling
                // wrap: true,
            },
        }),
        sitemap({
            changefreq: "weekly",
            priority: 0.7,
            lastmod: new Date(),
            filter: (page) => !page.startsWith(`${websiteUrl}/more/`),
        }),
    ],
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
    },
});
