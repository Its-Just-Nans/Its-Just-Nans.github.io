import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
    site: "https://n4n5.dev",
    integrations: [
        svelte(),
        mdx({
            remarkPlugins: [remarkMath, remarkToc],
            rehypePlugins: [rehypeKatex, [rehypeExternalLinks, { target: "_blank" }]],
            shikiConfig: {
                theme: "github-dark",
                // // Enable word wrap to prevent horizontal scrolling
                // wrap: true,
            },
        }),
        sitemap({
            changefreq: "weekly",
            priority: 0.7,
            lastmod: new Date(),
        }),
    ],
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
    },
});
