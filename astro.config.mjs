import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeKatex from "rehype-katex";
import rehypeExternalLinks from "rehype-external-links";
import remarkMath from "remark-math";
import remarkToc from "remark-toc";
import svelte from "@astrojs/svelte";
import { websiteUrl } from "./src/scripts/pages";
import { downloadScript } from "./src/scripts/utils";

await downloadScript({
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css": "leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js": "leaflet.js",
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png": "images/marker-icon.png",
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png": "images/marker-shadow.png",
});

// https://astro.build/config
export default defineConfig({
    site: websiteUrl,
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
            filter: (page) => !page.startsWith(`${websiteUrl}/more/`),
        }),
    ],
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
    },
});
