import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import { getAllArticles, slugify } from "../../components/utils";

export async function GET(context: APIContext) {
    const { articles } = getAllArticles();
    const nonHidden = articles.filter(({ frontmatter: { hidden } }) => !hidden);

    const items = nonHidden.map((post) => ({
        title: post.frontmatter.title,
        pubDate: post.frontmatter.date || new Date(),
        description: post.frontmatter.description || "",
        link: `/articles/${slugify(post.url)}`,
    }));
    return rss({
        title: "Articles of n4n5",
        description: "RSS feed for public articles by n4n5",
        site: context.site || new URL("https://n4n5.dev"),
        items: items,
        customData: `<language>en-EN</language>`,
    });
}
