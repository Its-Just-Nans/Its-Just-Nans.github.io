import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: "https://its-just-nans.github.io",
    integrations: [
        mdx(),
        sitemap({
            changefreq: "weekly",
            lastmod: new Date(),
        }),
    ],
    vite: {
        build: {
            assetsInlineLimit: 0,
        },
    },
});
