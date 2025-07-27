import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getItemsRSS } from "../../components/utils";

const articles = getItemsRSS();

export async function GET(context: APIContext) {
    return rss({
        title: "Articles of n4n5",
        description: "RSS feed for public articles by n4n5",
        site: context.site || new URL("https://n4n5.dev"),
        items: articles,
        customData: `<language>en-EN</language>`,
    });
}
