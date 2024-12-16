import { readFile } from "node:fs/promises";
import type { APIContext } from "astro";
import rss from "@astrojs/rss";
import matter from "gray-matter";
import { ContentLoaderRuntime } from "plugin-astro-content";
import { getAllArticles, slugify } from "../../components/utils";

export async function GET(context: APIContext) {
    const mdxArticles: string[] = await ContentLoaderRuntime("website-articles/**/*.mdx");
    const articlesDecoded = await Promise.all(
        mdxArticles.map(async (oneMdx) => {
            return readFile(oneMdx, "utf-8").then((fileContent) => {
                const frontmatter = matter(fileContent);
                return {
                    frontmatter: frontmatter.data,
                    file: oneMdx,
                    url: oneMdx,
                    components: {},
                    Content: () => new Response("Wrong component"),
                    getHeadings: () => [],
                    default: () => new Response("Wrong component"),
                };
            });
        })
    );
    const { articles } = getAllArticles(articlesDecoded);
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
