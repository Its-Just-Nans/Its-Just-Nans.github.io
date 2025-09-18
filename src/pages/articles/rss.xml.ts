import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getItemsRSS } from "@components/utils";
import { pseudo, websiteUrl } from "src/pages";

const articles = getItemsRSS();

export async function GET(context: APIContext) {
    return rss({
        title: `Articles by ${pseudo}`,
        description: `RSS feed for public articles by ${pseudo}`,
        site: context.site || new URL(websiteUrl),
        items: articles,
        customData: `<language>en-EN</language>`,
    });
}
